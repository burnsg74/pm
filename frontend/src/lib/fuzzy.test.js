import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { fuzzyFilter, fuzzyMatch } from "./fuzzy.js";

describe("fuzzy", () => {
  test("subsequence matches, non-subsequence does not", () => {
    assert.ok(fuzzyMatch("gtd", "Getting Things Done"));
    assert.equal(fuzzyMatch("xyz", "Getting Things Done"), null);
  });
  test("returns match indices", () => {
    assert.deepEqual(fuzzyMatch("ab", "xaxb").indices, [1, 3]);
  });
  test("ranks prefix / contiguous matches above scattered ones", () => {
    const items = ["Reply to Sam about Thursday", "Review weekly notes", "Renew the passport early"];
    const r = fuzzyFilter(items, "rev").map((x) => x.item);
    assert.equal(r[0], "Review weekly notes");
  });
  test("word-start matches beat mid-word", () => {
    const r = fuzzyFilter(["Book the taxicab", "Buy a cabinet"], "cab").map((x) => x.item);
    assert.equal(r[0], "Buy a cabinet");
  });
  test("picks the best start, not just the leftmost letter", () => {
    const m = fuzzyMatch("cab", "Pickup cable");
    assert.deepEqual(m.indices, [7, 8, 9]);
  });
  test("empty query keeps order", () => {
    assert.deepEqual(fuzzyFilter(["b", "a"], "").map((x) => x.item), ["b", "a"]);
  });
});
