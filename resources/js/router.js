import VueRouter from "vue-router";
import Dashboard from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import Client from "./pages/Client";
import Notes from "./pages/Notes";
import Note from "./pages/Note";
import Project from "./pages/Project";
import Tasks from "./pages/Tasks";
import Tasknew from "./pages/Tasknew";
import Taskedit from "./pages/Taskedit";

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
