import Vue from 'vue';
import Vuex from 'vuex';
import clients from './modules/clients'
import projects from './modules/projects'
import tasks from './modules/tasks'
import notes from './modules/notes'
import VuexPersist from 'vuex-persist'
export const strict = false

const vuexPersist = new VuexPersist({
    key: 'pm',
    storage: window.localStorage
})

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,
    modules: {
        clients,
        projects,
        tasks,
        notes,
    },
    plugins: [vuexPersist.plugin]
});
