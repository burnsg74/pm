export default {
    state: {
        data: [],
    },
    getters: {
        getProject: state => (idx) => {
            return state.data[idx]
        }
    },
    actions: {},
    mutations: {
        SET_PROJECTS(state, payload) {
            state.data = payload
        },
    },
};
