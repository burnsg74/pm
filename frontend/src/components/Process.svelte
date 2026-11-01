<script>
  import { app } from "../lib/state.svelte.js";
  import { projectOf } from "../lib/model.js";
  import { formatDate } from "../lib/dates.js";

  const item = $derived(app.processCurrent);
  const project = $derived(item ? projectOf(app.projects, item) : null);
  const left = $derived(app.tasks.filter((t) => t.status === "inbox").length);

  // GTD clarify: what is it? is it actionable? what's the next action?
  const KEYS = [
    ["n", "Next action", "next", "Do it when you can"],
    ["w", "Waiting for…", "waiting", "Someone else has the ball"],
    ["s", "Someday / Maybe", "someday", "Not now, not never"],
    ["d", "Done", "done", "Under two minutes? Do it now"],
    ["x", "Trash", "trash", "Not actionable, no reference value"],
    ["e", "Rewrite", "edit", "Make it a clear, physical next action"],
    ["p", "Project…", "project", "Also moves it to Next"],
    ["c", "Context…", "context", "Also moves it to Next"],
    ["t", "Due date…", "due", "Also moves it to Next"],
    ["T", "Start date…", "start", "Tickler: hidden until then"],
  ];

  function onkeydown(e) {
    if (app.prompt || app.palette || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const hit = KEYS.find(([key]) => key === k);
    if (hit) {
      e.preventDefault();
      app.processDo(hit[2]);
    } else if (k === "j" || k === " " || k === "Tab" || k === "ArrowRight") {
      e.preventDefault();
      app.processSkip();
    } else if (k === "Escape" || k === "q") {
      e.preventDefault();
      app.endProcess();
    }
  }
</script>

<svelte:window {onkeydown} />

<div class="scrim" role="presentation" onclick={(e) => e.target === e.currentTarget && (app.endProcess())}>
  <div class="card" role="dialog" aria-label="Process inbox" tabindex="-1">
    <div class="top">
      <span class="eyebrow">PROCESS INBOX</span>
      <span class="left">{left} left</span>
    </div>

    {#if item}
      <div class="q">What is it, and what's the next action?</div>
      <h2>{item.title}</h2>
      <div class="meta">
        {#if project}<span class="purple">▤ {project.title}</span>{/if}
        {#if item.context}<span class="cyan">@{item.context}</span>{/if}
        {#if item.due}<span>⚑ {formatDate(item.due, app.today)}</span>{/if}
        {#if item.start}<span>⏵ {formatDate(item.start, app.today)}</span>{/if}
      </div>
      {#if item.notes}<div class="notes">{item.notes}</div>{/if}

      <div class="grid">
        {#each KEYS as [key, label, , hint] (key)}
          <button class="opt" tabindex="-1" onclick={() => app.processDo(KEYS.find(([k]) => k === key)[2])}>
            <kbd>{key}</kbd>
            <span class="l">{label}</span>
            <span class="h">{hint}</span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="q">Everything left was skipped.</div>
    {/if}

    <div class="foot"><kbd>j</kbd> / <kbd>space</kbd> skip · <kbd>q</kbd> / <kbd>esc</kbd> stop</div>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: var(--scrim);
    display: grid;
    place-items: start center;
    padding-top: 12vh;
    z-index: 40;
  }
  .card {
    width: min(640px, 92vw);
    background: var(--bg-elev);
    border: 1px solid var(--border-soft);
    border-radius: 8px;
    box-shadow: var(--shadow);
    padding: 18px 22px 14px;
  }
  .top {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--orange);
  }
  .left {
    color: var(--fg-dim);
    font-family: var(--font-mono);
    letter-spacing: 0;
  }
  .q {
    margin: 14px 0 4px;
    color: var(--fg-dim);
    font-size: 12px;
  }
  h2 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: var(--fg-bright);
    line-height: 1.3;
  }
  .meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--fg-dim);
    margin-bottom: 8px;
  }
  .purple {
    color: var(--purple);
  }
  .cyan {
    color: var(--cyan);
  }
  .notes {
    white-space: pre-wrap;
    font-size: 12px;
    padding: 8px 10px;
    margin-bottom: 8px;
    background: var(--bg);
    border-radius: var(--radius);
    color: var(--fg-dim);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
    margin: 14px 0 10px;
  }
  .opt {
    all: unset;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 26px auto 1fr;
    align-items: center;
    gap: 6px;
    padding: 5px 6px;
    border-radius: var(--radius);
    cursor: pointer;
  }
  .opt:hover {
    background: var(--bg-hover);
  }
  .l {
    color: var(--fg-bright);
  }
  .h {
    font-size: 11px;
    color: var(--fg-faint);
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .foot {
    font-size: 11px;
    color: var(--fg-faint);
    padding-top: 8px;
    border-top: 1px solid var(--border-soft);
  }
</style>
