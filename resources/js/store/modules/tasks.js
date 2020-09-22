export default {
    state: {
        data: [],
    },
    getters: {
        getTask: state => (id) => {
            return state.data.find(
                item => item.id == id

            );
        }
    },
    actions: {},
    mutations: {
        SET_TASKS(state, payload) {
            state.data = payload
        },
    },
};
