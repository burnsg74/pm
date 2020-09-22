export default {
    state: {
        data: [],
    },
    getters: {

        getClient: state => (id) => {
            return state.data.find(
                item => item.id == id
            );
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
