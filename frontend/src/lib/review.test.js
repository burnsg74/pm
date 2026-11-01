import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { REVIEW_STEPS, lastReviewDate, reviewMarkdown } from "./review.js";

const stats = {
  inbox: 2,
  overdue: [{ title: "Call dentist" }],
  stalled: [{ title: "Renew passport" }],
  staleWaiting: [{ title: "Chair delivery", waiting_for: "Office Co", waiting_since: "2026-10-20" }],
  upcoming: [{ title: "Book flights", start: "2026-11-08", due: "" }],
  someday: 3,
  activeProjects: 4,
  nextActions: 7,
  doneThisWeek: 5,
};

describe("review", () => {
  test("every step belongs to one of the three GTD phases", () => {
    assert.deepEqual([...new Set(REVIEW_STEPS.map((s) => s.group))], ["Get Clear", "Get Current", "Get Creative"]);
    for (const s of REVIEW_STEPS) assert.ok(s.go || s.act, s.id);
  });

  test("markdown has frontmatter, checklist, and attention lists", () => {
    const md = reviewMarkdown({ date: "2026-10-31", stats, checked: ["inbox"], notes: "Felt good." });
    assert.match(md, /^---\ntype: weekly-review\ndate: 2026-10-31\ninbox: 2\n/);
    assert.match(md, /- \[x\] Process the inbox to zero \(2 in inbox\)/);
    assert.match(md, /- \[ \] Review Next Actions \(7 available\)/);
    assert.match(md, /## Stalled projects\n- Renew passport/);
    assert.match(md, /- Chair delivery \(Office Co, since 2026-10-20\)/);
    assert.match(md, /## Notes\nFelt good\.\n$/);
  });

  test("empty attention lists are omitted", () => {
    const md = reviewMarkdown({ date: "2026-10-31", stats: { ...stats, stalled: [], overdue: [], staleWaiting: [], upcoming: [] }, checked: [], notes: "" });
    assert.doesNotMatch(md, /## Stalled/);
    assert.doesNotMatch(md, /## Notes/);
  });

  test("lastReviewDate picks the newest review file", () => {
    const files = [{ path: "reviews/2026-10-17.md" }, { path: "reviews/2026-10-24.md" }, { path: "reviews/README.md" }, { path: "tasks.csv" }];
    assert.equal(lastReviewDate(files), "2026-10-24");
    assert.equal(lastReviewDate([]), "");
  });
});
