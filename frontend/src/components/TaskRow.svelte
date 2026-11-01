<script>
  import { app } from "../lib/state.svelte.js";
  import { daysBetween, formatDate } from "../lib/dates.js";
  import { projectOf } from "../lib/model.js";

  let { task, selected = false, inRange = false, active = true, onselect, onedit } = $props();

  const project = $derived(projectOf(app.projects, task));
  const done = $derived(task.status === "done");
  const dueDiff = $derived(task.due ? daysBetween(app.today, task.due) : null);
  const waitingDays = $derived(task.status === "waiting" && task.waiting_since ? daysBetween(task.waiting_since, app.today) : null);
  const hidden = $derived(task.start && task.start > app.today);

  /** Scroll the cursor row into view as it moves. */
  function follow(el) {
    if (selected) el.scrollIntoView({ block: "nearest" });
  }
</script>

<!-- Mouse convenience only: keyboard access is the app-wide Vim key engine in App.svelte. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="row"
  class:selected
  class:in-range={inRange}
  class:dim={!active}
  class:done
  role="option"
  aria-selected={selected}
  tabindex="-1"
  onclick={onselect}
  ondblclick={onedit}
 
  {@attach follow}
>
  <button class="check" class:on={done} tabindex="-1" aria-label="Toggle done" onclick={(e) => { e.stopPropagation(); onselect?.(); app.toggleDone(); }}>
    {done ? "✓" : task.status === "waiting" ? "◔" : task.status === "someday" ? "☁" : task.status === "inbox" ? "◌" : "○"}
  </button>
  {#if task.starred}<span class="star" title="Starred">★</span>{/if}
  <span class="title">{task.title}</span>
  <span class="meta">
    {#if task.status === "waiting"}
      <span class="chip waiting">◔ {task.waiting_for || "someone"}{waitingDays !== null ? ` · ${waitingDays}d` : ""}</span>
    {/if}
    {#if project}<span class="chip project">▤ {project.title}</span>{/if}
    {#if task.context}<span class="chip ctx">@{task.context}</span>{/if}
    {#if hidden}<span class="chip start">⏵ {formatDate(task.start, app.today)}</span>{/if}
    {#if task.due}
      <span class="chip due" class:overdue={!done && dueDiff < 0} class:today={!done && dueDiff === 0}>⚑ {formatDate(task.due, app.today)}</span>
    {/if}
  </span>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 30px;
    padding: 0 14px 0 10px;
    border-left: 2px solid transparent;
    cursor: default;
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
  .row.selected.dim {
    background: var(--bg-sel-dim);
    border-left-color: var(--fg-faint);
  }
  .check {
    all: unset;
    width: 18px;
    text-align: center;
    color: var(--fg-dim);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
  }
  .check:hover,
  .check.on {
    color: var(--green);
  }
  .star {
    color: var(--yellow);
    font-size: 12px;
  }
  .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .done .title {
    color: var(--fg-faint);
    text-decoration: line-through;
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
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .selected .chip {
    background: color-mix(in srgb, var(--bg) 40%, transparent);
  }
  .chip.project {
    color: var(--purple);
  }
  .chip.ctx {
    color: var(--cyan);
  }
  .chip.start {
    color: var(--accent);
  }
  .chip.waiting {
    color: var(--orange);
  }
  .chip.due.today {
    color: var(--yellow);
  }
  .chip.due.overdue {
    color: var(--red);
  }
</style>
