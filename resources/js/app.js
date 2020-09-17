import Vue from 'vue';
import VueRouter from 'vue-router'
import Vuetify from 'vuetify';
import router from './router';
import Axios from 'axios';
import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'
import store from './store/index';
import CKEditor from '@ckeditor/ckeditor5-vue';


window.Vue = Vue;
window.axios = Axios
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const files = require.context('./', true, /\.vue$/i)
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

Vue.use(VueRouter);
Vue.use(Vuetify);
Vue.use(CKEditor);

const app = new Vue({
    name:"App",
    el: '#app',
    vuetify: new Vuetify(),
    router,
    store,
    data: () => ({
        drawer: null,
        drawerRight: null,
        right: false,
        left: false,
        items: [
            {
                text: 'Dashboard',
                disabled: false,
                to: '/',
            },
        ],
    }),
    created () {
        this.$vuetify.theme.dark = true
    },
});
