<script>
  import { app } from "../lib/state.svelte.js";
  import { projectOf } from "../lib/model.js";

  const contextFilter = $derived(app.filter.context);
  const projectFilter = $derived(app.filter.project ? projectOf(app.projects, { project: app.filter.project }) : null);

  function clear(key) {
    app.filter = { ...app.filter, [key]: "" };
  }
</script>

<header class="titlebar">
  <button class="icon-btn" tabindex="-1" onclick={() => app.toggleSidebar()} title="Toggle sidebar (Space b)">▤</button>
  <div class="crumbs">
    <span class="app">PM</span>
    <span class="sep">›</span>
    {#if app.currentProject}
      <button class="crumb" tabindex="-1" onclick={() => app.go("projects")}>Projects</button>
      <span class="sep">›</span>
    {/if}
    <span class="here">{app.viewLabel}</span>
    {#if app.items.length && app.itemKind !== "step"}<span class="n">{app.items.length}</span>{/if}
  </div>

  <div class="filters">
    {#if app.filter.text}<button class="chip" tabindex="-1" onclick={() => clear("text")}>/{app.filter.text} ✕</button>{/if}
    {#if contextFilter}<button class="chip" tabindex="-1" onclick={() => clear("context")}>@{contextFilter} ✕</button>{/if}
    {#if projectFilter}<button class="chip" tabindex="-1" onclick={() => clear("project")}>▤ {projectFilter.title} ✕</button>{/if}
  </div>

  <div class="right">
    {#if app.error}<span class="offline" title={app.error}>● API offline</span>{/if}
    <button class="launcher" tabindex="-1" onclick={() => app.openQuickOpen()}>
      <span>Search tasks, projects, views…</span>
      <kbd>⌘P</kbd>
    </button>
    <button class="icon-btn" tabindex="-1" onclick={() => (app.helpOpen = true)} title="Keyboard shortcuts (?)">?</button>
  </div>
</header>

<style>
  .titlebar {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 36px;
    padding: 0 10px;
    min-width: 0;
    overflow: hidden;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border);
  }
  .right {
    min-width: 0;
  }
  .icon-btn {
    all: unset;
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: var(--radius);
    cursor: pointer;
    color: var(--fg-dim);
  }
  .icon-btn:hover {
    background: var(--bg-hover);
    color: var(--fg);
  }
  .crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .app {
    color: var(--fg-dim);
    font-weight: 600;
  }
  .sep {
    color: var(--fg-faint);
  }
  .crumb {
    all: unset;
    color: var(--fg-dim);
    cursor: pointer;
  }
  .crumb:hover {
    color: var(--fg);
  }
  .here {
    color: var(--fg-bright);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .n {
    font-size: 11px;
    color: var(--fg-dim);
    background: var(--bg-elev);
    padding: 0 7px;
    border-radius: 9px;
  }
  .filters {
    display: flex;
    gap: 6px;
  }
  .chip {
    all: unset;
    cursor: pointer;
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 9px;
    background: var(--accent-bg);
    color: var(--accent);
  }
  .right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .offline {
    color: var(--red);
    font-size: 11px;
  }
  .launcher {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    width: 280px;
    min-width: 0;
    flex-shrink: 1;
    overflow: hidden;
    white-space: nowrap;
    height: 24px;
    padding: 0 6px 0 10px;
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--fg-faint);
    font-size: 12px;
  }
  .launcher:hover {
    border-color: var(--fg-faint);
    color: var(--fg-dim);
  }
</style>
