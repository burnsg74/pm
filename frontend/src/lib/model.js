// GTD model: views, selectors and review stats. Pure functions over { tasks, projects } and a `today` string.
import { addDays, daysBetween } from "./dates.js";

export const STATUS_LABEL = { inbox: "Inbox", next: "Next", waiting: "Waiting", someday: "Someday", done: "Done" };

/** Sidebar views, in order. `key` is the `g` + key jump. */
export const VIEWS = [
  { id: "inbox", label: "Inbox", key: "i", icon: "◌", hint: "Capture. Clarify with P" },
  { id: "today", label: "Today", key: "t", icon: "◉", hint: "Due, starting, or starred" },
  { id: "next", label: "Next Actions", key: "n", icon: "▸", hint: "Do these, by context" },
  { id: "waiting", label: "Waiting For", key: "w", icon: "◔", hint: "Delegated, awaiting a reply" },
  { id: "scheduled", label: "Scheduled", key: "s", icon: "◷", hint: "Tickler and upcoming dates" },
  { id: "someday", label: "Someday / Maybe", key: "m", icon: "☁", hint: "Not now, not never" },
  { id: "projects", label: "Projects", key: "p", icon: "▤", hint: "Outcomes needing >1 step" },
  { id: "calendar", label: "Calendar", key: "c", icon: "▦", hint: "Everything with a date" },
  { id: "review", label: "Weekly Review", key: "r", icon: "↻", hint: "Get clear, current, creative" },
  { id: "done", label: "Done", key: "d", icon: "✓", hint: "Completed" },
];

export const DEFAULT_CONTEXTS = ["anywhere", "calls", "computer", "errands", "home", "office"];

export const isOpen = (t) => t.status !== "done";
export const projectOf = (projects, task) => projects.find((p) => p.id === task.project) ?? null;

/** Next actions on a someday or finished project aren't actionable. */
function projectActionable(projects, task) {
  if (!task.project) return true;
  const p = projectOf(projects, task);
  return !p || p.status === "active";
}

const byCreated = (a, b) => (a.created || "").localeCompare(b.created || "");

/** Starred first, then earliest due date, then oldest. */
export function sortActions(a, b) {
  if (a.starred !== b.starred) return a.starred ? -1 : 1;
  if (a.due !== b.due) {
    if (!a.due) return 1;
    if (!b.due) return -1;
    return a.due.localeCompare(b.due);
  }
  return byCreated(a, b);
}

const STATUS_ORDER = { next: 0, waiting: 1, inbox: 2, someday: 3, done: 4 };

/** Available now: a next action whose start date (if any) has arrived. */
export function isAvailable(task, today) {
  return task.status === "next" && (!task.start || task.start <= today);
}

/** Tasks that fall on a calendar day (due or start), excluding finished ones. */
export function tasksOnDate(tasks, date) {
  return tasks.filter((t) => isOpen(t) && (t.due === date || t.start === date)).sort(sortActions);
}

export function viewTasks(viewId, { tasks, projects }, today) {
  if (viewId.startsWith("project:")) {
    const id = viewId.slice(8);
    return tasks
      .filter((t) => t.project === id)
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (a.status === "done" ? (b.completed || "").localeCompare(a.completed || "") : sortActions(a, b)));
  }
  switch (viewId) {
    case "inbox":
      return tasks.filter((t) => t.status === "inbox").sort(byCreated);
    case "today":
      return tasks
        .filter(
          (t) =>
            isOpen(t) &&
            t.status !== "someday" &&
            projectActionable(projects, t) &&
            ((t.due && t.due <= today) || t.start === today || (t.starred && t.status === "next")),
        )
        .sort(sortActions);
    case "next":
      return tasks.filter((t) => isAvailable(t, today) && projectActionable(projects, t)).sort(sortActions);
    case "waiting":
      return tasks.filter((t) => t.status === "waiting").sort((a, b) => (a.waiting_since || "9").localeCompare(b.waiting_since || "9") || byCreated(a, b));
    case "scheduled":
      return tasks
        .filter((t) => isOpen(t) && t.status !== "someday" && ((t.start && t.start > today) || (t.due && t.due > today)))
        .sort((a, b) => nextDate(a, today).localeCompare(nextDate(b, today)) || sortActions(a, b));
    case "someday":
      return tasks.filter((t) => t.status === "someday").sort(byCreated);
    case "done":
      return tasks.filter((t) => t.status === "done").sort((a, b) => (b.completed || "").localeCompare(a.completed || "")).slice(0, 300);
    default:
      return [];
  }
}

