<script>
  import { app } from "../lib/state.svelte.js";
  import { actions, prettyKeys } from "../lib/actions.js";
  import { fuzzyMatch } from "../lib/fuzzy.js";
  import { STATUS_LABEL, VIEWS, projectOf, sortProjects } from "../lib/model.js";

  const palette = app.palette;
  let query = $state(palette.query ?? "");
  let index = $state(0);

  // Typing ">" in quick open flips to commands, like Zed / VS Code.
  const mode = $derived(palette.mode === "open" && query.startsWith(">") ? "commands" : palette.mode);
  const text = $derived(palette.mode === "open" && query.startsWith(">") ? query.slice(1) : query);

  const GLYPH = { inbox: "◌", next: "○", waiting: "◔", someday: "☁", done: "✓" };

  const commandItems = $derived([
    ...actions
      .filter((a) => a.palette !== false)
      .map((a) => ({ id: a.id, icon: "⌘", label: a.title, detail: a.group, keys: a.keys[0] ? prettyKeys(a.keys[0]) : "", bonus: 0, run: () => a.run({ count: null }) })),
    { id: "theme.dark", icon: "◐", label: "Theme: Dark (One Dark)", detail: "App", keys: "", bonus: 0, run: () => app.setTheme("dark") },
    { id: "theme.light", icon: "◑", label: "Theme: Light (One Light)", detail: "App", keys: "", bonus: 0, run: () => app.setTheme("light") },
  ]);

  const openItems = $derived([
    ...VIEWS.map((v) => ({ id: `v:${v.id}`, icon: v.icon, label: v.label, detail: "View", keys: `g${v.key}`, bonus: 3, run: () => app.go(v.id) })),
    ...sortProjects(app.projects, app.tasks).map((p) => ({ id: `p:${p.id}`, icon: "▤", label: p.title, detail: p.outcome || `Project · ${p.status}`, keys: "", bonus: 2, run: () => app.openProject(p.id) })),
    ...app.contexts.map((c) => ({
      id: `c:${c.name}`,
      icon: "@",
      label: `@${c.name}`,
      detail: `Filter Next Actions · ${c.count} open`,
      keys: "",
      bonus: 1,
      run: () => {
        app.go("next");
        app.filter = { ...app.filter, context: c.name };
      },
    })),
    ...[...app.tasks]
      .sort((a, b) => (a.status === "done") - (b.status === "done"))
      .map((t) => ({
        id: `t:${t.id}`,
        icon: GLYPH[t.status],
        label: t.title,
        detail: `${STATUS_LABEL[t.status]}${projectOf(app.projects, t) ? ` · ${projectOf(app.projects, t).title}` : ""}${t.context ? ` · @${t.context}` : ""}`,
        keys: "",
        bonus: 0,
        run: () => app.goToTask(t.id),
      })),
  ]);

  const pickItems = $derived((palette.items ?? []).map((i) => ({ ...i, icon: i.icon ?? "", bonus: 0, keys: "" })));

  const base = $derived(mode === "commands" ? commandItems : mode === "pick" ? pickItems : openItems);

  const ranked = $derived.by(() => {
    const q = text.trim();
    let out;
    if (!q) out = base.map((item) => ({ item, indices: [] }));
    else {
      out = [];
      for (const item of base) {
        const m = fuzzyMatch(q, item.label);
        if (m) out.push({ item, indices: m.indices, score: m.score + item.bonus });
      }
      out.sort((a, b) => b.score - a.score);
    }
    out = out.slice(0, 60);
    if (mode === "pick" && palette.allowCreate && q && !base.some((i) => i.label.toLowerCase().replace(/^@/, "") === q.toLowerCase().replace(/^@/, ""))) {
      out.push({ item: { id: "__create", create: true, icon: "+", label: `Create ${palette.allowCreate} “${q}”`, detail: "", keys: "" }, indices: [] });
    }
    return out;
  });

  const active = $derived(Math.min(index, ranked.length - 1));

  const title = $derived(mode === "commands" ? "Command palette" : mode === "pick" ? palette.title : "Quick open");
  const placeholder = $derived(mode === "commands" ? "Type a command…" : mode === "pick" ? (palette.placeholder ?? "Type to filter…") : "Search tasks, projects, views…   (> for commands)");

  function parts(label, indices) {
    if (!indices.length) return [{ t: label, hl: false }];
    const set = new Set(indices);
    const out = [];
    for (let i = 0; i < label.length; i++) {
      const hl = set.has(i);
      if (out.length && out[out.length - 1].hl === hl) out[out.length - 1].t += label[i];
      else out.push({ t: label[i], hl });
    }
    return out;
  }

  function choose(entry) {
    if (!entry) return;
    const { item } = entry;
    app.closePalette();
    if (mode === "pick") {
      if (item.create) palette.oncreate(query.trim());
      else palette.onpick(item);
    } else item.run();
  }

  function onkeydown(e) {
    const k = e.key;
    const ctrl = e.ctrlKey && !e.metaKey;
    if (k === "ArrowDown" || (ctrl && (k === "n" || k === "j"))) {
      e.preventDefault();
      index = Math.min(active + 1, ranked.length - 1);
    } else if (k === "ArrowUp" || (ctrl && (k === "p" || k === "k"))) {
      e.preventDefault();
      index = Math.max(active - 1, 0);
    } else if (k === "Enter") {
      e.preventDefault();
      choose(ranked[active]);
    } else if (k === "Escape") {
      e.preventDefault();
      app.closePalette();
    } else if (e.metaKey && k.toLowerCase() === "p") {
      e.preventDefault();
      if (e.shiftKey) app.openCommands();
      else if (palette.mode === "open") app.closePalette();
      else app.openQuickOpen();
    } else if (k === "Tab") {
      e.preventDefault();
    }
  }

  function focusInput(el) {
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }

  function follow(selected) {
    return (el) => {
      if (selected) el.scrollIntoView({ block: "nearest" });
    };
  }
