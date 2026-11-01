<script>
  import { app } from "../lib/state.svelte.js";
  import TaskRow from "./TaskRow.svelte";
  import ProjectRow from "./ProjectRow.svelte";

  /** `active` is false when keyboard focus is elsewhere (sidebar), so the cursor shows dimmed. */
  let { active = true, empty = "Nothing here." } = $props();

  function select(i) {
    app.cursor = i;
    app.focus = app.view === "calendar" ? "agenda" : "main";
  }
</script>

<div class="list" role="listbox" aria-label={app.viewLabel}>
  {#each app.items as item, i (item.id)}
    {#if app.itemKind === "project"}
      <ProjectRow project={item} selected={i === app.sel} inRange={app.visualRange !== null && i >= app.visualRange[0] && i <= app.visualRange[1]} onselect={() => select(i)} onopen={() => app.openProject(item.id)} />
    {:else}
      <TaskRow task={item} selected={i === app.sel} {active} inRange={app.visualRange !== null && i >= app.visualRange[0] && i <= app.visualRange[1]} onselect={() => select(i)} onedit={() => app.editTitle()} />
    {/if}
  {:else}
    <div class="empty">
      <div class="big">{empty}</div>
      <div class="sub">Press <kbd>a</kbd> to capture something.</div>
    </div>
  {/each}
</div>

<style>
  .list {
    padding: 4px 0 40px;
  }
  .empty {
    padding: 60px 20px;
    text-align: center;
    color: var(--fg-faint);
  }
  .big {
    font-size: 15px;
    color: var(--fg-dim);
    margin-bottom: 8px;
  }
</style>
