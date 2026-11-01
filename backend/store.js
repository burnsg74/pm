// File-backed store. Every read goes to disk, so edits made elsewhere (Obsidian, Dropbox) show up on the next
// request. Writes are serialized through one queue and replace files atomically (temp file + rename).
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseCsvObjects, stringifyObjects } from "./csv.js";
import { KINDS, ValidationError } from "./schema.js";

export class NotFoundError extends Error {}
export class PathError extends Error {}

const FILE_EXT = new Set([".md", ".csv"]);
const MAX_LIST = 5000;

export function createStore(dir) {
  const root = path.resolve(dir);
  let queue = Promise.resolve();

  /** Run fn after every earlier write has finished. */
  function serial(fn) {
    const run = queue.then(fn, fn);
    queue = run.catch(() => {});
    return run;
  }

  async function atomicWrite(file, text) {
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, text, "utf8");
    await rename(tmp, file);
  }

  async function readKind(kind) {
    const spec = KINDS[kind];
    let text;
    try {
      text = await readFile(path.join(root, spec.file), "utf8");
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
    // Rows edited by hand may be sloppy: normalize what we can, skip what we can't.
    const rows = [];
    for (const raw of parseCsvObjects(text)) {
      try {
        rows.push(spec.normalize(raw));
      } catch (err) {
        if (!(err instanceof ValidationError)) throw err;
      }
    }
    return rows;
  }

  async function writeKind(kind, rows) {
    const spec = KINDS[kind];
    await atomicWrite(path.join(root, spec.file), stringifyObjects(spec.columns, rows));
  }

  async function readAll() {
    const [tasks, projects] = await Promise.all([readKind("task"), readKind("project")]);
    return { tasks, projects };
  }

  /**
   * Apply put/del ops in one write per file.
   * op: { kind: "task" | "project", type: "put", row } | { kind, type: "del", id }
   */
  function applyBatch(ops) {
    if (!Array.isArray(ops)) throw new ValidationError("ops must be an array");
    // Validate everything up front so a bad op never leaves a half-applied batch.
    const checked = ops.map((op) => {
      const spec = KINDS[op?.kind];
      if (!spec) throw new ValidationError("op.kind must be task or project");
      if (op.type === "put") return { kind: op.kind, type: "put", row: spec.normalize(op.row) };
      if (op.type === "del") {
        const id = String(op.id ?? "");
        if (!id) throw new ValidationError("del needs an id");
        return { kind: op.kind, type: "del", id };
      }
      throw new ValidationError("op.type must be put or del");
    });

    return serial(async () => {
      const touched = new Set(checked.map((op) => op.kind));
      const data = {};
      for (const kind of touched) data[kind] = await readKind(kind);

      for (const op of checked) {
        const rows = data[op.kind];
        if (op.type === "put") {
          const idx = rows.findIndex((r) => r.id === op.row.id);
          if (idx === -1) rows.push(op.row);
          else rows[idx] = op.row;
        } else {
          const idx = rows.findIndex((r) => r.id === op.id);
          if (idx !== -1) rows.splice(idx, 1);
        }
      }

      for (const kind of touched) await writeKind(kind, data[kind]);
      return { applied: checked.length };
    });
  }

  /** Resolve a vault-relative path inside the data dir; refuse absolute paths, `..`, hidden parts, other types. */
  function resolveSafe(rel) {
    if (typeof rel !== "string" || rel === "" || rel.includes("\0")) throw new PathError("Invalid path");
    if (path.isAbsolute(rel) || rel.startsWith("/") || rel.startsWith("\\")) throw new PathError("Absolute paths are not allowed");
    const parts = rel.split(/[\\/]+/);
    if (parts.some((p) => p === ".." || p === "." || p === "" || p.startsWith("."))) throw new PathError("Invalid path");
    if (!FILE_EXT.has(path.extname(rel).toLowerCase())) throw new PathError("Only .md and .csv files are allowed");
    const full = path.resolve(root, rel);
    if (path.relative(root, full).startsWith("..")) throw new PathError("Path escapes the data directory");
    return full;
  }

  async function listFiles() {
    const out = [];
    async function walk(abs, rel) {
      let entries;
      try {
        entries = await readdir(abs, { withFileTypes: true });
      } catch (err) {
        if (err.code === "ENOENT") return;
        throw err;
      }
      for (const entry of entries) {
        if (entry.name.startsWith(".") || out.length >= MAX_LIST) continue;
        const childRel = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) await walk(path.join(abs, entry.name), childRel);
        else if (entry.isFile() && FILE_EXT.has(path.extname(entry.name).toLowerCase())) {
          const st = await stat(path.join(abs, entry.name));
          out.push({ path: childRel, type: path.extname(entry.name).slice(1).toLowerCase(), size: st.size, mtime: st.mtime.toISOString() });
        }
      }
    }
    await walk(root, "");
    return out.sort((a, b) => a.path.localeCompare(b.path));
  }

  async function readFileEntry(rel) {
    const full = resolveSafe(rel);
    let text;
    try {
      text = await readFile(full, "utf8");
    } catch (err) {
      if (err.code === "ENOENT") throw new NotFoundError(`No such file: ${rel}`);
      throw err;
    }
    if (rel.toLowerCase().endsWith(".csv")) return { path: rel, type: "csv", rows: parseCsvObjects(text) };
    const { frontmatter, body } = splitFrontmatter(text);
    return { path: rel, type: "md", content: text, frontmatter, body };
  }

  /** body: { content } for markdown, { rows } for CSV (columns come from the first row's keys). */
  function writeFileEntry(rel, body) {
    const full = resolveSafe(rel);
    let text;
    if (rel.toLowerCase().endsWith(".csv")) {
      if (!Array.isArray(body?.rows)) throw new ValidationError("CSV files need { rows: [...] }");
      const columns = body.columns ?? Object.keys(body.rows[0] ?? {});
      text = stringifyObjects(columns, body.rows);
    } else {
      if (typeof body?.content !== "string") throw new ValidationError("Markdown files need { content: string }");
      text = body.content;
    }
    return serial(async () => {
      await atomicWrite(full, text);
      return { path: rel, size: Buffer.byteLength(text) };
    });
  }

  async function health() {
    const result = { dir: root, readable: true, writable: true, error: null };
    try {
      await mkdir(root, { recursive: true });
      await readAll();
    } catch (err) {
      result.readable = false;
      result.error = err.message;
    }
    return result;
  }

  return { dir: root, readAll, applyBatch, listFiles, readFileEntry, writeFileEntry, health };
}

/** Split `---\nkey: value\n---` frontmatter from a markdown body. Flat key/value pairs only. */
export function splitFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { frontmatter: {}, body: text };
  const frontmatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) frontmatter[kv[1]] = kv[2].trim();
  }
  return { frontmatter, body: text.slice(m[0].length) };
}
