<script>
    import {Calendar} from '@fullcalendar/core';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import listPlugin from '@fullcalendar/list';
    import multiMonthPlugin from '@fullcalendar/multimonth';
    import bootstrap5Plugin from '@fullcalendar/bootstrap5';
    import interactionPlugin, {Draggable} from '@fullcalendar/interaction';
    import {onMount} from "svelte";
    import { Modal } from 'bootstrap'

    let eventEdit = {title: "", duration: ""};
    let eventMeeting = {title: "Meeting", duration: "01:00"};
    let eventTask = {title: "Task", backgroundColor: "#6c757d", duration: "01:00"};
    let eventTicket = {title: "Ticket", backgroundColor: "#198754", duration: "01:00"};
    let calendar;
    let editEventModal;

    function setupDraggable() {
        new Draggable(document.getElementById('MeetingDragEL'), {
            eventData: function (eventEl) {
                return JSON.parse(eventEl.getAttribute('data-event'));
            }
        });
        new Draggable(document.getElementById('TaskDragEL'), {
            eventData: function (eventEl) {
                return JSON.parse(eventEl.getAttribute('data-event'));
            }
        });
        new Draggable(document.getElementById('TicketDragEL'), {
            eventData: function (eventEl) {
                return JSON.parse(eventEl.getAttribute('data-event'));
            }
        });
    }

    async function fetchEvents(calendar) {
        try {
            let response = await fetch('/api/calendar');
            let data = await response.json();
            let eventData = data.map(event => ({
                id: event.id,
                title: event.title,
                allDay: !!event.allDay,
                start: event.start,
                end: event.end,
                backgroundColor: event.backgroundColor
            }));
            console.log('eventData', eventData);
            eventData.forEach(event => {
                calendar.addEvent(event);
            });
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    function saveEvent() {
        console.log('eventEdit',eventEdit.title);
        fetch(`/api/calendar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: eventEdit.id,
                title: eventEdit.title,
                start: eventEdit.start,
                end: eventEdit.end,
                backgroundColor: eventEdit.backgroundColor
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                let calendarEvent = calendar.getEventById(eventEdit.id);
                if (calendarEvent) {
                    calendarEvent.setProp('title', eventEdit.title);
                }
                editEventModal.hide();
            })
            .catch((error) => console.error('Error:', error));
    }

    onMount(() => {
        setupDraggable();
        editEventModal = new Modal(document.getElementById('editEventModal'));

        let calendarEl = document.getElementById('calendar');
        calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin, multiMonthPlugin, interactionPlugin],
            height: '100%',
            themeSystem: 'bootstrap5',
            droppable: true,
            editable: true,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay,listWeek,dayGridWeek,dayGridMonth,multiMonthYear'
            },
            initialView: 'timeGridWeek',
            buttonText: {
                dayGridWeek: 'week list'
            },
            slotMinTime: '05:00:00',
            slotMaxTime: '18:00:00',
            eventDrop: function (info) {
                console.log('eventDrop', info);
                if (!info.event.id) {
                    info.revert();
                }
            },
            eventReceive: function (info) {
                console.log('eventReceive', info);
                info.revert();
            },
            eventChange: function (info) {
                fetch('/api/calendar', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(info.event)
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                    })
                    .catch((error) => console.error('Error:', error));

            },
            drop: function (info) {
                let eventData = JSON.parse(info.draggedEl.getAttribute('data-event'));
                eventData.start = info.date;
                eventData.end = new Date(info.date.getTime() + (60 * 60 * 1000));
                fetch('/api/calendar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventData)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.id) {
                            calendar.addEvent({
                                id: data.id,
                                title: eventData.title,
                                start: eventData.start,
                                end: eventData.end,
                                backgroundColor: eventData.backgroundColor,
                            });
                        }
                    })
                    .catch((error) => console.error('Error:', error));
            },
            eventClick: function (info) {
                eventEdit = {
                    id: info.event.id,
                    title: info.event.title,
                    start: info.event.start,
                    end: info.event.end,
                    backgroundColor: info.event.backgroundColor
                };
                editEventModal.show();
            }
        });
        calendar.render();
        fetchEvents(calendar);
    });
</script>

<div class="row mb-2">
    <div class="col">
        <div class="btn-group " role="group" aria-label="Basic example">
            <button type="button" class="btn btn-primary" id="MeetingDragEL" data-event={JSON.stringify(eventMeeting)}>
                Meeting
            </button>
            <button type="button" class="btn btn-secondary" id="TaskDragEL" data-event={JSON.stringify(eventTask)}>
                Task
            </button>
            <button type="button" class="btn btn-success" id="TicketDragEL" data-event={JSON.stringify(eventTicket)}>
                Ticket
            </button>
        </div>
    </div>
</div>
<div class="row">
    <div class="col">
        <div id="calendar"></div>
    </div>
</div>
<div class="modal fade" id="editEventModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">Edit Event {eventEdit.id}</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form>
                    <div class="mb-3">
                        <label for="recipient-name" class="col-form-label">Title:</label>
                        <input type="text" class="form-control" name="title" bind:value={eventEdit.title}/>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" on:click={saveEvent}>Save</button>
            </div>
        </div>
    </div>
</div>
