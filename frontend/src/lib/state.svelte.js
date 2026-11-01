// Central reactive state and every mutation. Components read `app.*`; actions.js binds keys to these methods.
import { api } from "./api.js";
import { addDays, addMonths, endOfMonth, formatDate, formatLong, parseDate, startOfWeek, today as todayISO } from "./dates.js";
import {
  STATUS_LABEL,
  VIEWS,
  applyFilter,
  contextList,
  newId,
  projectOf,
  projectStats,
  reviewStats,
  sortProjects,
  tasksOnDate,
  viewCounts,
  viewTasks,
} from "./model.js";
import { parseCapture } from "./parse.js";
import { REVIEW_STEPS, lastReviewDate, reviewMarkdown } from "./review.js";

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(`pm.${key}`);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`pm.${key}`, JSON.stringify(value));
    } catch {
      /* private mode etc: preferences just won't persist */
    }
  },
};

const EMPTY_FILTER = { context: "", project: "", text: "" };
const HALF_PAGE = 10;

class App {
  // ---- data ----
  tasks = $state.raw([]);
  projects = $state.raw([]);
  files = $state.raw([]);
  loaded = $state(false);
  error = $state("");
  today = $state(todayISO());

  // ---- navigation ----
  view = $state(store.get("view", "inbox"));
  cursor = $state(0);
  sidebarCursor = $state(0);
  focus = $state("main"); // main | sidebar | agenda (calendar day list)
  visualAnchor = $state(null);
  filter = $state({ ...EMPTY_FILTER });
  calDate = $state(todayISO());
  calMode = $state("dayGridMonth");
  sidebarOpen = $state(store.get("sidebar", true));
  detailOpen = $state(store.get("detail", true));
  theme = $state(store.get("theme", "dark"));

  // ---- overlays ----
  prompt = $state(null);
  palette = $state(null);
  helpOpen = $state(false);
  process = $state(null); // { skipped: string[] }
  toast = $state(null);
  pending = $state(""); // keys typed so far, for the status bar
  checked = $state(store.get(`review.${startOfWeek(todayISO())}`, []));

  #history = [];
  #cursors = {};
  #queue = Promise.resolve();
  #inflight = 0;
  #undo = [];
  #redo = [];
  #toastTimer = 0;

  // ================= derived =================
  itemKind = $derived(this.view === "projects" ? "project" : this.view === "review" ? "step" : "task");

  items = $derived.by(() => {
    const data = { tasks: this.tasks, projects: this.projects };
    const f = this.filter;
    switch (this.view) {
      case "review":
        return REVIEW_STEPS;
      case "projects": {
        const text = f.text.trim().toLowerCase();
        return sortProjects(this.projects, this.tasks).filter((p) => !text || `${p.title} ${p.outcome} ${p.area}`.toLowerCase().includes(text));
      }
      case "calendar":
        return applyFilter(tasksOnDate(this.tasks, this.calDate), f, this.projects);
      default:
        return applyFilter(viewTasks(this.view, data, this.today), f, this.projects);
    }
  });

  sel = $derived(Math.max(0, Math.min(this.cursor, this.items.length - 1)));
  selected = $derived(this.items[this.sel] ?? null);
  visualRange = $derived(this.visualAnchor === null ? null : [Math.min(this.visualAnchor, this.sel), Math.max(this.visualAnchor, this.sel)]);
  targets = $derived(this.visualRange ? this.items.slice(this.visualRange[0], this.visualRange[1] + 1) : this.selected ? [this.selected] : []);

  counts = $derived(viewCounts({ tasks: this.tasks, projects: this.projects }, this.today));
  contexts = $derived(contextList(this.tasks));
  stats = $derived(reviewStats({ tasks: this.tasks, projects: this.projects }, this.today));
  lastReview = $derived(lastReviewDate(this.files));

  currentProject = $derived(this.view.startsWith("project:") ? (this.projects.find((p) => p.id === this.view.slice(8)) ?? null) : null);

  viewLabel = $derived.by(() => {
    if (this.currentProject) return this.currentProject.title;
    return VIEWS.find((v) => v.id === this.view)?.label ?? this.view;
  });

  mode = $derived(this.prompt ? "INSERT" : this.palette ? "COMMAND" : this.process ? "PROCESS" : this.visualAnchor !== null ? "VISUAL" : "NORMAL");
  overlay = $derived(Boolean(this.prompt || this.palette || this.helpOpen || this.process));

