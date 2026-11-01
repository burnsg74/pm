// Quick-capture syntax. Tokens are only recognised at a word boundary, so "a@b.com" stays text.
//   @context          @calls
//   #project          #home  (matches a project by slug prefix / substring: "Home office setup")
//   due:<date>        due:fri  due:+3d  due:nov-5
//   start:<date>      defer / tickler date
//   &name             waiting for someone (status becomes waiting): &sam  &Sam-Lee
//   !                 star it
import { parseDate } from "./dates.js";

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function findProject(projects, query) {
  const q = slug(query);
  if (!q) return null;
  const live = projects.filter((p) => p.status !== "done");
  const pools = [live, projects];
  for (const pool of pools) {
    const exact = pool.find((p) => slug(p.title) === q);
    if (exact) return exact;
    const prefix = pool.find((p) => slug(p.title).startsWith(q));
    if (prefix) return prefix;
    const word = pool.find((p) => slug(p.title).split("-").some((w) => w.startsWith(q)));
    if (word) return word;
    const sub = pool.find((p) => slug(p.title).includes(q));
    if (sub) return sub;
  }
  return null;
}

/**
 * @param {string} text
 * @param {{ projects?: object[], today?: string }} ctx
 * @returns {{ title: string, context?: string, project?: string, projectTitle?: string, due?: string, start?: string,
 *             starred?: boolean, waiting_for?: string, status?: string, notes?: string }}
 */
export function parseCapture(text, { projects = [], today } = {}) {
  const out = {};
  const kept = [];

  // "title -- notes" keeps everything after the first " -- " as notes.
  let body = text;
  const split = body.indexOf(" -- ");
  if (split !== -1) {
    out.notes = body.slice(split + 4).trim();
    body = body.slice(0, split);
  }

  for (const word of body.trim().split(/\s+/)) {
    let m;
    if ((m = /^@([\w-]+)$/.exec(word))) {
      out.context = m[1].toLowerCase();
    } else if ((m = /^#([\w-]+)$/.exec(word))) {
      const project = findProject(projects, m[1]);
      if (project) {
        out.project = project.id;
        out.projectTitle = project.title;
      } else kept.push(word);
    } else if ((m = /^(due|start):(.+)$/i.exec(word))) {
      const raw = m[2];
      const iso = parseDate(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : raw.replace(/-/g, " "), today);
      if (iso === null) kept.push(word);
      else out[m[1].toLowerCase()] = iso;
    } else if ((m = /^&([\w-]+)$/.exec(word))) {
      out.waiting_for = m[1].replace(/-/g, " ");
      out.status = "waiting";
    } else if (word === "!") {
      out.starred = true;
    } else {
      kept.push(word);
    }
  }

  out.title = kept.join(" ").trim();
  return out;
}
