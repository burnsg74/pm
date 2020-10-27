import Vue from 'vue';
import Vuex from 'vuex';
import breadcum from './modules/breadcum'
import clients from './modules/clients'
import notes from './modules/notes'
import VuexPersist from 'vuex-persist'
import events from "./modules/events";
export const strict = false

const vuexPersist = new VuexPersist({
    key: 'pm',
    storage: window.localStorage
})

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,
    modules: {
        breadcum,
        clients,
        notes,
        events,
    },
    plugins: [vuexPersist.plugin]
});
