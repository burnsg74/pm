import VueRouter from "vue-router";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import Client from "./pages/Client";
import Notes from "./pages/Notes";
import Note from "./pages/Note";

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
