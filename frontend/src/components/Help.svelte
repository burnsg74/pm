<script>
  import { app } from "../lib/state.svelte.js";
  import { actions, prettyKeys } from "../lib/actions.js";

  const ORDER = ["Move", "Go to", "Capture & edit", "Organize", "Filter", "Calendar", "App"];

  const groups = ORDER.map((name) => ({
    name,
    rows: actions.filter((a) => a.group === name).map((a) => ({ title: a.title, keys: a.keys.map(prettyKeys).join("  ") })),
  }));

  function onkeydown(e) {
    if (["Escape", "q", "?"].includes(e.key)) {
      e.preventDefault();
      app.helpOpen = false;
    }
  }
</script>

<svelte:window {onkeydown} />

<div class="scrim" role="presentation" onclick={() => (app.helpOpen = false)}>
  <div class="sheet" role="dialog" aria-label="Keyboard shortcuts" tabindex="-1">
    <div class="head">
      <h1>Keyboard</h1>
      <span><kbd>esc</kbd> or <kbd>?</kbd> to close</span>
    </div>

    <div class="cols">
      {#each groups as g (g.name)}
        <section>
          <h3>{g.name}</h3>
          {#each g.rows as r (r.title)}
            <div class="r"><span>{r.title}</span><kbd>{r.keys}</kbd></div>
          {/each}
        </section>
      {/each}

      <section>
        <h3>Vim basics</h3>
        <div class="r"><span>Counts</span><kbd>5j 3dd 12G</kbd></div>
        <div class="r"><span>Pending keys show in the status bar; wait for the hint popup</span></div>
        <div class="r"><span>Visual: select range, then <b>x</b> <b>dd</b> <b>mn</b> <b>p</b> act on all</span><kbd>v</kbd></div>
        <div class="r"><span>Insert: typing in a prompt</span><kbd>↵ esc</kbd></div>
      </section>

      <section class="wide">
        <h3>Capture syntax</h3>
        <pre>Buy cables @errands #home due:fri start:mon !
Call the bank &amp;Sam-Lee -- notes after two dashes</pre>
        <div class="r"><span><b>@ctx</b> context · <b>#proj</b> project (prefix match) · <b>&amp;name</b> waiting for</span></div>
        <div class="r"><span><b>due:</b> deadline · <b>start:</b> tickler, hidden from Next until then · <b>!</b> star</span></div>
        <h3>Dates</h3>
        <div class="r"><span>today tom fri · next mon · +3d 2w 1m · eow eom · 11/5 · nov 5 · 2026-11-05 · none</span></div>
      </section>
    </div>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: var(--scrim);
    display: grid;
    place-items: center;
    z-index: 70;
  }
  .sheet {
    width: min(1040px, 94vw);
    max-height: 86vh;
    overflow-y: auto;
    background: var(--bg-elev);
    border: 1px solid var(--border-soft);
    border-radius: 8px;
    box-shadow: var(--shadow);
    padding: 16px 22px 22px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
    color: var(--fg-faint);
    font-size: 12px;
  }
  h1 {
    margin: 0;
    font-size: 17px;
    color: var(--fg-bright);
  }
  .cols {
    columns: 3 280px;
    column-gap: 28px;
  }
  section {
    break-inside: avoid;
    margin-bottom: 14px;
  }
  .wide {
    column-span: all;
  }
  h3 {
    margin: 12px 0 4px;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .r {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    padding: 2px 0;
    font-size: 12.5px;
  }
  .r kbd {
    flex-shrink: 0;
  }
  b {
    color: var(--fg-bright);
    font-weight: 600;
  }
  pre {
    margin: 4px 0 8px;
    padding: 8px 10px;
    background: var(--bg);
    border-radius: var(--radius);
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg-bright);
    user-select: text;
  }
</style>
