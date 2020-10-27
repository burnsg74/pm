import VueRouter from "vue-router";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import Client from "./pages/Client";
import Notes from "./pages/Notes";
import Note from "./pages/Note";
import Project from "./pages/Project";
import Tasks from "./pages/Tasks";
import Tasknew from "./pages/Tasknew";
import Taskedit from "./pages/Taskedit";
import Taskwork from "./pages/TaskWork";

export default new VueRouter({
    mode: 'history',
    routes: [
        {
            name: 'home',
            path: '/',
            component: Tasks
        },
        {
            name: 'clients',
            path: '/clients',
            component: Clients
        },
        {
            name: 'client',
            path: '/client',
            component: Client
        },
        {
            name: 'project',
            path: '/project',
            component: Project
        },
        {
            name: 'tasks',
            path: '/tasks',
            component: Tasks
        },
        {
            name: 'task-new',
            path: '/task/new',
            component: Tasknew
        },
        {
            name: 'task-edit',
            path: '/task/edit',
            component: Taskedit
        },
        {
            name: 'task-work',
            path: '/task/work',
            component: Taskwork
        },
        {
            name: 'notes',
            path: '/notes',
            component: Notes
        },
        {
            name: 'note',
            path: '/note/:id',
            component: Note
        },
        {
            name: 'calendar',
            path: '/calendar',
            component: Calendar
        },
    ]
});
