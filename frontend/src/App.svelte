<script>
  import { untrack } from "svelte";
  import { app } from "./lib/state.svelte.js";
  import { byId, resolver } from "./lib/actions.js";
  import { today } from "./lib/dates.js";
  import { normalizeKey } from "./lib/keys.js";
  import { VIEWS } from "./lib/model.js";
  import Sidebar from "./components/Sidebar.svelte";
  import TitleBar from "./components/TitleBar.svelte";
  import StatusBar from "./components/StatusBar.svelte";
  import TaskList from "./components/TaskList.svelte";
  import Detail from "./components/Detail.svelte";
  import CalendarView from "./components/CalendarView.svelte";
  import ReviewView from "./components/ReviewView.svelte";
  import Palette from "./components/Palette.svelte";
  import Prompt from "./components/Prompt.svelte";
  import Help from "./components/Help.svelte";
  import Process from "./components/Process.svelte";
  import WhichKey from "./components/WhichKey.svelte";

  const EMPTY = {
    inbox: "Inbox zero. Nothing to clarify.",
    today: "Nothing due or starting today.",
    next: "No next actions available.",
    waiting: "Not waiting on anyone.",
    scheduled: "Nothing scheduled ahead.",
    someday: "Nothing parked for someday.",
    done: "Nothing completed yet.",
  };

  const hint = $derived(VIEWS.find((v) => v.id === app.view)?.hint ?? "");
  const emptyText = $derived(app.currentProject ? "No tasks yet. Add its first next action." : (EMPTY[app.view] ?? "Nothing here."));
  const project = $derived(app.currentProject);
  const projectStats = $derived(project ? app.projectStatsFor(project) : null);
  const showDetail = $derived(app.detailOpen && app.view !== "calendar");

  $effect(() => {
    document.documentElement.dataset.theme = app.theme;
  });

  // Load data once, and roll "today" over at midnight.
  $effect(() => {
    untrack(() => app.load());
    const tick = setInterval(() => (app.today = today()), 60_000);
    return () => clearInterval(tick);
  });

  /**
   * The modal key engine. Overlays (palette, prompts, help, process) own their keys; otherwise every
   * keypress runs through the Vim sequence resolver.
   */
  function onkeydown(e) {
    if (e.defaultPrevented || e.isComposing) return;
    const key = normalizeKey(e);
    if (!key) return;
    if (app.overlay) return;
    const t = e.target;
    if (t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;

    const result = resolver.feed(key);
    app.pending = resolver.pending;

    if (result.type === "match") {
      e.preventDefault();
      byId[result.action].run({ count: result.count });
    } else if (result.type === "pending") {
      e.preventDefault();
    } else if (key === "<Esc>" && result.idle) {
      app.escape();
    }
  }
</script>

<svelte:window {onkeydown} onfocus={() => app.refresh()} />
<svelte:head>
  <title>{app.counts.inbox ? `(${app.counts.inbox}) ` : ""}{app.viewLabel} · PM</title>
</svelte:head>

<div class="app">
  <TitleBar />

  <div class="body">
    {#if app.sidebarOpen}
      <div class="side"><Sidebar /></div>
    {/if}

    <main class="main" class:dim={app.focus === "sidebar"}>
      {#if !app.loaded}
        <div class="state">
          {#if app.error}
            <div class="err">Can't reach the API</div>
            <div class="sub">{app.error}</div>
            <div class="sub">Start it with <code>npm run dev:api</code> (dev) or <code>pm2 restart pm-api</code>.</div>
          {:else}
            Loading…
          {/if}
        </div>
      {:else if app.view === "calendar"}
        <CalendarView />
      {:else if app.view === "review"}
        <ReviewView />
      {:else}
        <div class="pane">
          {#if project}
            <div class="project-head">
              <div class="p-title">▤ {project.title}</div>
              <div class="p-outcome">{project.outcome || "No outcome yet. Press co to define what done looks like."}</div>
              <div class="p-stats">
                <span>{projectStats.next} next</span><span>{projectStats.waiting} waiting</span><span>{projectStats.done} done</span>
                {#if projectStats.stalled}<span class="stalled">⚠ stalled: add a next action with <kbd>a</kbd></span>{/if}
              </div>
            </div>
          {:else if hint}
            <div class="view-hint">{hint}</div>
          {/if}
          <div class="scroll"><TaskList active={app.focus !== "sidebar"} empty={emptyText} /></div>
        </div>
      {/if}
    </main>

    {#if showDetail && app.loaded}
      <div class="detail-col"><Detail /></div>
    {/if}
  </div>

  <StatusBar />
</div>

<WhichKey />

{#if app.process}<Process />{/if}
{#if app.helpOpen}<Help />{/if}
{#key app.palette}
  {#if app.palette}<Palette />{/if}
{/key}
{#key app.prompt}
  {#if app.prompt}<Prompt />{/if}
{/key}

<style>
  .app {
    display: grid;
    grid-template-rows: 36px minmax(0, 1fr) 26px;
    height: 100%;
    width: 100%;
    overflow: clip; /* clip, not hidden: scrollIntoView can't shift a clipped box sideways */
  }
  /* The detail pane and sidebar give way before the list does. */
  @media (max-width: 1100px) {
    .detail-col {
      display: none;
    }
  }
  @media (max-width: 720px) {
    .side {
      width: 180px;
    }
  }
  .body {
    display: flex;
    min-height: 0;
    min-width: 0;
    overflow: clip;
  }
  .side {
    width: 224px;
    flex-shrink: 0;
    border-right: 1px solid var(--border);
    background: var(--bg-panel);
  }
  .main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    background: var(--bg);
    transition: opacity 0.1s;
    overflow: clip;
  }
  .main.dim {
    opacity: 0.82;
  }
  .detail-col {
    width: 320px;
    flex-shrink: 0;
    border-left: 1px solid var(--border);
  }
  .pane {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .scroll {
    flex: 1;
    overflow-y: auto;
  }
  .view-hint {
    padding: 8px 16px;
    color: var(--fg-faint);
    font-size: 12px;
    border-bottom: 1px solid var(--border);
  }
  .project-head {
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--border);
  }
  .p-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--fg-bright);
  }
  .p-outcome {
    margin-top: 2px;
    color: var(--fg-dim);
  }
  .p-stats {
    display: flex;
    gap: 14px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--fg-faint);
  }
  .stalled {
    color: var(--orange);
  }
  .state {
    padding: 80px 20px;
    text-align: center;
    color: var(--fg-dim);
  }
  .err {
    color: var(--red);
    font-size: 15px;
    margin-bottom: 8px;
  }
  .sub {
    color: var(--fg-faint);
    margin-top: 4px;
  }
  code {
    font-family: var(--font-mono);
    color: var(--fg-dim);
  }
</style>
