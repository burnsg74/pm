// Subsequence fuzzy matcher for the quick launcher. Rewards consecutive runs, word starts and early matches.

function scoreFrom(q, t, startAt) {
  const indices = [];
  let score = 0;
  let ti = startAt;
  let prev = -2;

  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return null;
    let bonus = 1;
    if (found === prev + 1) bonus += 5; // consecutive
    const before = found === 0 ? " " : t[found - 1];
    if (/[\s\-_/.:@#]/.test(before)) bonus += 4; // word start
    if (found === 0) bonus += 3;
    score += bonus - Math.min(found * 0.02, 1);
    indices.push(found);
    prev = found;
    ti = found + 1;
  }

  // Prefer tighter matches and shorter strings.
  score -= (indices[indices.length - 1] - indices[0] - (q.length - 1)) * 0.15;
  score -= t.length * 0.01;
  return { score, indices };
}

/** @returns {{ score: number, indices: number[] } | null} */
export function fuzzyMatch(query, text) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (q === "") return { score: 0, indices: [] };
  const t = text.toLowerCase();

  // Greedy-from-leftmost can lock onto a poor first letter, so try each occurrence of it and keep the best.
  let best = null;
  for (let start = t.indexOf(q[0]); start !== -1; start = t.indexOf(q[0], start + 1)) {
    const m = scoreFrom(q, t, start);
    if (!m) break; // later starts only have fewer characters left
    if (!best || m.score > best.score) best = m;
  }
  if (!best) return null;
  if (t.includes(q)) best.score += 6; // contiguous substring
  return best;
}

/** Filter and rank items by fuzzy score. Stable for an empty query. */
export function fuzzyFilter(items, query, getText = (x) => x) {
  if (!query.trim()) return items.map((item) => ({ item, score: 0, indices: [] }));
  const out = [];
  for (const item of items) {
    const m = fuzzyMatch(query, getText(item));
    if (m) out.push({ item, score: m.score, indices: m.indices });
  }
  return out.sort((a, b) => b.score - a.score);
}
