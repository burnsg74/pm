<script>
  import { app } from "../lib/state.svelte.js";

  let { project, selected = false, inRange = false, onselect, onopen } = $props();

  const stats = $derived(app.projectStatsFor(project));

  function follow(el) {
    if (selected) el.scrollIntoView({ block: "nearest" });
  }
</script>

<!-- Mouse convenience only: keyboard access is the app-wide Vim key engine in App.svelte. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="row" class:selected class:in-range={inRange} class:muted={project.status !== "active"} role="option" aria-selected={selected} tabindex="-1" onclick={onselect} ondblclick={onopen} {@attach follow}>
  <span class="icon">{project.status === "done" ? "✓" : project.status === "someday" ? "☁" : "▤"}</span>
  <span class="title">{project.title}</span>
  {#if project.outcome}<span class="outcome">{project.outcome}</span>{/if}
  <span class="meta">
    {#if stats.stalled}<span class="chip stalled" title="Active project with no next action">⚠ stalled</span>{/if}
    {#if project.area}<span class="chip">{project.area}</span>{/if}
    <span class="chip counts">{stats.next} next{stats.waiting ? ` · ${stats.waiting} waiting` : ""}{stats.done ? ` · ${stats.done} done` : ""}</span>
  </span>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 14px 0 10px;
    border-left: 2px solid transparent;
    white-space: nowrap;
  }
  .row:hover {
    background: var(--bg-hover);
  }
  .row.in-range {
    background: var(--accent-bg);
  }
  .row.selected {
    background: var(--bg-sel);
    border-left-color: var(--accent);
    color: var(--fg-bright);
  }
  .row.muted .title {
    color: var(--fg-dim);
  }
  .icon {
    width: 18px;
    text-align: center;
    color: var(--purple);
  }
  .muted .icon {
    color: var(--fg-faint);
  }
  .title {
    font-weight: 500;
    flex-shrink: 0;
    max-width: 40%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .outcome {
    flex: 1;
    min-width: 0;
    color: var(--fg-faint);
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
  }
  .row:not(:has(.outcome)) .meta {
    margin-left: auto;
  }
  .meta {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .chip {
    font-size: 11px;
    padding: 1px 7px;
    border-radius: 9px;
    background: var(--bg-elev);
    color: var(--fg-dim);
  }
  .selected .chip {
    background: color-mix(in srgb, var(--bg) 40%, transparent);
  }
  .chip.stalled {
    color: var(--orange);
  }
</style>
