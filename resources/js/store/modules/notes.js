export default {
    state: {
        data: [],
    },
    getters: {
        getNote: state => (id) => {
            return state.data.find(
                item => item.id == id
            );
        }
    },
    actions: {},
    mutations: {
        SET_NOTES(state, payload) {
            state.data = payload
        },
    },
};
