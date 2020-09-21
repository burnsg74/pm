export default {
    state: {
        data: [],
    },
    getters: {
        getClient: state => (idx) => {
            return state.data[idx]
        }
    },
    actions: {},
    mutations: {
        SET_CLIENTS(state, payload) {
            state.data = payload
        },
        UPDATE_CLIENTS(state, payload) {
            state.data = payload
        },
    },
};
