<script>
  import { app } from "../lib/state.svelte.js";
  import { byId, prettyKeys, resolver } from "../lib/actions.js";

  // `app.pending` changes whenever the resolver does, so reading it keeps this in sync.
  const options = $derived.by(() => {
    if (!app.pending.replace(/^\d+/, "")) return [];
    return resolver
      .completions()
      .map((c) => ({ key: prettyKeys(c.key), title: byId[c.action]?.title ?? c.action }))
      .sort((a, b) => a.key.localeCompare(b.key));
  });
</script>

{#if options.length}
  <div class="which" aria-hidden="true">
    <div class="prefix">{app.pending}</div>
    <div class="grid">
      {#each options as o (o.key)}
        <div class="o"><kbd>{o.key}</kbd><span>{o.title}</span></div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .which {
    position: fixed;
    right: 14px;
    bottom: 36px;
    z-index: 30;
    max-width: 560px;
    padding: 8px 12px 10px;
    background: var(--bg-elev);
    border: 1px solid var(--border-soft);
    border-radius: 8px;
    box-shadow: var(--shadow);
    /* Wait a beat so fast typists never see it flash. */
    opacity: 0;
    animation: show 0.12s ease-out 0.35s forwards;
  }
  @keyframes show {
    to {
      opacity: 1;
    }
  }
  .prefix {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--yellow);
    margin-bottom: 6px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(200px, 1fr));
    gap: 2px 18px;
  }
  .o {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12px;
    white-space: nowrap;
  }
  .o kbd {
    min-width: 22px;
    text-align: center;
  }
  .o span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
