import Vue from 'vue';
import VueRouter from 'vue-router'
import Vuetify from 'vuetify';
import router from './router';
import Axios from 'axios';
import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'
import store from './store/index';
import layout from './pages/Layout'

window.Vue = Vue;
window.axios = Axios
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const files = require.context('./', true, /\.vue$/i)
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

loadProgressBar()

Vue.use(VueRouter);
Vue.use(Vuetify);

import Clock from "../js/components/Clock";

const app = new Vue({
    name:"App",
    el: '#app',
    vuetify: new Vuetify(),
    router,
    store,
    components: {Clock},
    created () {
        this.$vuetify.theme.dark = true
        this.$store.dispatch('loadEvents')
        let vue = this
        axios.get('/ajax/clients').then(res => {
            vue.$store.commit('SET_CLIENTS', res.data.payload)
        }).catch(error => {
            console.log(error.response)
        })
    },
    render: h => h(layout)
});
