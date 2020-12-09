import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist'

import projects from "./modules/projects";
import app from "./modules/app";

export const strict = false

const vuexPersist = new VuexPersist({
    key: 'pm',
    storage: window.localStorage
})

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,
    modules: {
        app,
        projects
    },
    plugins: [vuexPersist.plugin]
});
