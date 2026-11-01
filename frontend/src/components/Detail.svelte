<script>
  import { app } from "../lib/state.svelte.js";
  import { formatDate, formatLong, relative } from "../lib/dates.js";
  import { STATUS_LABEL, projectOf } from "../lib/model.js";

  const item = $derived(app.selected);
  const kind = $derived(app.itemKind);
  const project = $derived(kind === "task" && item ? projectOf(app.projects, item) : null);
  const stats = $derived(kind === "project" && item ? app.projectStatsFor(item) : null);
  const projectTasks = $derived(kind === "project" && item ? app.tasks.filter((t) => t.project === item.id && t.status !== "done") : []);
  const when = (iso) => (iso ? `${formatLong(iso)} · ${formatDate(iso, app.today)}` : "");
</script>

<aside class="detail">
  {#if !item}
    <div class="none">Nothing selected</div>
  {:else if kind === "task"}
    <h2>{item.title}</h2>
    <div class="status {item.status}">{STATUS_LABEL[item.status]}{item.starred ? " · ★ starred" : ""}</div>
    <dl>
      {#if project}<dt>Project</dt><dd class="purple"><button class="link" tabindex="-1" onclick={() => app.openProject(project.id)}>▤ {project.title}</button></dd>{/if}
      {#if project?.outcome}<dt>Outcome</dt><dd class="dim">{project.outcome}</dd>{/if}
      {#if item.context}<dt>Context</dt><dd class="cyan">@{item.context}</dd>{/if}
      {#if item.due}<dt>Due</dt><dd class:red={item.status !== "done" && item.due < app.today}>{when(item.due)}</dd>{/if}
      {#if item.start}<dt>Starts</dt><dd>{when(item.start)}</dd>{/if}
      {#if item.status === "waiting"}
        <dt>Waiting for</dt><dd>{item.waiting_for || "someone"}</dd>
        {#if item.waiting_since}<dt>Since</dt><dd>{formatDate(item.waiting_since, app.today)} · {relative(item.waiting_since, app.today)}</dd>{/if}
      {/if}
    </dl>
    {#if item.notes}
      <div class="notes">{item.notes}</div>
    {:else}
      <div class="hint"><kbd>E</kbd> to add notes</div>
    {/if}
    <div class="foot">Created {item.created.slice(0, 10)}{item.completed ? ` · Done ${item.completed.slice(0, 10)}` : ""}</div>
  {:else if kind === "project"}
    <h2>{item.title}</h2>
    <div class="status {item.status === 'active' ? 'next' : item.status}">{item.status}{stats.stalled ? " · ⚠ stalled: needs a next action" : ""}</div>
    <dl>
      {#if item.outcome}<dt>Outcome</dt><dd>{item.outcome}</dd>{:else}<dt>Outcome</dt><dd class="dim"><kbd>co</kbd> to define done</dd>{/if}
      {#if item.area}<dt>Area</dt><dd>{item.area}</dd>{/if}
      <dt>Progress</dt><dd>{stats.done} done · {stats.next} next · {stats.waiting} waiting</dd>
    </dl>
    {#if item.notes}<div class="notes">{item.notes}</div>{/if}
    {#if projectTasks.length}
      <div class="sub">OPEN TASKS</div>
      <ul>
        {#each projectTasks as t (t.id)}<li><span class="s">{STATUS_LABEL[t.status][0]}</span> {t.title}</li>{/each}
      </ul>
    {/if}
  {:else if kind === "step"}
    <h2>{item.title}</h2>
    <div class="status next">{item.group}</div>
    <div class="notes">{item.detail}</div>
    {#if item.stat}<div class="statline">{item.stat(app.stats)}</div>{/if}
  {/if}
</aside>

<style>
  .detail {
    height: 100%;
    overflow-y: auto;
    padding: 16px 16px 40px;
    background: var(--bg-panel);
    user-select: text;
  }
  .none {
    color: var(--fg-faint);
    padding-top: 20px;
    text-align: center;
  }
  h2 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--fg-bright);
    line-height: 1.3;
  }
  .status {
    display: inline-block;
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 9px;
    background: var(--bg-elev);
    color: var(--fg-dim);
    margin-bottom: 14px;
  }
  .status.next {
    color: var(--accent);
  }
  .status.waiting {
    color: var(--orange);
  }
  .status.done {
    color: var(--green);
  }
  .status.inbox {
    color: var(--yellow);
  }
  dl {
    display: grid;
    grid-template-columns: 78px 1fr;
    gap: 6px 10px;
    margin: 0 0 14px;
    font-size: 12px;
  }
  dt {
    color: var(--fg-faint);
  }
  dd {
    margin: 0;
    color: var(--fg);
    overflow-wrap: anywhere;
  }
  .purple {
    color: var(--purple);
  }
  .cyan {
    color: var(--cyan);
  }
  .red {
    color: var(--red);
  }
  .dim {
    color: var(--fg-dim);
  }
  .link {
    all: unset;
    cursor: pointer;
  }
  .link:hover {
    text-decoration: underline;
  }
  .notes {
    white-space: pre-wrap;
    font-size: 12.5px;
    line-height: 1.55;
    padding: 10px 12px;
    background: var(--bg);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    color: var(--fg);
  }
  .hint {
    color: var(--fg-faint);
    font-size: 12px;
  }
  .foot {
    margin-top: 18px;
    font-size: 11px;
    color: var(--fg-faint);
  }
  .sub {
    margin: 18px 0 6px;
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--fg-faint);
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 12px;
  }
  li {
    padding: 2px 0;
  }
  .s {
    display: inline-block;
    width: 14px;
    color: var(--fg-faint);
    font-family: var(--font-mono);
  }
  .statline {
    margin-top: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--accent);
  }
</style>
