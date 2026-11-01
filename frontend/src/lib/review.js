// Weekly review (David Allen): Get Clear, Get Current, Get Creative. Steps are the "items" of the Review view.
import { formatLong } from "./dates.js";

/**
 * `go` is a view id to jump to; `act` is a named app action ("capture", "process").
 * `stat(stats)` returns the live number shown beside the step and `ok(stats)` whether it is already satisfied.
 */
export const REVIEW_STEPS = [
  { id: "collect", group: "Get Clear", title: "Collect loose papers and materials", detail: "Gather anything lying around into the inbox.", act: "capture" },
  { id: "inbox", group: "Get Clear", title: "Process the inbox to zero", detail: "Clarify every item: next action, project, waiting, someday, or trash.", act: "process", stat: (s) => `${s.inbox} in inbox`, ok: (s) => s.inbox === 0 },
  { id: "sweep", group: "Get Clear", title: "Empty your head (mind sweep)", detail: "Capture every open loop, commitment and idea still in your head.", act: "capture" },
  { id: "next", group: "Get Current", title: "Review Next Actions", detail: "Mark off what's done. Add what's missing.", go: "next", stat: (s) => `${s.nextActions} available` },
  { id: "past", group: "Get Current", title: "Review past dates", detail: "Anything overdue needs doing, rescheduling or dropping.", go: "today", stat: (s) => `${s.overdue.length} overdue`, ok: (s) => s.overdue.length === 0 },
  { id: "upcoming", group: "Get Current", title: "Review upcoming calendar (14 days)", detail: "What needs preparing for?", go: "calendar", stat: (s) => `${s.upcoming.length} coming up` },
  { id: "waiting", group: "Get Current", title: "Review Waiting For", detail: "Nudge anyone you've been waiting on for 7+ days.", go: "waiting", stat: (s) => `${s.staleWaiting.length} stale`, ok: (s) => s.staleWaiting.length === 0 },
  { id: "projects", group: "Get Current", title: "Review Projects: every one has a next action", detail: "Stalled projects need a next action, someday status, or to be dropped.", go: "projects", stat: (s) => `${s.stalled.length} stalled`, ok: (s) => s.stalled.length === 0 },
  { id: "someday", group: "Get Creative", title: "Review Someday / Maybe", detail: "Promote anything you're ready to commit to. Drop what's stale.", go: "someday", stat: (s) => `${s.someday} parked` },
  { id: "creative", group: "Get Creative", title: "Be creative and courageous", detail: "Any new ideas, projects or bold moves? Capture them.", act: "capture" },
];

/** Markdown record of a completed review, written to reviews/YYYY-MM-DD.md. */
export function reviewMarkdown({ date, stats, checked, notes, tasks, projects }) {
  const lines = [
    "---",
    "type: weekly-review",
    `date: ${date}`,
    `inbox: ${stats.inbox}`,
    `next_actions: ${stats.nextActions}`,
    `active_projects: ${stats.activeProjects}`,
    `stalled_projects: ${stats.stalled.length}`,
    `overdue: ${stats.overdue.length}`,
    `done_this_week: ${stats.doneThisWeek}`,
    "---",
    `# Weekly review: ${formatLong(date)} ${date.slice(0, 4)}`,
    "",
  ];

  let group = "";
  for (const step of REVIEW_STEPS) {
    if (step.group !== group) {
      if (group) lines.push("");
      group = step.group;
      lines.push(`## ${group}`);
    }
    lines.push(`- [${checked.includes(step.id) ? "x" : " "}] ${step.title}${step.stat ? ` (${step.stat(stats)})` : ""}`);
  }

  const title = (list) => list.map((t) => `- ${t.title}`);
  const sections = [
    ["Stalled projects", stats.stalled.map((p) => `- ${p.title}`)],
    ["Overdue", title(stats.overdue)],
    ["Waiting for 7+ days", stats.staleWaiting.map((t) => `- ${t.title} (${t.waiting_for || "?"}, since ${t.waiting_since})`)],
    ["Coming up", stats.upcoming.map((t) => `- ${t.title} (${[t.start && `start ${t.start}`, t.due && `due ${t.due}`].filter(Boolean).join(", ")})`)],
  ];
  for (const [heading, items] of sections) {
    if (!items.length) continue;
    lines.push("", `## ${heading}`, ...items);
  }

  if (notes?.trim()) lines.push("", "## Notes", notes.trim());
  return lines.join("\n") + "\n";
}

/** Date of the most recent review file in a /api/files listing, or "". */
export function lastReviewDate(files) {
  let best = "";
  for (const f of files) {
    const m = /^reviews\/(\d{4}-\d{2}-\d{2})\.md$/.exec(f.path);
    if (m && m[1] > best) best = m[1];
  }
  return best;
}
