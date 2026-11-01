import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { findProject, parseCapture } from "./parse.js";

const projects = [
  { id: "p1", title: "Home office setup", status: "active" },
  { id: "p2", title: "Renew passport", status: "active" },
  { id: "p3", title: "Old thing", status: "done" },
];
const T = "2026-10-31";
const parse = (s) => parseCapture(s, { projects, today: T });

describe("findProject", () => {
  test("prefix, word and substring matches", () => {
    assert.equal(findProject(projects, "home").id, "p1");
    assert.equal(findProject(projects, "office").id, "p1");
    assert.equal(findProject(projects, "pass").id, "p2");
    assert.equal(findProject(projects, "home-office-setup").id, "p1");
    assert.equal(findProject(projects, "zzz"), null);
  });
  test("prefers live projects over done ones", () => {
    assert.equal(findProject(projects, "old").id, "p3"); // only match
  });
});

describe("parseCapture", () => {
  test("plain title", () => {
    assert.deepEqual(parse("Buy milk"), { title: "Buy milk" });
  });
  test("all tokens", () => {
    const r = parse("Buy cables @Errands #home due:fri start:+2d !");
    assert.equal(r.title, "Buy cables");
    assert.equal(r.context, "errands");
    assert.equal(r.project, "p1");
    assert.equal(r.due, "2026-11-06");
    assert.equal(r.start, "2026-11-02");
    assert.equal(r.starred, true);
  });
  test("tokens work anywhere in the sentence", () => {
    const r = parse("@calls Phone the bank #pass");
    assert.equal(r.title, "Phone the bank");
    assert.equal(r.project, "p2");
  });
  test("waiting for", () => {
    const r = parse("Quote for arm &Sam-Lee");
    assert.equal(r.status, "waiting");
    assert.equal(r.waiting_for, "Sam Lee");
  });
  test("date with a space via hyphen, ISO dates stay intact", () => {
    assert.equal(parse("x due:nov-20").due, "2026-11-20");
    assert.equal(parse("x due:2027-01-05").due, "2027-01-05");
  });
  test("unknown project or bad date stays in the title", () => {
    const r = parse("Fix #nonexistent due:banana");
    assert.equal(r.title, "Fix #nonexistent due:banana");
    assert.equal(r.project, undefined);
    assert.equal(r.due, undefined);
  });
  test("embedded @ is not a context", () => {
    assert.equal(parse("Email a@b.com").title, "Email a@b.com");
  });
  test("notes after ' -- '", () => {
    const r = parse("Call Sam -- about Thursday, bring the laptop");
    assert.equal(r.title, "Call Sam");
    assert.equal(r.notes, "about Thursday, bring the laptop");
  });
});
