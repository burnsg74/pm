// Row shapes and validation for tasks.csv and projects.csv.

export class ValidationError extends Error {}

export const TASK_COLUMNS = [
  "id",
  "title",
  "status",
  "project",
  "context",
  "due",
  "start",
  "starred",
  "waiting_for",
  "waiting_since",
  "notes",
  "created",
  "updated",
  "completed",
];

export const PROJECT_COLUMNS = [
  "id",
  "title",
  "status",
  "outcome",
  "area",
  "notes",
  "created",
  "updated",
  "completed",
];

export const TASK_STATUSES = ["inbox", "next", "waiting", "someday", "done"];
export const PROJECT_STATUSES = ["active", "someday", "done"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

const str = (v) => (v === undefined || v === null ? "" : String(v));

function date(v, label) {
  const s = str(v).trim();
  if (s === "") return "";
  if (!DATE_RE.test(s)) throw new ValidationError(`${label} must be YYYY-MM-DD`);
  return s;
}

function stamp(v, label) {
  // Timestamps are ISO strings; leave them as given if they parse, blank otherwise.
  const s = str(v).trim();
  if (s === "") return "";
  if (Number.isNaN(Date.parse(s))) throw new ValidationError(`${label} must be a date`);
  return s;
}

function common(input) {
  if (!input || typeof input !== "object") throw new ValidationError("Row must be an object");
  const id = str(input.id).trim();
  if (!ID_RE.test(id)) throw new ValidationError("id is required (letters, digits, - and _)");
  const title = str(input.title).replace(/\s+/g, " ").trim();
  if (!title) throw new ValidationError("title is required");
  return { id, title };
}

export function normalizeTask(input) {
  const { id, title } = common(input);
  const status = str(input.status).trim() || "inbox";
  if (!TASK_STATUSES.includes(status)) throw new ValidationError(`status must be one of ${TASK_STATUSES.join(", ")}`);
  const starred = ["1", "true", "yes"].includes(str(input.starred).toLowerCase()) ? "1" : "";
  return {
    id,
    title,
    status,
    project: str(input.project).trim(),
    context: str(input.context).trim().replace(/^@/, "").toLowerCase(),
    due: date(input.due, "due"),
    start: date(input.start, "start"),
    starred,
    waiting_for: str(input.waiting_for).trim(),
    waiting_since: date(input.waiting_since, "waiting_since"),
    notes: str(input.notes).replace(/\r\n/g, "\n"),
    created: stamp(input.created, "created"),
    updated: stamp(input.updated, "updated"),
    completed: stamp(input.completed, "completed"),
  };
}

export function normalizeProject(input) {
  const { id, title } = common(input);
  const status = str(input.status).trim() || "active";
  if (!PROJECT_STATUSES.includes(status)) throw new ValidationError(`status must be one of ${PROJECT_STATUSES.join(", ")}`);
  return {
    id,
    title,
    status,
    outcome: str(input.outcome).trim(),
    area: str(input.area).trim(),
    notes: str(input.notes).replace(/\r\n/g, "\n"),
    created: stamp(input.created, "created"),
    updated: stamp(input.updated, "updated"),
    completed: stamp(input.completed, "completed"),
  };
}

export const KINDS = {
  task: { file: "tasks.csv", columns: TASK_COLUMNS, normalize: normalizeTask },
  project: { file: "projects.csv", columns: PROJECT_COLUMNS, normalize: normalizeProject },
};
