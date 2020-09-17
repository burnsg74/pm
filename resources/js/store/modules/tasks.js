export default {
    state: {
        data: [],
    },
    getters: {
        getTask: state => (idx) => {
            return state.data[idx]
        }
    },
    actions: {},
    mutations: {
        SET_TASKS(state, payload) {
            state.data = payload
        },
    },
};
