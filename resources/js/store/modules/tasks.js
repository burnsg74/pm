export default {
    state: {
        data: [],
    },
    getters: {
        getTasks: state => (clientId,status) => {
            if (!state.data) return []

            return state.data.filter(function(item){
                let clientMatch = true
                let statusMatch = true
                if (clientId) clientMatch = (item.client_id === clientId)
                if (status) statusMatch = (item.status === status)
                return (clientMatch && statusMatch)
            })
        },
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
        SET_TASK_STATUS(state, payload) {
            let task = state.data.find(
                item => item.id == payload.id
            )
            task.status = payload.status
        },
    },
};
