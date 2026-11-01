// Vim-style key handling: normalise KeyboardEvents to tokens, resolve multi-key sequences with counts.
//
// Tokens: plain keys are themselves ("j", "G", ":", "?"); specials are "<Esc>", "<CR>", "<Space>", "<Tab>", "<BS>",
// "<Up>"...; modifiers wrap them: "<C-d>" (ctrl), "<D-p>" (cmd), "<D-S-p>" (cmd+shift), "<M-x>" (alt).
// Sequences are strings like "gg", "dd", "mn", "<C-d>", "<Space>p".

const SPECIAL = {
  Escape: "Esc",
  Enter: "CR",
  " ": "Space",
  Tab: "Tab",
  Backspace: "BS",
  Delete: "Del",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
};

export function normalizeKey(e) {
  if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return null;
  const special = SPECIAL[e.key];
  const mods = [];
  if (e.metaKey) mods.push("D");
  if (e.ctrlKey) mods.push("C");
  if (e.altKey) mods.push("M");
  if (special) {
    if (e.shiftKey) mods.push("S");
    return `<${[...mods, special].join("-")}>`;
  }
  if (mods.length) {
    if (e.shiftKey) mods.push("S");
    return `<${[...mods, e.key.length === 1 ? e.key.toLowerCase() : e.key].join("-")}>`;
  }
  return e.key; // already reflects shift ("G", ":", "?")
}

/** "gg<C-d>" -> ["g", "g", "<C-d>"] */
export function parseSequence(seq) {
  return seq.match(/<[^>]+>|./g) ?? [];
}

/**
 * Stateful resolver. Bindings must be prefix-free (no sequence is the start of another), which keeps behaviour
 * instant, with no timeout like vim's `timeoutlen`.
 */
export class KeyResolver {
  /** @param {Record<string, string>} bindings sequence -> action id */
  constructor(bindings) {
    this.table = new Map();
    for (const [seq, action] of Object.entries(bindings)) this.table.set(parseSequence(seq).join("\u0000"), action);
    this.entries = Object.entries(bindings).map(([seq, action]) => ({ tokens: parseSequence(seq), action }));
    this.prefixes = new Set();
    for (const seq of Object.keys(bindings)) {
      const toks = parseSequence(seq);
      for (let i = 1; i < toks.length; i++) this.prefixes.add(toks.slice(0, i).join("\u0000"));
    }
    this.reset();
  }

  reset() {
    this.keys = [];
    this.count = "";
  }

  /** Text for the status bar: "12g". */
  get pending() {
    return this.count + this.keys.join("");
  }

  /** What can follow the keys typed so far: [{ key, action }], for the which-key popup. */
  completions() {
    const n = this.keys.length;
    if (n === 0) return [];
    return this.entries
      .filter((e) => e.tokens.length > n && this.keys.every((k, i) => e.tokens[i] === k))
      .map((e) => ({ key: e.tokens.slice(n).join(""), action: e.action }));
  }

  /**
   * @returns {{ type: "match", action: string, count: number | null, keys: string[] }
   *   | { type: "pending" } | { type: "none" }}
   */
  feed(key) {
    if (key === "<Esc>") {
      const had = this.pending !== "";
      this.reset();
      return had ? { type: "none" } : { type: "none", idle: true };
    }

    if (this.keys.length === 0 && /^[0-9]$/.test(key) && (key !== "0" || this.count !== "")) {
      this.count += key;
      return { type: "pending" };
    }

    this.keys.push(key);
    const joined = this.keys.join("\u0000");
    const action = this.table.get(joined);
    if (action) {
      const out = { type: "match", action, count: this.count ? Number(this.count) : null, keys: [...this.keys] };
      this.reset();
      return out;
    }
    if (this.prefixes.has(joined)) return { type: "pending" };
    this.reset();
    return { type: "none" };
  }
}
