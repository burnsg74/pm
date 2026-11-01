<script>
  import { app } from "../lib/state.svelte.js";
  import { daysBetween, formatDate } from "../lib/dates.js";

  const done = $derived(app.items.filter((s) => app.checked.includes(s.id)).length);
  const last = $derived(app.lastReview ? `${formatDate(app.lastReview, app.today)} (${daysBetween(app.lastReview, app.today)}d ago)` : "never");

  function follow(selected) {
    return (el) => {
      if (selected) el.scrollIntoView({ block: "nearest" });
    };
  }
</script>

<div class="review">
  <div class="top">
    <div>
      <h1>Weekly Review</h1>
      <p>Get clear · Get current · Get creative. Last review: <b>{last}</b></p>
    </div>
    <div class="progress">
      <div class="bar"><div class="fill" style:width="{(done / app.items.length) * 100}%"></div></div>
      <span>{done}/{app.items.length}</span>
    </div>
  </div>

  <div class="steps" role="listbox" aria-label="Review steps">
    {#each app.items as step, i (step.id)}
      {@const checked = app.checked.includes(step.id)}
      {@const satisfied = step.ok?.(app.stats)}
      {#if i === 0 || app.items[i - 1].group !== step.group}
        <div class="group">{step.group.toUpperCase()}</div>
      {/if}
            <!-- Mouse convenience only: keyboard access is the app-wide Vim key engine in App.svelte. -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="step"
        class:selected={i === app.sel}
        class:checked
        role="option"
        aria-selected={i === app.sel}
        tabindex="-1"
        onclick={() => (app.cursor = i)}
        ondblclick={() => app.runReviewStep(step)}
       
        {@attach follow(i === app.sel)}
      >
        <button class="box" tabindex="-1" aria-label="Toggle step" onclick={(e) => { e.stopPropagation(); app.toggleStep(step); }}>{checked ? "☑" : "☐"}</button>
        <div class="body">
          <div class="t">{step.title}</div>
          <div class="d">{step.detail}</div>
        </div>
        {#if step.stat}<span class="stat" class:ok={satisfied} class:warn={satisfied === false}>{step.stat(app.stats)}</span>{/if}
        <span class="go">{step.go ? `→ ${step.go}` : step.act === "process" ? "→ process" : "→ capture"}</span>
      </div>
    {/each}
  </div>

  <div class="foot">
    <kbd>j k</kbd> move · <kbd>x</kbd> check · <kbd>↵</kbd> do this step · <kbd>C</kbd> finish and save to <code>reviews/{app.today}.md</code>
  </div>
</div>

<style>
  .review {
    height: 100%;
    overflow-y: auto;
    padding: 18px 24px 60px;
    max-width: 880px;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 8px;
  }
  h1 {
    margin: 0;
    font-size: 18px;
    color: var(--fg-bright);
  }
  p {
    margin: 4px 0 0;
    color: var(--fg-dim);
  }
  b {
    color: var(--fg-bright);
    font-weight: 500;
  }
  .progress {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--fg-dim);
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .bar {
    width: 140px;
    height: 5px;
    background: var(--bg-elev);
    border-radius: 3px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--green);
    transition: width 0.15s;
  }
  .group {
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--fg-faint);
    margin: 18px 0 4px 4px;
  }
  .step {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-left: 2px solid transparent;
    border-radius: 0 var(--radius) var(--radius) 0;
  }
  .step:hover {
    background: var(--bg-hover);
  }
  .step.selected {
    background: var(--bg-sel);
    border-left-color: var(--accent);
  }
  .box {
    all: unset;
    cursor: pointer;
    font-size: 16px;
    color: var(--fg-dim);
    line-height: 1;
  }
  .checked .box {
    color: var(--green);
  }
  .body {
    flex: 1;
    min-width: 0;
  }
  .t {
    color: var(--fg-bright);
  }
  .checked .t {
    color: var(--fg-faint);
    text-decoration: line-through;
  }
  .d {
    font-size: 12px;
    color: var(--fg-faint);
  }
  .stat {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-dim);
    padding: 1px 8px;
    border-radius: 9px;
    background: var(--bg-elev);
    white-space: nowrap;
  }
  .stat.ok {
    color: var(--green);
  }
  .stat.warn {
    color: var(--orange);
  }
  .go {
    font-size: 11px;
    color: var(--fg-faint);
    width: 90px;
    text-align: right;
  }
  .foot {
    margin-top: 24px;
    color: var(--fg-faint);
    font-size: 12px;
  }
  code {
    font-family: var(--font-mono);
    color: var(--fg-dim);
  }
</style>
