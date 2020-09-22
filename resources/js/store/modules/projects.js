export default {
    state: {
        data: [],
    },
    getters: {
        getProject: state => (id) => {
            return state.data.find(
                item => item.id == id
            );
        }
    },
    actions: {},
    mutations: {
        SET_PROJECTS(state, payload) {
            state.data = payload
        },
    },
};
