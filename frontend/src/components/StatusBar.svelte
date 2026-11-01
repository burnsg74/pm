<script>
  import { app } from "../lib/state.svelte.js";

  const HINTS = {
    task: [["a", "add"], ["x", "done"], ["e", "edit"], ["mn", "next"], ["p", "project"], ["t", "due"], ["/", "filter"], ["⌘P", "open"], ["?", "help"]],
    project: [["↵", "open"], ["a", "new project"], ["x", "complete"], ["co", "outcome"], ["ms", "someday"], ["?", "help"]],
    step: [["x", "check"], ["↵", "go"], ["C", "complete review"], ["?", "help"]],
  };

  const hints = $derived(HINTS[app.itemKind] ?? HINTS.task);
  const position = $derived(app.items.length && app.itemKind !== "step" ? `${app.sel + 1}/${app.items.length}` : "");
</script>

<footer class="status">
  <span class="mode {app.mode.toLowerCase()}">{app.mode}</span>
  {#if app.visualRange}<span class="sel">{app.targets.length} selected</span>{/if}
  <span class="pending">{app.pending}</span>

  <div class="center">
    {#if app.toast}
      <span class="toast {app.toast.kind}">{app.toast.message}</span>
    {:else}
      <span class="hints">
        {#each hints as [k, label] (k)}<span><kbd>{k}</kbd> {label}</span>{/each}
      </span>
    {/if}
  </div>

  <span class="right">
    {#if app.focus === "sidebar"}<span>sidebar</span>{/if}
    {#if position}<span>{position}</span>{/if}
    <span>{app.viewLabel}</span>
  </span>
</footer>

<style>
  .status {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 26px;
    padding: 0 10px 0 0;
    background: var(--bg-panel);
    border-top: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-dim);
  }
  .mode {
    align-self: stretch;
    display: grid;
    place-items: center;
    min-width: 76px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--bg);
    background: var(--accent);
  }
  .mode.insert {
    background: var(--green);
  }
  .mode.visual {
    background: var(--purple);
  }
  .mode.command {
    background: var(--yellow);
  }
  .mode.process {
    background: var(--orange);
  }
  .sel {
    color: var(--purple);
  }
  .pending {
    min-width: 40px;
    color: var(--yellow);
    font-weight: 700;
  }
  .center {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
  }
  .hints {
    display: flex;
    gap: 14px;
    color: var(--fg-faint);
  }
  .hints kbd {
    font-size: 10px;
    padding: 0 4px;
    border-bottom-width: 1px;
  }
  .toast {
    color: var(--fg-bright);
  }
  .toast.error {
    color: var(--red);
  }
  .right {
    display: flex;
    gap: 14px;
    white-space: nowrap;
  }
</style>
