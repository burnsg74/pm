import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { applyFilter, calendarEvents, contextList, projectStats, reviewStats, tasksOnDate, viewCounts, viewTasks } from "./model.js";

const T = "2026-10-31";
const task = (o) => ({ id: o.id, title: o.id, status: "next", project: "", context: "", due: "", start: "", starred: "", waiting_for: "", waiting_since: "", notes: "", created: "2026-10-01T00:00:00Z", completed: "", ...o });
const project = (o) => ({ title: o.id, status: "active", outcome: "", ...o });

const projects = [project({ id: "pa" }), project({ id: "pb" }), project({ id: "ps", status: "someday" }), project({ id: "pd", status: "done" })];
const tasks = [
  task({ id: "in1", status: "inbox" }),
  task({ id: "n-due", due: "2026-11-05", context: "home", project: "pa" }),
  task({ id: "n-star", starred: "1", context: "computer", project: "pa" }),
  task({ id: "n-over", due: "2026-10-29" }),
  task({ id: "n-future", start: "2026-11-10" }),
  task({ id: "n-startnow", start: T }),
  task({ id: "n-somedayproj", project: "ps" }),
  task({ id: "w-old", status: "waiting", waiting_for: "Sam", waiting_since: "2026-10-20", project: "pb" }),
  task({ id: "w-new", status: "waiting", waiting_for: "Jo", waiting_since: "2026-10-30" }),
  task({ id: "s1", status: "someday" }),
  task({ id: "d1", status: "done", completed: "2026-10-30T12:00:00Z", project: "pa" }),
  task({ id: "d2", status: "done", completed: "2026-10-25T12:00:00Z" }),
];
const data = { tasks, projects };
const ids = (list) => list.map((t) => t.id);

describe("views", () => {
  test("inbox", () => assert.deepEqual(ids(viewTasks("inbox", data, T)), ["in1"]));

  test("next: available only, hides future start and someday-project actions, starred then due", () => {
    assert.deepEqual(ids(viewTasks("next", data, T)), ["n-star", "n-over", "n-due", "n-startnow"]);
  });

  test("today: overdue, due today, starting today, starred", () => {
    assert.deepEqual(ids(viewTasks("today", data, T)), ["n-star", "n-over", "n-startnow"]);
  });

  test("waiting is oldest first", () => assert.deepEqual(ids(viewTasks("waiting", data, T)), ["w-old", "w-new"]));

  test("scheduled: future start or due, soonest first", () => {
    assert.deepEqual(ids(viewTasks("scheduled", data, T)), ["n-due", "n-future"]);
  });

  test("someday and done (newest first)", () => {
    assert.deepEqual(ids(viewTasks("someday", data, T)), ["s1"]);
    assert.deepEqual(ids(viewTasks("done", data, T)), ["d1", "d2"]);
  });

  test("project view lists open work before done", () => {
    assert.deepEqual(ids(viewTasks("project:pa", data, T)), ["n-star", "n-due", "d1"]);
  });
});

describe("projects", () => {
  test("stalled = active with no next action and nothing waiting", () => {
    assert.equal(projectStats(projects[0], tasks).stalled, false);
    assert.equal(projectStats(projects[1], tasks).stalled, false); // has a waiting task
    const lonely = project({ id: "pz" });
    assert.equal(projectStats(lonely, tasks).stalled, true);
    assert.equal(projectStats(project({ id: "ps2", status: "someday" }), tasks).stalled, false);
  });
  test("counts", () => {
    const s = projectStats(projects[0], tasks);
    assert.deepEqual({ next: s.next, open: s.open, done: s.done }, { next: 2, open: 2, done: 1 });
  });
});

describe("calendar and filters", () => {
  test("tasksOnDate matches due or start, skips done", () => {
    assert.deepEqual(ids(tasksOnDate(tasks, "2026-11-05")), ["n-due"]);
    assert.deepEqual(ids(tasksOnDate(tasks, "2026-11-10")), ["n-future"]);
    assert.deepEqual(tasksOnDate([task({ id: "x", status: "done", due: T })], T), []);
  });
  test("calendarEvents emits due and start separately", () => {
    const ev = calendarEvents([task({ id: "x", due: "2026-11-05", start: "2026-11-01" })]);
    assert.deepEqual(ev.map((e) => e.extendedProps.kind).sort(), ["due", "start"]);
  });
  test("context / project / text filters", () => {
    const list = viewTasks("next", data, T);
    assert.deepEqual(ids(applyFilter(list, { context: "home" }, projects)), ["n-due"]);
    assert.deepEqual(ids(applyFilter(list, { project: "pa" }, projects)), ["n-star", "n-due"]);
    assert.deepEqual(ids(applyFilter(list, { text: "OVER" }, projects)), ["n-over"]);
    assert.equal(applyFilter(list, null), list);
  });
  test("contextList merges defaults with used contexts", () => {
    const c = contextList(tasks);
    assert.ok(c.find((x) => x.name === "home" && x.count === 1));
    assert.ok(c.find((x) => x.name === "calls"));
  });
});

describe("review", () => {
  test("stats", () => {
    const r = reviewStats(data, T);
    assert.equal(r.inbox, 1);
    assert.deepEqual(ids(r.overdue), ["n-over"]);
    assert.deepEqual(ids(r.staleWaiting), ["w-old"]);
    assert.equal(r.doneThisWeek, 2);
    assert.equal(viewCounts(data, T).stalled, 0);
  });
});
