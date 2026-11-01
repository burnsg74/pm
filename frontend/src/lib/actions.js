// The action registry. One list drives the key bindings, the command palette (Cmd+Shift+P), the help sheet (?)
// and the which-key popup, so they can never disagree.
import { app } from "./state.svelte.js";
import { VIEWS } from "./model.js";
import { KeyResolver } from "./keys.js";

/** @type {{ id: string, title: string, group: string, keys: string[], run: (ctx: { count: number | null }) => void, palette?: boolean }[]} */
export const actions = [];

function def(id, title, group, keys, run, opts = {}) {
  actions.push({ id, title, group, keys: [].concat(keys), run, ...opts });
}

const n = (ctx) => ctx.count ?? 1;

// ---------------------------------------------------------------- navigate
def("nav.down", "Move down", "Move", ["j", "<Down>"], (c) => app.navDown(n(c)), { palette: false });
def("nav.up", "Move up", "Move", ["k", "<Up>"], (c) => app.navUp(n(c)), { palette: false });
def("nav.left", "Left / focus sidebar", "Move", ["h", "<Left>"], (c) => app.navLeft(n(c)), { palette: false });
def("nav.right", "Right / open", "Move", ["l", "<Right>"], (c) => app.navRight(n(c)), { palette: false });
def("nav.top", "Top (or line N)", "Move", ["gg", "<Home>"], (c) => app.navTop(c.count), { palette: false });
def("nav.bottom", "Bottom (or line N)", "Move", ["G", "<End>"], (c) => app.navBottom(c.count), { palette: false });
def("nav.halfDown", "Half page down", "Move", "<C-d>", () => app.halfPage(1), { palette: false });
def("nav.halfUp", "Half page up", "Move", "<C-u>", () => app.halfPage(-1), { palette: false });
def("nav.open", "Open / edit", "Move", "<CR>", () => app.openSelected(), { palette: false });
def("nav.back", "Back to previous view", "Move", ["<BS>", "-"], () => app.back());
def("focus.sidebar", "Focus sidebar", "Move", "<C-h>", () => app.focusSidebar());
def("focus.main", "Focus list", "Move", "<C-l>", () => app.focusMain());
def("focus.toggle", "Calendar: toggle grid / day tasks", "Move", "<Tab>", () => app.toggleCalFocus(), { palette: false });

// ---------------------------------------------------------------- go to
for (const v of VIEWS) def(`go.${v.id}`, `Go to ${v.label}`, "Go to", `g${v.key}`, () => app.go(v.id));
def("view.next", "Next view", "Go to", "]", () => app.cycleView(1), { palette: false });
def("view.prev", "Previous view", "Go to", "[", () => app.cycleView(-1), { palette: false });

// ---------------------------------------------------------------- capture & edit
def("task.add", "Capture a task here", "Capture & edit", ["a", "i", "o", "O"], () => app.capture());
def("task.addInbox", "Capture to Inbox", "Capture & edit", "A", () => app.capture({ inbox: true }));
def("project.new", "New project", "Capture & edit", "<Space>n", () => app.newProject());
def("task.edit", "Edit title", "Capture & edit", "e", () => app.editTitle());
def("task.notes", "Edit notes", "Capture & edit", "E", () => app.editNotes());
def("project.outcome", "Edit project outcome", "Capture & edit", "co", () => app.editOutcome());
def("task.done", "Toggle done", "Capture & edit", "x", () => app.toggleDone());
def("task.star", "Toggle star", "Capture & edit", "*", () => app.toggleStar());
def("task.delete", "Delete", "Capture & edit", "dd", () => app.deleteTargets());
def("edit.undo", "Undo", "Capture & edit", "u", () => app.undo());
def("edit.redo", "Redo", "Capture & edit", "<C-r>", () => app.redo());
def("select.visual", "Visual mode: select a range", "Capture & edit", "v", () => app.toggleVisual());

