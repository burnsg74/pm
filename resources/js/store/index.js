import Vue from 'vue';
import Vuex from 'vuex';
import breadcum from './modules/breadcum'
import clients from './modules/clients'
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
        breadcum,
        clients,
        notes,
    },
    plugins: [vuexPersist.plugin]
});
