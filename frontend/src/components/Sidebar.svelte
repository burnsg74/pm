<script>
  import { app } from "../lib/state.svelte.js";
  import { VIEWS } from "../lib/model.js";
  import { daysBetween } from "../lib/dates.js";

  const current = $derived(app.view.startsWith("project:") ? "projects" : app.view);
  const reviewDue = $derived(!app.lastReview || daysBetween(app.lastReview, app.today) >= 7);

  function badge(id) {
    if (id === "inbox") return app.counts.inbox;
    if (id === "today") return app.counts.today;
    if (id === "next") return app.counts.next;
    if (id === "waiting") return app.counts.waiting;
    if (id === "scheduled") return app.counts.scheduled;
    if (id === "someday") return app.counts.someday;
    if (id === "projects") return app.counts.projects;
    return 0;
  }

  function filterContext(name) {
    app.go("next");
    app.filter = { ...app.filter, context: name };
  }
</script>

<nav class="sidebar" aria-label="Views">
  <div class="section">VIEWS</div>
  {#each VIEWS as v, i (v.id)}
    {@const n = badge(v.id)}
    <button
      class="item"
      class:current={current === v.id}
      class:cursor={app.focus === "sidebar" && app.sidebarCursor === i}
      tabindex="-1"
      onclick={() => app.go(v.id)}
      title={v.hint}
    >
      <span class="icon">{v.icon}</span>
      <span class="label">{v.label}</span>
      {#if v.id === "projects" && app.counts.stalled}<span class="warn" title="{app.counts.stalled} stalled">⚠{app.counts.stalled}</span>{/if}
      {#if v.id === "review" && reviewDue}<span class="dot" title="Weekly review is due"></span>{/if}
      {#if n}<span class="count" class:hot={v.id === "inbox"}>{n}</span>{/if}
      <kbd class="key">g{v.key}</kbd>
    </button>
  {/each}

  <div class="section">CONTEXTS</div>
  {#each app.contexts as c (c.name)}
    <button class="item small" class:current={app.filter.context === c.name} tabindex="-1" onclick={() => filterContext(c.name)}>
      <span class="icon">@</span>
      <span class="label">{c.name}</span>
      {#if c.count}<span class="count">{c.count}</span>{/if}
    </button>
  {/each}
</nav>

<style>
  .sidebar {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 6px 6px 30px;
    background: var(--bg-panel);
  }
  .section {
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--fg-faint);
    padding: 12px 8px 4px;
  }
  .item {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 26px;
    padding: 0 8px;
    border-radius: var(--radius);
    cursor: pointer;
    color: var(--fg);
  }
  .item:hover {
    background: var(--bg-hover);
  }
  .item.current {
    background: var(--bg-sel-dim);
    color: var(--fg-bright);
  }
  .item.current .icon {
    color: var(--accent);
  }
  .item.cursor {
    background: var(--bg-sel);
    outline: 1px solid var(--accent);
    outline-offset: -1px;
  }
  .item.small {
    height: 22px;
    font-size: 12px;
    color: var(--fg-dim);
  }
  .icon {
    width: 16px;
    text-align: center;
    color: var(--fg-dim);
  }
  .label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .count {
    font-size: 11px;
    color: var(--fg-dim);
    font-variant-numeric: tabular-nums;
  }
  .count.hot {
    color: var(--bg);
    background: var(--accent);
    padding: 0 6px;
    border-radius: 9px;
    font-weight: 600;
  }
  .warn {
    font-size: 11px;
    color: var(--orange);
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--orange);
  }
  .key {
    font-size: 10px;
    padding: 0 4px;
    opacity: 0;
  }
  .item:hover .key,
  .item.cursor .key {
    opacity: 1;
  }
</style>