</script>

<div class="scrim" role="presentation" onclick={(e) => e.target === e.currentTarget && (app.closePalette())}>
  <div class="box" role="dialog" aria-label={title} tabindex="-1">
    <div class="input-row">
      <span class="mode">{title}</span>
      <input bind:value={query} oninput={() => (index = 0)} {onkeydown} {placeholder} spellcheck="false" autocomplete="off" {@attach focusInput} />
      <kbd>esc</kbd>
    </div>
    <div class="results" role="listbox" aria-label="Results">
      {#each ranked as { item, indices }, i (item.id)}
                <!-- Mouse convenience only: keyboard access is the app-wide Vim key engine in App.svelte. -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="res" class:on={i === active} role="option" aria-selected={i === active} tabindex="-1" onmousemove={() => (index = i)} onclick={() => choose(ranked[i])} {@attach follow(i === active)}>
          <span class="ic">{item.icon}</span>
          <span class="label">{#each parts(item.label, indices) as part, pi (pi)}{#if part.hl}<mark>{part.t}</mark>{:else}{part.t}{/if}{/each}</span>
          <span class="detail">{item.detail ?? ""}</span>
          {#if item.keys}<kbd>{item.keys}</kbd>{/if}
        </div>
      {:else}
        <div class="none">No matches</div>
      {/each}
    </div>
    <div class="foot">
      <span><kbd>↑↓</kbd> or <kbd>⌃j</kbd><kbd>⌃k</kbd> move</span>
      <span><kbd>↵</kbd> select</span>
      {#if palette.mode === "open"}<span><kbd>&gt;</kbd> commands</span>{/if}
    </div>
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
    z-index: 50;
  }
  .box {
    width: min(660px, 92vw);
    background: var(--bg-elev);
    border: 1px solid var(--border-soft);
    border-radius: 8px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  .input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-soft);
  }
  .mode {
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-bg);
    padding: 2px 7px;
    border-radius: 9px;
    white-space: nowrap;
  }
  input {
    flex: 1;
    all: unset;
    flex: 1;
    font-size: 14px;
    color: var(--fg-bright);
  }
  input::placeholder {
    color: var(--fg-faint);
  }
  .results {
    max-height: 52vh;
    overflow-y: auto;
    padding: 4px;
  }
  .res {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 30px;
    padding: 0 10px;
    border-radius: var(--radius);
    cursor: pointer;
  }
  .res.on {
    background: var(--bg-sel);
    color: var(--fg-bright);
  }
  .ic {
    width: 16px;
    text-align: center;
    color: var(--fg-dim);
  }
  .label {
    flex-shrink: 0;
    max-width: 62%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  mark {
    background: none;
    color: var(--accent);
    font-weight: 600;
  }
  .detail {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: var(--fg-faint);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .none {
    padding: 22px;
    text-align: center;
    color: var(--fg-faint);
  }
  .foot {
    display: flex;
    gap: 16px;
    padding: 6px 12px;
    border-top: 1px solid var(--border-soft);
    font-size: 11px;
    color: var(--fg-faint);
  }
</style>
