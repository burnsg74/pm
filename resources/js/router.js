import VueRouter from "vue-router";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import Client from "./pages/Client";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import Notes from "./pages/Notes";
import Note from "./pages/Note";
import Tasks from "./pages/Tasks";
import TaskNew from "./pages/TaskNew";
import Task from "./pages/Task";

export default new VueRouter({
    mode: 'history',
    routes: [
        {
            name: 'home',
            path: '/',
            component: Dashboard
        },
        {
            name: 'clients',
            path: '/clients',
            component: Clients
        },
        {
            name: 'client',
            path: '/client/:id',
            component: Client
        },
        {
            name: 'projects',
            path: '/projects',
            component: Projects
        },
        {
            name: 'project',
            path: '/project/:id',
            component: Project
        },
        {
            name: 'tasks',
            path: '/tasks',
            component: Tasks
        },
        {
            name:'task-new',
            path: '/task-new',
            component: TaskNew
        },
        {
            name: 'task',
            path: '/task/:id',
            component: Task
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