// ---------------------------------------------------------------- organize (GTD)
def("task.project", "Set project…", "Organize", "p", () => app.pickProject());
def("task.context", "Set context…", "Organize", "@", () => app.pickContext());
def("task.due", "Set due date…", "Organize", "t", () => app.promptDate("due"));
def("task.start", "Set start / tickler date…", "Organize", "T", () => app.promptDate("start"));
def("task.waiting", "Waiting for…", "Organize", "W", () => app.promptWaiting());
def("move.inbox", "Move to Inbox", "Organize", "mi", () => app.setStatus("inbox"));
def("move.next", "Move to Next Actions", "Organize", "mn", () => app.setStatus("next"));
def("move.waiting", "Move to Waiting For", "Organize", "mw", () => app.setStatus("waiting"));
def("move.someday", "Move to Someday / Maybe", "Organize", "ms", () => app.setStatus("someday"));
def("move.done", "Move to Done", "Organize", "md", () => app.setStatus("done"));
def("move.active", "Activate project", "Organize", "ma", () => app.setStatus("next"));
def("inbox.process", "Process inbox (clarify one by one)", "Organize", "P", () => app.startProcess());
def("review.complete", "Complete weekly review…", "Organize", "C", () => app.completeReview());

// ---------------------------------------------------------------- filter
def("filter.search", "Filter list…", "Filter", "/", () => app.search());
def("filter.context", "Filter by context…", "Filter", "f", () => app.filterByContext());
def("filter.project", "Filter by project…", "Filter", "F", () => app.filterByProject());
def("filter.clear", "Clear filters", "Filter", "<Space>x", () => {
  app.filter = { context: "", project: "", text: "" };
});

// ---------------------------------------------------------------- calendar
def("cal.today", "Calendar: jump to today", "Calendar", ".", () => app.view === "calendar" && app.calToday());
def("cal.mode", "Calendar: month / week / agenda", "Calendar", "V", () => app.view === "calendar" && app.cycleCalMode());
def("cal.prevMonth", "Calendar: previous month", "Calendar", "H", () => app.view === "calendar" && app.calMonth(-1));
def("cal.nextMonth", "Calendar: next month", "Calendar", "L", () => app.view === "calendar" && app.calMonth(1));

// ---------------------------------------------------------------- meta
def("palette.open", "Quick open (tasks, projects, views)", "App", ["<D-p>", "<C-p>", "<Space>p", "<Space><Space>"], () => app.openQuickOpen());
def("palette.commands", "Command palette", "App", ["<D-S-p>", "<C-S-p>", ":", "<Space>c"], () => app.openCommands());
def("help.open", "Keyboard shortcuts", "App", ["?", "<Space>?"], () => (app.helpOpen = true));
def("ui.sidebar", "Toggle sidebar", "App", ["<Space>b", "<D-b>"], () => app.toggleSidebar());
def("ui.detail", "Toggle detail pane", "App", "<Space>d", () => app.toggleDetail());
def("ui.theme", "Toggle light / dark theme", "App", "<Space>t", () => app.toggleTheme());
def("app.refresh", "Reload from disk", "App", "<Space>r", async () => {
  await app.load();
  app.flash("Reloaded from disk");
});

export const byId = Object.fromEntries(actions.map((a) => [a.id, a]));

/** sequence -> action id, for the resolver. */
export const bindings = Object.fromEntries(actions.flatMap((a) => a.keys.map((k) => [k, a.id])));

export const resolver = new KeyResolver(bindings);

/** Pretty key label for a sequence: "<C-d>" -> "⌃D", "<Space>p" -> "␣ p". */
export function prettyKeys(seq) {
  const toks = seq.match(/<[^>]+>|./g) ?? [];
  return toks
    .map((t) => {
      if (!t.startsWith("<")) return t;
      const inner = t.slice(1, -1).split("-");
      const key = inner.pop();
      const mods = inner.map((m) => ({ D: "⌘", C: "⌃", M: "⌥", S: "⇧" })[m] ?? m).join("");
      const name = { CR: "↵", Esc: "esc", Space: "␣", Tab: "⇥", BS: "⌫", Up: "↑", Down: "↓", Left: "←", Right: "→", Home: "Home", End: "End" }[key] ?? key.toUpperCase();
      return mods + name;
    })
    .join(" ");
}

/** Run an action by id with a count. */
export function run(id, count = null) {
  byId[id]?.run({ count });
}
