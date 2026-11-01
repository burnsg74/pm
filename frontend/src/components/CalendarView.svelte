<script>
  import { Calendar } from "@fullcalendar/core";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import listPlugin from "@fullcalendar/list";
  import interactionPlugin from "@fullcalendar/interaction";
  import { app } from "../lib/state.svelte.js";
  import { calendarEvents } from "../lib/model.js";
  import { formatLong } from "../lib/dates.js";
  import TaskList from "./TaskList.svelte";

  let calendar = $state.raw(null);
  let title = $state("");

  const MODE_LABEL = { dayGridMonth: "Month", dayGridWeek: "Week", listWeek: "Agenda" };

  /** Mounts FullCalendar on the element; torn down automatically when the element goes away. */
  function mountCalendar(el) {
    const cal = new Calendar(el, {
      plugins: [dayGridPlugin, listPlugin, interactionPlugin],
      initialView: app.calMode,
      initialDate: app.calDate,
      firstDay: 1,
      headerToolbar: false,
      height: "100%",
      fixedWeekCount: false,
      dayMaxEvents: 3,
      editable: true,
      selectable: true,
      unselectAuto: false,
      eventDurationEditable: false,
      datesSet: (arg) => (title = arg.view.title),
      dateClick: (info) => {
        app.setCalDate(info.dateStr);
        app.focus = "main";
      },
      eventClick: (info) => {
        app.setCalDate(info.event.startStr.slice(0, 10));
        app.focusId(info.event.extendedProps.taskId);
        app.focus = "agenda";
      },
      moreLinkClick: (info) => {
        app.setCalDate(info.date.toISOString().slice(0, 10));
        return "";
      },
      // Dragging an event onto another day reschedules the date it represents.
      eventDrop: (info) => {
        const { taskId, kind } = info.event.extendedProps;
        app.reschedule(taskId, kind, info.event.startStr.slice(0, 10));
      },
    });
    cal.render();
    calendar = cal;
    return () => {
      cal.destroy();
      calendar = null;
    };
  }

  // Keep FullCalendar in step with app state.
  $effect(() => {
    if (!calendar) return;
    const events = calendarEvents(app.tasks);
    calendar.batchRendering(() => {
      for (const source of calendar.getEventSources()) source.remove();
      calendar.addEventSource(events);
    });
  });

  $effect(() => {
    if (!calendar) return;
    const mode = app.calMode;
    const date = app.calDate;
    if (calendar.view.type !== mode) calendar.changeView(mode);
    calendar.gotoDate(date);
    if (mode !== "listWeek") calendar.select(date);
    else calendar.unselect();
  });
</script>

<div class="cal-view">
  <section class="grid-pane" class:focused={app.focus !== "agenda"}>
    <div class="head">
      <div class="title">{title}</div>
      <div class="modes">
        {#each Object.entries(MODE_LABEL) as [mode, label] (mode)}
          <button class:on={app.calMode === mode} tabindex="-1" onclick={() => (app.calMode = mode)}>{label}</button>
        {/each}
      </div>
      <div class="keys"><kbd>h j k l</kbd> day · <kbd>H L</kbd> month · <kbd>.</kbd> today · <kbd>V</kbd> view · <kbd>↵</kbd> day's tasks</div>
    </div>
    <div class="fc-host" {@attach mountCalendar}></div>
    <div class="legend"><span class="due"></span> due <span class="start"></span> starts (hidden from Next until then)</div>
  </section>

  <section class="agenda" class:focused={app.focus === "agenda"}>
    <div class="agenda-head">
      <span class="day">{formatLong(app.calDate)}</span>
      <span class="hint"><kbd>a</kbd> add to this day</span>
    </div>
    <div class="agenda-list">
      <TaskList active={app.focus === "agenda"} empty="Nothing scheduled this day." />
    </div>
  </section>
</div>

<style>
  .cal-view {
    display: flex;
    height: 100%;
    min-height: 0;
  }
  .grid-pane {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--border);
  }
  .title {
    font-size: 15px;
    font-weight: 600;
    color: var(--fg-bright);
    min-width: 140px;
  }
  .modes {
    display: flex;
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .modes button {
    all: unset;
    padding: 2px 10px;
    cursor: pointer;
    font-size: 12px;
    color: var(--fg-dim);
  }
  .modes button.on {
    background: var(--accent-bg);
    color: var(--accent);
  }
  .keys {
    margin-left: auto;
    font-size: 11px;
    color: var(--fg-faint);
  }
  .fc-host {
    flex: 1;
    min-height: 0;
    padding: 0 0 0 0;
    outline: 2px solid transparent;
    outline-offset: -2px;
  }
  .grid-pane.focused .fc-host {
    outline-color: color-mix(in srgb, var(--accent) 35%, transparent);
  }
  .legend {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 14px;
    border-top: 1px solid var(--border);
    font-size: 11px;
    color: var(--fg-faint);
  }
  .legend span {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }
  .legend .due {
    background: var(--red);
  }
  .legend .start {
    background: var(--accent);
    margin-left: 10px;
  }
  .agenda {
    width: 380px;
    flex-shrink: 1;
    min-width: 240px;
    display: flex;
    flex-direction: column;
    background: var(--bg-panel);
  }
  .agenda-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
  }
  .day {
    font-weight: 600;
    color: var(--fg-bright);
  }
  .hint {
    font-size: 11px;
    color: var(--fg-faint);
  }
  .agenda-list {
    flex: 1;
    overflow-y: auto;
  }
  .agenda.focused .agenda-head {
    box-shadow: inset 0 -2px 0 var(--accent);
  }
</style>