  // ================= load / sync =================
  async load() {
    try {
      const [state, files] = await Promise.all([api.state(), api.files().catch(() => ({ files: [] }))]);
      this.tasks = state.tasks;
      this.projects = state.projects;
      this.files = files.files;
      this.error = "";
      if (!this.loaded) {
        this.loaded = true;
        if (this.view.startsWith("project:") && !this.currentProject) this.view = "inbox";
        if (!VIEWS.some((v) => v.id === this.view) && !this.view.startsWith("project:")) this.view = "inbox";
        this.sidebarCursor = Math.max(0, VIEWS.findIndex((v) => v.id === (this.view.startsWith("project:") ? "projects" : this.view)));
        if (this.view === "calendar") this.focus = "main";
      }
    } catch (err) {
      this.error = err.message;
    }
  }

  /** Re-read from disk when the tab regains focus (picks up Obsidian / Dropbox edits) unless we're mid-edit. */
  async refresh() {
    this.today = todayISO();
    if (this.#inflight > 0 || this.overlay) return;
    await this.#queue;
    await this.load();
  }

  #send(ops) {
    this.#inflight++;
    this.#queue = this.#queue
      .then(() => api.batch(ops))
      .catch((err) => {
        this.flash(`Save failed: ${err.message}`, "error");
        return this.load();
      })
      .finally(() => {
        this.#inflight--;
      });
  }

