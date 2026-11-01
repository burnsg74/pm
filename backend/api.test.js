import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { parseCsv, stringifyCsv } from "./csv.js";
import { createApp } from "./server.js";

let dir;
let server;
let base;

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "pm-test-"));
  server = createApp({ mode: "test", dir });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections?.();
  await new Promise((r) => server.close(r));
  await rm(dir, { recursive: true, force: true });
});

const call = async (method, p, body) => {
  const res = await fetch(base + p, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
};

describe("csv", () => {
  test("round-trips quotes, commas and newlines", () => {
    const text = stringifyCsv(["a", "b"], [["x,y", 'say "hi"\nthere'], ["", " padded "]]);
    assert.deepEqual(parseCsv(text), [
      ["a", "b"],
      ["x,y", 'say "hi"\nthere'],
      ["", " padded "],
    ]);
  });
});

describe("api", () => {
  test("health", async () => {
    const { status, json } = await call("GET", "/api/health");
    assert.equal(status, 200);
    assert.equal(json.ok, true);
  });

  test("empty state when no files exist", async () => {
    const { json } = await call("GET", "/api/state");
    assert.deepEqual(json, { tasks: [], projects: [] });
  });

  test("batch put, update, delete", async () => {
    const put = (row) => ({ kind: "task", type: "put", row });
    let r = await call("POST", "/api/batch", {
      ops: [
        { kind: "project", type: "put", row: { id: "p1", title: "Ship PM", outcome: "It runs on pm.localhost" } },
        put({ id: "t1", title: "Write\nthe  tests", status: "next", project: "p1", context: "@Computer", due: "2026-11-05", notes: "line1\nline2, with comma" }),
        put({ id: "t2", title: "Call mum", status: "waiting", waiting_for: "Mum" }),
      ],
    });
    assert.equal(r.status, 200);
    assert.equal(r.json.applied, 3);

    let { json } = await call("GET", "/api/state");
    assert.equal(json.tasks.length, 2);
    assert.equal(json.tasks[0].title, "Write the tests"); // whitespace collapsed
    assert.equal(json.tasks[0].context, "computer"); // @ stripped, lowercased
    assert.equal(json.tasks[0].notes, "line1\nline2, with comma"); // multiline notes survive the CSV
    assert.equal(json.projects[0].status, "active"); // default

    await call("POST", "/api/batch", { ops: [put({ id: "t1", title: "Write the tests", status: "done", completed: "2026-10-31T10:00:00.000Z" })] });
    ({ json } = await call("GET", "/api/state"));
    assert.equal(json.tasks.length, 2); // replaced, not duplicated
    assert.equal(json.tasks.find((t) => t.id === "t1").status, "done");

    await call("POST", "/api/batch", { ops: [{ kind: "task", type: "del", id: "t2" }] });
    ({ json } = await call("GET", "/api/state"));
    assert.deepEqual(json.tasks.map((t) => t.id), ["t1"]);

    const csv = await readFile(path.join(dir, "tasks.csv"), "utf8");
    assert.match(csv, /^id,title,status,project,context,due,start,starred,/);
  });

  test("a bad op rejects the whole batch", async () => {
    const before = (await call("GET", "/api/state")).json;
    const r = await call("POST", "/api/batch", {
      ops: [
        { kind: "task", type: "put", row: { id: "ok1", title: "Fine" } },
        { kind: "task", type: "put", row: { id: "bad", title: "Bad", status: "banana" } },
      ],
    });
    assert.equal(r.status, 400);
    assert.deepEqual((await call("GET", "/api/state")).json, before);
  });

  test("rejects bad dates and missing titles", async () => {
    let r = await call("POST", "/api/batch", { ops: [{ kind: "task", type: "put", row: { id: "x", title: "T", due: "tomorrow" } }] });
    assert.equal(r.status, 400);
    r = await call("POST", "/api/batch", { ops: [{ kind: "task", type: "put", row: { id: "x", title: "  " } }] });
    assert.equal(r.status, 400);
  });

  test("concurrent batches do not lose writes", async () => {
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        call("POST", "/api/batch", { ops: [{ kind: "task", type: "put", row: { id: `c${i}`, title: `Concurrent ${i}` } }] }),
      ),
    );
    const { json } = await call("GET", "/api/state");
    assert.equal(json.tasks.filter((t) => t.id.startsWith("c")).length, 20);
  });

  test("files: write, list, read markdown with frontmatter", async () => {
    const content = "---\nweek: 2026-W44\ncompleted: 2026-10-31\n---\n# Weekly review\n";
    let r = await call("PUT", "/api/files/reviews/2026-10-31.md", { content });
    assert.equal(r.status, 200);

    r = await call("GET", "/api/files");
    assert.ok(r.json.files.some((f) => f.path === "reviews/2026-10-31.md"));
    assert.ok(r.json.files.some((f) => f.path === "tasks.csv"));

    r = await call("GET", "/api/files/reviews/2026-10-31.md");
    assert.equal(r.json.frontmatter.week, "2026-W44");
    assert.equal(r.json.body, "# Weekly review\n");
  });

  test("files: csv read gives row objects", async () => {
    const r = await call("GET", "/api/files/tasks.csv");
    assert.equal(r.json.type, "csv");
    assert.equal(r.json.rows[0].id, "t1");
  });

  test("files: refuses traversal, absolute paths, hidden files and other types", async () => {
    for (const p of ["/api/files/..%2Fsecret.md", "/api/files/%2Fetc%2Fpasswd.md", "/api/files/a/..%2F..%2Fx.md", "/api/files/.hidden.md", "/api/files/notes.txt"]) {
      const r = await call("PUT", p, { content: "x" });
      assert.equal(r.status, 400, p);
    }
    assert.equal((await call("GET", "/api/files/nope.md")).status, 404);
  });

  test("unknown routes 404", async () => {
    assert.equal((await call("GET", "/api/nothing")).status, 404);
  });
});