/** The soonest future date on a task (start or due), used to order Scheduled. */
export function nextDate(t, today) {
  const dates = [t.start, t.due].filter((d) => d && d > today);
  return dates.sort()[0] ?? "9999-12-31";
}

/** Optional filters layered on top of a view: { context, project, text }. */
export function applyFilter(list, filter, projects = []) {
  if (!filter) return list;
  const text = (filter.text ?? "").trim().toLowerCase();
  return list.filter((t) => {
    if (filter.context && t.context !== filter.context) return false;
    if (filter.project && t.project !== filter.project) return false;
    if (text) {
      const proj = projectOf(projects, t)?.title ?? "";
      const hay = `${t.title} ${t.context} ${proj} ${t.waiting_for} ${t.notes}`.toLowerCase();
      if (!text.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}

export function projectStats(project, tasks) {
  const own = tasks.filter((t) => t.project === project.id);
  const open = own.filter(isOpen);
  const next = open.filter((t) => t.status === "next").length;
  const waiting = open.filter((t) => t.status === "waiting").length;
  return {
    total: own.length,
    open: open.length,
    next,
    waiting,
    done: own.length - open.length,
    // GTD: an active project with nothing to do next and nothing it's waiting on is stalled.
    stalled: project.status === "active" && next === 0 && waiting === 0,
  };
}

export function sortProjects(projects, tasks) {
  const rank = { active: 0, someday: 1, done: 2 };
  return [...projects].sort((a, b) => {
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    return a.title.localeCompare(b.title);
  });
}

/** Sorted list of contexts in use plus the defaults, with how many open tasks use each. */
export function contextList(tasks) {
  const counts = new Map(DEFAULT_CONTEXTS.map((c) => [c, 0]));
  for (const t of tasks) {
    if (!t.context) continue;
    counts.set(t.context, (counts.get(t.context) ?? 0) + (isOpen(t) ? 1 : 0));
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, count }));
}

/** Sidebar badge counts. */
export function viewCounts({ tasks, projects }, today) {
  const stalled = projects.filter((p) => projectStats(p, tasks).stalled).length;
  return {
    inbox: viewTasks("inbox", { tasks, projects }, today).length,
    today: viewTasks("today", { tasks, projects }, today).length,
    next: viewTasks("next", { tasks, projects }, today).length,
    waiting: viewTasks("waiting", { tasks, projects }, today).length,
    scheduled: viewTasks("scheduled", { tasks, projects }, today).length,
    someday: viewTasks("someday", { tasks, projects }, today).length,
    projects: projects.filter((p) => p.status === "active").length,
    stalled,
  };
}

/** Numbers for the weekly review checklist. */
export function reviewStats({ tasks, projects }, today) {
  const data = { tasks, projects };
  const open = tasks.filter(isOpen);
  const stalled = projects.filter((p) => projectStats(p, tasks).stalled);
  const horizon = addDays(today, 14);
  return {
    inbox: viewTasks("inbox", data, today).length,
    overdue: open.filter((t) => t.due && t.due < today && t.status !== "someday"),
    stalled,
    staleWaiting: tasks.filter((t) => t.status === "waiting" && t.waiting_since && daysBetween(t.waiting_since, today) >= 7),
    upcoming: open.filter((t) => t.status !== "someday" && ((t.due && t.due >= today && t.due <= horizon) || (t.start && t.start >= today && t.start <= horizon))),
    someday: tasks.filter((t) => t.status === "someday").length + projects.filter((p) => p.status === "someday").length,
    activeProjects: projects.filter((p) => p.status === "active").length,
    nextActions: viewTasks("next", data, today).length,
    doneThisWeek: tasks.filter((t) => t.status === "done" && t.completed && daysBetween(t.completed.slice(0, 10), today) < 7).length,
  };
}

/** FullCalendar events: one per due date and one per start date of each open task. */
export function calendarEvents(tasks) {
  const events = [];
  for (const t of tasks) {
    if (!isOpen(t)) continue;
    if (t.due) events.push({ id: `${t.id}:due`, title: t.title, start: t.due, allDay: true, classNames: ["ev-due"], extendedProps: { taskId: t.id, kind: "due" } });
    if (t.start) events.push({ id: `${t.id}:start`, title: t.title, start: t.start, allDay: true, classNames: ["ev-start"], extendedProps: { taskId: t.id, kind: "start" } });
  }
  return events;
}

export function newId(prefix = "t") {
  const rand = crypto.getRandomValues(new Uint32Array(2));
  return `${prefix}-${rand[0].toString(36)}${rand[1].toString(36)}`.slice(0, 16);
}
