import Vue from 'vue';
import Vuetify from 'vuetify';
import Axios from './services/axios';
import { loadProgressBar } from 'axios-progress-bar'
import store from './store/index';
import 'axios-progress-bar/dist/nprogress.css'

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    wsHost: window.location.hostname,
    wssHost: window.location.hostname,
    wsPort: process.env.MIX_WEBSOCKETS_PORT,
    wssPort: process.env.MIX_WEBSOCKETS_PORT,
    encrypted: true,
    disableStats: true
});

window.Vue = Vue
window.axios = Axios
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const files = require.context('./', true, /\.vue$/i)
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

loadProgressBar()

Vue.use(Vuetify);
export default new Vuetify({
    theme: { dark: true },
})

import Main from './Main'
const app = new Vue({
    name:"App",
    el: '#app',
    vuetify: new Vuetify(),
    store,
    render: h => h(Main)
});
