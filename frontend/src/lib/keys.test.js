import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { KeyResolver, normalizeKey, parseSequence } from "./keys.js";

const ev = (key, mods = {}) => ({ key, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, ...mods });

describe("normalizeKey", () => {
  test("plain and shifted characters", () => {
    assert.equal(normalizeKey(ev("j")), "j");
    assert.equal(normalizeKey(ev("G", { shiftKey: true })), "G");
    assert.equal(normalizeKey(ev(":", { shiftKey: true })), ":");
  });
  test("specials", () => {
    assert.equal(normalizeKey(ev("Escape")), "<Esc>");
    assert.equal(normalizeKey(ev("Enter")), "<CR>");
    assert.equal(normalizeKey(ev(" ")), "<Space>");
    assert.equal(normalizeKey(ev("ArrowDown")), "<Down>");
  });
  test("modifiers", () => {
    assert.equal(normalizeKey(ev("d", { ctrlKey: true })), "<C-d>");
    assert.equal(normalizeKey(ev("p", { metaKey: true })), "<D-p>");
    assert.equal(normalizeKey(ev("P", { metaKey: true, shiftKey: true })), "<D-S-p>");
  });
  test("bare modifier presses are ignored", () => {
    assert.equal(normalizeKey(ev("Shift", { shiftKey: true })), null);
    assert.equal(normalizeKey(ev("Meta", { metaKey: true })), null);
  });
});

describe("parseSequence", () => {
  test("splits specials", () => {
    assert.deepEqual(parseSequence("gg"), ["g", "g"]);
    assert.deepEqual(parseSequence("<C-d>"), ["<C-d>"]);
    assert.deepEqual(parseSequence("<Space>p"), ["<Space>", "p"]);
  });
});

describe("KeyResolver", () => {
  const make = () => new KeyResolver({ j: "down", gg: "top", G: "bottom", dd: "delete", mn: "to-next", "<C-d>": "half-down", "<Space>p": "open" });

  test("single key matches immediately", () => {
    const r = make();
    assert.deepEqual(r.feed("j"), { type: "match", action: "down", count: null, keys: ["j"] });
  });
  test("multi-key sequence is pending, then matches", () => {
    const r = make();
    assert.equal(r.feed("g").type, "pending");
    assert.equal(r.pending, "g");
    assert.equal(r.feed("g").action, "top");
    assert.equal(r.pending, "");
  });
  test("counts", () => {
    const r = make();
    assert.equal(r.feed("1").type, "pending");
    assert.equal(r.feed("2").type, "pending");
    const m = r.feed("j");
    assert.equal(m.count, 12);
    assert.equal(m.action, "down");
  });
  test("0 alone is not a count start", () => {
    const r = new KeyResolver({ 0: "line-start" });
    assert.equal(r.feed("0").action, "line-start");
  });
  test("unknown continuation resets", () => {
    const r = make();
    r.feed("g");
    assert.equal(r.feed("x").type, "none");
    assert.equal(r.feed("j").action, "down");
  });
  test("Esc cancels a pending sequence and count", () => {
    const r = make();
    r.feed("3");
    r.feed("d");
    r.feed("<Esc>");
    assert.equal(r.pending, "");
    assert.equal(r.feed("j").count, null);
  });
  test("completions lists what can follow the pending keys", () => {
    const r = new KeyResolver({ gi: "inbox", gn: "next", dd: "delete", j: "down" });
    assert.deepEqual(r.completions(), []);
    r.feed("g");
    assert.deepEqual(r.completions().map((c) => c.key).sort(), ["i", "n"]);
  });
  test("modifier and leader sequences", () => {
    const r = make();
    assert.equal(r.feed("<C-d>").action, "half-down");
    r.feed("<Space>");
    assert.equal(r.feed("p").action, "open");
  });
});