  /** Apply ops to local state and queue them for the server. Returns the inverse ops. */
  #apply(ops) {
    let tasks = this.tasks;
    let projects = this.projects;
    const inverse = [];
    for (const op of ops) {
      const isTask = op.kind === "task";
      const list = isTask ? tasks : projects;
      const id = op.type === "put" ? op.row.id : op.id;
      const idx = list.findIndex((r) => r.id === id);
      const existing = list[idx];
      let next;
      if (op.type === "put") {
        inverse.push(existing ? { kind: op.kind, type: "put", row: existing } : { kind: op.kind, type: "del", id });
        next = idx === -1 ? [...list, op.row] : list.with(idx, op.row);
      } else {
        if (!existing) continue;
        inverse.push({ kind: op.kind, type: "put", row: existing });
        next = list.filter((r) => r.id !== id);
      }
      if (isTask) tasks = next;
      else projects = next;
    }
    this.tasks = tasks;
    this.projects = projects;
    this.#send(ops);
    return inverse.reverse();
  }

  commit(ops, label = "change") {
    if (!ops.length) return;
    const inverse = this.#apply(ops);
    this.#undo.push({ label, ops: inverse });
    if (this.#undo.length > 200) this.#undo.shift();
    this.#redo = [];
  }

  undo() {
    const entry = this.#undo.pop();
    if (!entry) return this.flash("Nothing to undo");
    this.#redo.push({ label: entry.label, ops: this.#apply(entry.ops) });
    this.flash(`Undid: ${entry.label}`);
  }

  redo() {
    const entry = this.#redo.pop();
    if (!entry) return this.flash("Nothing to redo");
    this.#undo.push({ label: entry.label, ops: this.#apply(entry.ops) });
    this.flash(`Redid: ${entry.label}`);
  }

  flash(message, kind = "info") {
    clearTimeout(this.#toastTimer);
    this.toast = { message, kind };
    this.#toastTimer = setTimeout(() => (this.toast = null), kind === "error" ? 6000 : 2600);
  }

  // ================= row builders =================
  #now() {
    return new Date().toISOString();
  }

  mkTask(fields) {
    const now = this.#now();
    return { id: newId("t"), title: "", status: "inbox", project: "", context: "", due: "", start: "", starred: "", waiting_for: "", waiting_since: "", notes: "", created: now, updated: now, completed: "", ...fields };
  }

  mkProject(fields) {
    const now = this.#now();
    return { id: newId("p"), title: "", status: "active", outcome: "", area: "", notes: "", created: now, updated: now, completed: "", ...fields };
  }

  // ================= navigation =================
  go(view) {
    if (view === this.view) {
      this.focus = "main";
      return;
    }
    this.#history.push(this.view);
    if (this.#history.length > 50) this.#history.shift();
    this.#enter(view);
  }

  back() {
    const prev = this.#history.pop();
    if (prev) this.#enter(prev);
    else this.flash("No previous view");
  }

  #enter(view) {
    this.#cursors[this.view] = this.cursor;
    this.view = view;
    this.cursor = this.#cursors[view] ?? 0;
    this.focus = "main";
    this.visualAnchor = null;
    this.filter = { ...EMPTY_FILTER };
    const base = view.startsWith("project:") ? "projects" : view;
    this.sidebarCursor = Math.max(0, VIEWS.findIndex((v) => v.id === base));
    store.set("view", view);
  }

  cycleView(delta) {
    const base = this.view.startsWith("project:") ? "projects" : this.view;
    const i = VIEWS.findIndex((v) => v.id === base);
    this.go(VIEWS[(i + delta + VIEWS.length) % VIEWS.length].id);
  }

  openProject(id) {
    this.go(`project:${id}`);
  }

  /** Jump to wherever a task lives and put the cursor on it. */
  goToTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    const data = { tasks: this.tasks, projects: this.projects };
    const candidates = {
      inbox: ["inbox"],
      next: ["next", "today", "scheduled"],
      waiting: ["waiting"],
      someday: ["someday"],
      done: ["done"],
    }[task.status];
    let view = candidates.find((v) => viewTasks(v, data, this.today).some((t) => t.id === id));
    if (!view) view = task.project ? `project:${task.project}` : candidates[0];
    this.go(view);
    this.filter = { ...EMPTY_FILTER };
    this.focusId(id);
  }

  focusId(id) {
    const i = this.items.findIndex((r) => r.id === id);
    if (i !== -1) this.cursor = i;
  }

  move(delta) {
    this.cursor = Math.max(0, Math.min(this.sel + delta, this.items.length - 1));
  }

  navDown(n = 1) {
    if (this.focus === "sidebar") this.sidebarCursor = Math.min(this.sidebarCursor + n, VIEWS.length - 1);
    else if (this.view === "calendar" && this.focus === "main") this.moveCal(7 * n);
    else this.move(n);
  }

  navUp(n = 1) {
    if (this.focus === "sidebar") this.sidebarCursor = Math.max(this.sidebarCursor - n, 0);
    else if (this.view === "calendar" && this.focus === "main") this.moveCal(-7 * n);
    else this.move(-n);
  }

  navLeft(n = 1) {
    if (this.view === "calendar" && this.focus === "main") this.moveCal(-n);
    else if (this.view === "calendar" && this.focus === "agenda") this.focus = "main";
    else if (this.sidebarOpen) this.focus = "sidebar";
  }

  navRight(n = 1) {
    if (this.focus === "sidebar") this.go(VIEWS[this.sidebarCursor].id);
    else if (this.view === "calendar" && this.focus === "main") this.moveCal(n);
    else if (this.view === "calendar" && this.focus === "agenda") this.focus = "main";
  }

  navTop(n = null) {
    if (this.focus === "sidebar") this.sidebarCursor = 0;
    else if (this.view === "calendar" && this.focus === "main") this.setCalDate(n ? `${this.calDate.slice(0, 8)}${String(n).padStart(2, "0")}` : `${this.calDate.slice(0, 8)}01`);
    else this.cursor = n ? Math.min(n - 1, this.items.length - 1) : 0;
  }

  navBottom(n = null) {
    if (this.focus === "sidebar") this.sidebarCursor = VIEWS.length - 1;
    else if (this.view === "calendar" && this.focus === "main") this.setCalDate(endOfMonth(this.calDate));
    else this.cursor = n ? Math.min(n - 1, this.items.length - 1) : Math.max(0, this.items.length - 1);
  }

  halfPage(dir) {
    if (this.view === "calendar" && this.focus === "main") this.calMonth(dir);
    else if (this.focus === "sidebar") this.navDown(dir);
    else this.move(dir * HALF_PAGE);
  }

  openSelected() {
    if (this.focus === "sidebar") return this.go(VIEWS[this.sidebarCursor].id);
    if (this.view === "calendar" && this.focus === "main") {
      this.focus = "agenda";
      return;
    }
    if (this.itemKind === "project" && this.selected) return this.openProject(this.selected.id);
    if (this.itemKind === "step") return this.runReviewStep(this.selected);
    this.editTitle();
  }

  focusSidebar() {
    if (this.sidebarOpen) this.focus = "sidebar";
    else this.flash("Sidebar is hidden (Space b)");
  }

  focusMain() {
    this.focus = "main";
  }

  toggleCalFocus() {
    if (this.view !== "calendar") return;
    this.focus = this.focus === "agenda" ? "main" : "agenda";
  }

  escape() {
    if (this.visualAnchor !== null) this.visualAnchor = null;
    else if (this.filter.context || this.filter.project || this.filter.text) this.filter = { ...EMPTY_FILTER };
    else if (this.focus !== "main") this.focus = "main";
    else if (this.toast) this.toast = null;
  }

  // ---- calendar ----
  setCalDate(iso) {
    this.calDate = iso;
    this.cursor = 0;
  }
  moveCal(days) {
    this.setCalDate(addDays(this.calDate, days));
  }
  calMonth(n) {
    this.setCalDate(addMonths(this.calDate, n));
  }
  calToday() {
    this.setCalDate(this.today);
  }
  cycleCalMode() {
    const modes = ["dayGridMonth", "dayGridWeek", "listWeek"];
    this.calMode = modes[(modes.indexOf(this.calMode) + 1) % modes.length];
    this.flash({ dayGridMonth: "Month", dayGridWeek: "Week", listWeek: "Agenda" }[this.calMode]);
  }

  // ---- visual mode ----
  toggleVisual() {
    if (this.itemKind === "step") return;
    this.visualAnchor = this.visualAnchor === null ? this.sel : null;
  }
  exitVisual() {
    this.visualAnchor = null;
  }

  // ---- ui toggles ----
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (!this.sidebarOpen && this.focus === "sidebar") this.focus = "main";
    store.set("sidebar", this.sidebarOpen);
  }
  toggleDetail() {
    this.detailOpen = !this.detailOpen;
    store.set("detail", this.detailOpen);
  }
  setTheme(theme) {
    this.theme = theme;
    document.documentElement.dataset.theme = theme;
    store.set("theme", theme);
  }
  toggleTheme() {
    this.setTheme(this.theme === "dark" ? "light" : "dark");
  }

  // ================= overlays =================
  /**
   * @param {{ title: string, placeholder?: string, value?: string, multiline?: boolean, repeat?: boolean,
   *   saveOnEscape?: boolean, hint?: string, preview?: (v: string) => string,
   *   onsubmit: (v: string) => string | false | void }} opts
   * `onsubmit` may return an error string (shown, prompt stays open) or `false` (stay open silently).
   */
  openPrompt(opts) {
    this.prompt = { value: "", error: "", count: 0, ...opts };
  }
  closePrompt() {
    this.prompt = null;
  }

  openPicker({ title, items, onpick, allowCreate, oncreate, placeholder }) {
    this.palette = { mode: "pick", title, items, onpick, allowCreate, oncreate, placeholder, query: "" };
  }
  openQuickOpen(query = "") {
    this.palette = { mode: "open", query };
  }
  openCommands() {
    this.palette = { mode: "commands", query: "" };
  }
  closePalette() {
    this.palette = null;
  }

  // ================= selection helpers =================
  /** Task ops need task rows selected. */
  requireTasks() {
    if (this.itemKind !== "task" || this.targets.length === 0) {
      if (this.itemKind !== "task") this.flash("Select a task first");
      return false;
    }
    return true;
  }

  /** Project ops work on a selected project row, or on the open project view. */
  projectTargets() {
    if (this.itemKind === "project") return this.targets;
    return this.currentProject ? [this.currentProject] : [];
  }

  #labelFor(rows) {
    return rows.length === 1 ? `“${rows[0].title}”` : `${rows.length} items`;
  }

  #patch(kind, rows, patch, label) {
    if (!rows.length) return;
    const now = this.#now();
    const ops = rows.map((r) => ({ kind, type: "put", row: { ...r, ...(typeof patch === "function" ? patch(r) : patch), updated: now } }));
    this.commit(ops, label);
    this.exitVisual();
  }

  patchTasks(patch, label) {
    if (!this.requireTasks()) return;
    this.#patch("task", this.targets, patch, label);
  }

  // ================= mutations =================
  setStatus(status) {
    const now = this.#now();
    if (this.itemKind === "project" || (this.itemKind !== "task" && this.currentProject)) {
      const map = { next: "active", inbox: "active", waiting: "active", active: "active", someday: "someday", done: "done" };
      const to = map[status];
      const rows = this.projectTargets();
      this.#patch("project", rows, (p) => ({ status: to, completed: to === "done" ? p.completed || now : "" }), `${to === "done" ? "Completed" : "Moved"} ${this.#labelFor(rows)}`);
      return;
    }
    if (!this.requireTasks()) return;
    const rows = this.targets;
    const verb = status === "done" ? "Completed" : `Moved to ${STATUS_LABEL[status]}:`;
    this.#patch(
      "task",
      rows,
      (t) => ({
        status,
        completed: status === "done" ? t.completed || now : "",
        waiting_since: status === "waiting" ? t.waiting_since || this.today : t.waiting_since,
      }),
      `${verb} ${this.#labelFor(rows)}`,
    );
    this.flash(`${verb} ${this.#labelFor(rows)}  (u to undo)`);
  }

  toggleDone() {
    if (this.itemKind === "step") return this.toggleStep(this.selected);
    const rows = this.itemKind === "project" ? this.targets : this.itemKind === "task" ? this.targets : [];
    if (!rows.length) return;
    const allDone = rows.every((r) => r.status === "done");
    this.setStatus(allDone ? "next" : "done");
  }

  toggleStar() {
    if (!this.requireTasks()) return;
    const allStarred = this.targets.every((t) => t.starred);
    this.patchTasks({ starred: allStarred ? "" : "1" }, allStarred ? "Unstar" : "Star");
  }

  deleteTargets() {
    if (this.itemKind === "step") return;
    const rows = this.itemKind === "project" ? this.targets : this.itemKind === "task" ? this.targets : this.projectTargets();
    if (!rows.length) return;
    const kind = this.itemKind === "task" ? "task" : "project";
    const ops = [];
    if (kind === "project") {
      // Keep the tasks: unlink them from the deleted project.
      for (const t of this.tasks.filter((t) => rows.some((p) => p.id === t.project))) ops.push({ kind: "task", type: "put", row: { ...t, project: "", updated: this.#now() } });
    }
    for (const r of rows) ops.push({ kind, type: "del", id: r.id });
    const label = `Deleted ${this.#labelFor(rows)}`;
    this.commit(ops, label);
    this.exitVisual();
    this.flash(`${label}  (u to undo)`);
    if (kind === "project" && this.currentProject === null && this.view.startsWith("project:")) this.go("projects");
  }

  setProject(projectId) {
    this.patchTasks({ project: projectId }, projectId ? `Set project of ${this.#labelFor(this.targets)}` : `Cleared project`);
  }
  setContext(name) {
    this.patchTasks({ context: name }, `Set context of ${this.#labelFor(this.targets)}`);
  }

  // ---- prompts for fields ----
  promptDate(field) {
    if (!this.requireTasks()) return;
    const label = field === "due" ? "Due date" : "Start date (hidden until then)";
    const rows = this.targets;
    this.openPrompt({
      title: `${label}: ${this.#labelFor(rows)}`,
      placeholder: "fri, +3d, nov 5, next mon, eom, none",
      value: rows.length === 1 ? rows[0][field] : "",
      preview: (v) => {
        if (!v.trim()) return "";
        const iso = parseDate(v, this.today);
        return iso === null ? "?" : iso === "" ? "Clear date" : `${formatLong(iso)}  (${iso})`;
      },
      onsubmit: (v) => {
        const iso = parseDate(v, this.today);
        if (iso === null) return `Can't read “${v}” as a date`;
        this.patchTasks({ [field]: iso }, `${field === "due" ? "Due" : "Start"} ${iso ? formatDate(iso, this.today) : "cleared"}`);
        // A future start date means "not yet": nothing else to change, it just drops out of Next.
      },
    });
  }

  promptWaiting() {
    if (!this.requireTasks()) return;
    const rows = this.targets;
    this.openPrompt({
      title: `Waiting for whom? ${this.#labelFor(rows)}`,
      placeholder: "Sam, the vendor, IRS…",
      value: rows.length === 1 ? rows[0].waiting_for : "",
      onsubmit: (v) => {
        this.patchTasks((t) => ({ status: "waiting", waiting_for: v.trim(), waiting_since: t.status === "waiting" && t.waiting_since ? t.waiting_since : this.today }), `Waiting on ${v.trim() || "someone"}`);
      },
    });
  }

  pickProject() {
    if (!this.requireTasks()) return;
    const sorted = sortProjects(this.projects, this.tasks).filter((p) => p.status !== "done");
    this.openPicker({
      title: "Project",
      placeholder: "Pick a project, or type a new name",
      items: [{ id: "", label: "No project", detail: "unlink" }, ...sorted.map((p) => ({ id: p.id, label: p.title, detail: p.outcome || p.status }))],
      allowCreate: "project",
      onpick: (item) => this.setProject(item.id),
      oncreate: (title) => {
        const project = this.mkProject({ title });
        const ops = [{ kind: "project", type: "put", row: project }, ...this.targets.map((t) => ({ kind: "task", type: "put", row: { ...t, project: project.id, updated: this.#now() } }))];
        this.commit(ops, `New project “${title}”`);
        this.exitVisual();
        this.flash(`Created project “${title}”`);
      },
    });
  }

  pickContext() {
    if (!this.requireTasks()) return;
    this.openPicker({
      title: "Context",
      placeholder: "Pick a context, or type a new one",
      items: [{ id: "", label: "No context", detail: "clear" }, ...this.contexts.map((c) => ({ id: c.name, label: `@${c.name}`, detail: `${c.count} open` }))],
      allowCreate: "context",
      onpick: (item) => this.setContext(item.id),
      oncreate: (name) => this.setContext(name.replace(/^@/, "").toLowerCase().replace(/\s+/g, "-")),
    });
  }

  filterByContext() {
    this.openPicker({
      title: "Filter by context",
      items: [{ id: "", label: "All contexts", detail: "clear filter" }, ...this.contexts.map((c) => ({ id: c.name, label: `@${c.name}`, detail: `${c.count} open` }))],
      onpick: (item) => {
        this.filter = { ...this.filter, context: item.id };
        this.cursor = 0;
      },
    });
  }

  filterByProject() {
    this.openPicker({
      title: "Filter by project",
      items: [{ id: "", label: "All projects", detail: "clear filter" }, ...sortProjects(this.projects, this.tasks).map((p) => ({ id: p.id, label: p.title, detail: p.status }))],
      onpick: (item) => {
        this.filter = { ...this.filter, project: item.id };
        this.cursor = 0;
      },
    });
  }

  search() {
    const before = this.filter.text;
    this.openPrompt({
      title: "Filter",
      placeholder: "words to match (title, context, project, notes)",
      value: before,
      live: true,
      oninput: (v) => {
        this.filter = { ...this.filter, text: v };
        this.cursor = 0;
      },
      oncancel: () => {
        this.filter = { ...this.filter, text: before };
      },
      onsubmit: () => {},
    });
  }

  // ---- capture & edit ----
  #captureDefaults(forceInbox) {
    const d = { status: "inbox", project: "", context: this.filter.context, due: "", start: "", waiting_for: "" };
    if (forceInbox) return { ...d, context: "" };
    const v = this.view;
    if (v.startsWith("project:")) return { ...d, project: v.slice(8), status: "next" };
    if (this.filter.project) d.project = this.filter.project;
    if (v === "next") d.status = "next";
    else if (v === "waiting") d.status = "waiting";
    else if (v === "someday") d.status = "someday";
    else if (v === "today") ((d.status = "next"), (d.due = this.today));
    else if (v === "scheduled") d.status = "next";
    else if (v === "calendar") ((d.status = "next"), (d.due = this.calDate));
    if (d.project && d.status === "inbox") d.status = "next";
    return d;
  }

  describeCapture(text, defaults) {
    const p = parseCapture(text, { projects: this.projects, today: this.today });
    const bits = [];
    const status = p.status ?? defaults.status;
    bits.push(STATUS_LABEL[status]);
    const project = p.projectTitle ?? projectOf(this.projects, { project: defaults.project })?.title;
    if (project) bits.push(`▤ ${project}`);
    const ctx = p.context ?? defaults.context;
    if (ctx) bits.push(`@${ctx}`);
    const due = p.due ?? defaults.due;
    if (due) bits.push(`due ${formatDate(due, this.today)}`);
    if (p.start) bits.push(`starts ${formatDate(p.start, this.today)}`);
    if (p.waiting_for) bits.push(`waiting for ${p.waiting_for}`);
    if (p.starred) bits.push("★");
    return bits.join("  ·  ");
  }

  capture({ inbox = false } = {}) {
    if (this.view === "projects" && !inbox) return this.newProject();
    if (this.view === "review") inbox = true;
    const defaults = this.#captureDefaults(inbox);
    const where = inbox ? "Inbox" : (this.currentProject?.title ?? STATUS_LABEL[defaults.status]);
    this.openPrompt({
      title: `Capture → ${where}`,
      placeholder: "What needs doing?  @context  #project  due:fri  start:mon  &waiting  !",
      repeat: true,
      hint: "Enter adds and keeps going · Esc closes",
      preview: (v) => (v.trim() ? this.describeCapture(v, defaults) : ""),
      onsubmit: (v) => {
        const p = parseCapture(v, { projects: this.projects, today: this.today });
        if (!p.title) return false;
        let status = p.status ?? defaults.status;
        const project = p.project ?? defaults.project;
        const context = p.context ?? defaults.context;
        const due = p.due ?? defaults.due;
        const start = p.start ?? defaults.start;
        // Anything decided about it means it's been clarified, not just captured.
        if (status === "inbox" && (p.project || p.context || p.due || p.start)) status = "next";
        const row = this.mkTask({
          title: p.title,
          status,
          project,
          context,
          due,
          start,
          starred: p.starred ? "1" : "",
          waiting_for: p.waiting_for ?? "",
          waiting_since: status === "waiting" ? this.today : "",
          notes: p.notes ?? "",
        });
        this.commit([{ kind: "task", type: "put", row }], `Added “${row.title}”`);
        this.focusId(row.id);
      },
    });
  }

  newProject() {
    this.openPrompt({
      title: "New project",
      placeholder: "Project title  -- desired outcome",
      hint: "Enter creates it · Esc closes. Then add its first next action",
      onsubmit: (v) => {
        const p = parseCapture(v, { projects: this.projects, today: this.today });
        if (!p.title) return false;
        const project = this.mkProject({ title: p.title, outcome: p.notes ?? "" });
        this.commit([{ kind: "project", type: "put", row: project }], `New project “${p.title}”`);
        this.go("projects");
        this.focusId(project.id);
        this.flash(`Project created. Enter to open it, then a to add its next action`);
      },
    });
  }

  editTitle() {
    const row = this.selected;
    if (!row || this.itemKind === "step") return;
    const isProject = this.itemKind === "project";
    this.openPrompt({
      title: isProject ? "Edit project" : "Edit task",
      value: row.title,
      hint: isProject ? "" : "@context #project due:… start:… work here too",
      onsubmit: (v) => {
        if (isProject) {
          const title = v.trim();
          if (!title) return "Title can't be empty";
          return void this.#patch("project", [row], { title }, "Rename project");
        }
        const p = parseCapture(v, { projects: this.projects, today: this.today });
        if (!p.title) return "Title can't be empty";
        const patch = { title: p.title };
        if (p.context !== undefined) patch.context = p.context;
        if (p.project !== undefined) patch.project = p.project;
        if (p.due !== undefined) patch.due = p.due;
        if (p.start !== undefined) patch.start = p.start;
        if (p.starred) patch.starred = "1";
        if (p.status === "waiting") {
          patch.status = "waiting";
          patch.waiting_for = p.waiting_for;
          patch.waiting_since = row.waiting_since || this.today;
        }
        this.#patch("task", [row], patch, "Edit task");
      },
    });
  }

  editNotes() {
    const rows = this.itemKind === "task" ? this.targets.slice(0, 1) : this.projectTargets().slice(0, 1);
    const row = rows[0];
    if (!row) return;
    const kind = this.itemKind === "task" ? "task" : "project";
    this.openPrompt({
      title: `Notes: ${row.title}`,
      multiline: true,
      saveOnEscape: true,
      value: row.notes,
      hint: "Esc saves · ⌘Enter saves",
      onsubmit: (v) => {
        if (v !== row.notes) this.#patch(kind, [row], { notes: v.replace(/\s+$/, "") }, "Edit notes");
      },
    });
  }

  editOutcome() {
    const [project] = this.projectTargets();
    if (!project) return this.flash("Open or select a project first");
    this.openPrompt({
      title: `Desired outcome: ${project.title}`,
      placeholder: "What does done look like?",
      value: project.outcome,
      onsubmit: (v) => void this.#patch("project", [project], { outcome: v.trim() }, "Edit outcome"),
    });
  }

  // ================= inbox processing (GTD "clarify") =================
  processCurrent = $derived.by(() => {
    if (!this.process) return null;
    return this.tasks.filter((t) => t.status === "inbox" && !this.process.skipped.includes(t.id)).sort((a, b) => a.created.localeCompare(b.created))[0] ?? null;
  });

  startProcess() {
    if (!this.tasks.some((t) => t.status === "inbox")) return this.flash("Inbox zero. Nothing to process");
    this.exitVisual();
    this.process = { skipped: [] };
  }

  endProcess() {
    this.process = null;
  }

  processSkip() {
    const cur = this.processCurrent;
    if (cur) this.process = { skipped: [...this.process.skipped, cur.id] };
  }

  processDo(action) {
    const t = this.processCurrent;
    if (!t) return;
    const now = this.#now();
    const put = (patch, label) => this.commit([{ kind: "task", type: "put", row: { ...t, ...patch, updated: now } }], label);
    switch (action) {
      case "next":
        put({ status: "next" }, `Next: “${t.title}”`);
        break;
      case "someday":
        put({ status: "someday" }, `Someday: “${t.title}”`);
        break;
      case "done":
        put({ status: "done", completed: now }, `Done: “${t.title}”`);
        break;
      case "trash":
        this.commit([{ kind: "task", type: "del", id: t.id }], `Trashed “${t.title}”`);
        break;
      case "waiting":
        this.openPrompt({
          title: `Waiting for whom? “${t.title}”`,
          placeholder: "Sam, the vendor…",
          onsubmit: (v) => put({ status: "waiting", waiting_for: v.trim(), waiting_since: this.today }, `Waiting: “${t.title}”`),
        });
        break;
      case "project":
        this.openPicker({
          title: `Project for “${t.title}”`,
          placeholder: "Pick a project, or type a new name",
          items: sortProjects(this.projects, this.tasks)
            .filter((p) => p.status !== "done")
            .map((p) => ({ id: p.id, label: p.title, detail: p.outcome || p.status })),
          allowCreate: "project",
          onpick: (item) => put({ project: item.id, status: "next" }, `Project for “${t.title}”`),
          oncreate: (title) => {
            const project = this.mkProject({ title });
            this.commit(
              [
                { kind: "project", type: "put", row: project },
                { kind: "task", type: "put", row: { ...t, project: project.id, status: "next", updated: now } },
              ],
              `New project “${title}”`,
            );
          },
        });
        break;
      case "context":
        this.openPicker({
          title: `Context for “${t.title}”`,
          items: this.contexts.map((c) => ({ id: c.name, label: `@${c.name}`, detail: `${c.count} open` })),
          allowCreate: "context",
          onpick: (item) => put({ context: item.id, status: "next" }, `Context for “${t.title}”`),
          oncreate: (name) => put({ context: name.replace(/^@/, "").toLowerCase(), status: "next" }, `Context for “${t.title}”`),
        });
        break;
      case "due":
      case "start":
        this.openPrompt({
          title: `${action === "due" ? "Due date" : "Start date"}: “${t.title}”`,
          placeholder: "fri, +3d, nov 5, none",
          preview: (v) => {
            const iso = v.trim() ? parseDate(v, this.today) : "";
            return iso === null ? "?" : iso ? formatLong(iso) : "";
          },
          onsubmit: (v) => {
            const iso = parseDate(v, this.today);
            if (iso === null) return `Can't read “${v}” as a date`;
            put({ [action]: iso, status: "next" }, `Date for “${t.title}”`);
          },
        });
        break;
      case "edit":
        this.openPrompt({
          title: "Rewrite as a next action",
          value: t.title,
          onsubmit: (v) => {
            const title = v.trim();
            if (!title) return "Title can't be empty";
            put({ title }, "Edit task");
          },
        });
        break;
    }
    if (!this.processCurrent) {
      this.process = null;
      this.flash("Inbox zero 🎉");
    }
  }

  // ================= weekly review =================
  toggleStep(step) {
    if (!step) return;
    this.checked = this.checked.includes(step.id) ? this.checked.filter((id) => id !== step.id) : [...this.checked, step.id];
    store.set(`review.${startOfWeek(this.today)}`, this.checked);
  }

  runReviewStep(step) {
    if (!step) return;
    if (step.go) this.go(step.go);
    else if (step.act === "process") this.startProcess();
    else if (step.act === "capture") this.capture({ inbox: true });
    if (!this.checked.includes(step.id) && step.go) this.toggleStep(step);
  }

  completeReview() {
    const date = this.today;
    this.openPrompt({
      title: "Complete weekly review: any reflections?",
      multiline: true,
      value: "",
      hint: "Optional. Esc saves the review · ⌘Enter saves",
      saveOnEscape: true,
      onsubmit: async (notes) => {
        const content = reviewMarkdown({ date, stats: this.stats, checked: this.checked, notes, tasks: this.tasks, projects: this.projects });
        try {
          await api.putFile(`reviews/${date}.md`, content);
          this.files = (await api.files()).files;
          this.checked = [];
          store.set(`review.${startOfWeek(date)}`, []);
          this.flash(`Review saved: reviews/${date}.md`);
        } catch (err) {
          this.flash(`Couldn't save review: ${err.message}`, "error");
        }
      },
    });
  }

  // ================= misc =================
  projectStatsFor(project) {
    return projectStats(project, this.tasks);
  }

  /** Reschedule from the calendar (drag and drop): kind is "due" or "start". */
  reschedule(taskId, kind, iso) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task || !iso) return;
    this.commit([{ kind: "task", type: "put", row: { ...task, [kind]: iso, updated: this.#now() } }], `Moved ${kind} to ${iso}`);
  }
}

export const app = new App();
