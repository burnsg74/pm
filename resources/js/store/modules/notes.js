export default {
    state: {
        data: [],
    },
    getters: {
        getNote: state => (idx) => {
            return state.data[idx]
        }
    },
    actions: {},
    mutations: {
        SET_NOTES(state, payload) {
            state.data = payload
        },
    },
};
