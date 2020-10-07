export default {
    state: {
        selectedClientIdx: 0,
        selectedProjectIdx: 0,
        selectedTaskStatus: 'Backlog',
        selectedTaskIdx: 0,
        data: [],
    },
    getters: {
        getClients: state => () => {
            return state.data
        },
        getClient: state => () => {
            return state.data[state.selectedClientIdx]
        },
        getClientById: state => (id) => {
            return state.data.find(
                item => item.id == id
            );
        },
        getProject: state => () => {
            return state.data[state.selectedClientIdx].projects[state.selectedProjectIdx]
        },
        getSelectedTaskStatus:state => () => {
            return state.selectedTaskStatus
        },
        getTasks: state => () => {
            return state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus]
        },
        getTask: state => () => {
            return state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus][state.selectedTaskIdx]
        },
    },
    actions: {
        setClientById ({commit,state}, id) {
            commit('SET_CLIENT_IDX', state.data.findIndex(item => item.id == id))
        },
        setSelectedTaskStatus ({commit}, status) {
            commit('SET_SELECTED_TASK_STATUS', status)
        },
        setSelectedTaskIdx ({commit}, idx) {
            commit('SET_SELECTED_TASK_IDX', idx)
        },
        setTask ({commit,state}, id) {
            commit('SET_CLIENT_IDX', state.data.findIndex(item => item.id == id))
        },
        updateTask({commit}, payload) {
            commit('UPDATE_TASK', payload)
        },
        addTask({commit}, payload) {
            commit('ADD_TASK', payload)
        },
        nextTask({commit}) {
            commit('INCREMENT_TASK')
        },
        prevTask({commit}) {
            commit('DECREMENT_TASK')
        }

    },
    mutations: {
        SET_CLIENT_IDX(state, payload) {
            state.selectedClientIdx = payload
        },
        SET_SELECTED_TASK_IDX(state, payload) {
            state.selectedTaskIdx = payload
        },
        SET_SELECTED_TASK_STATUS(state, payload) {
            state.selectedTaskStatus = payload
        },
        SET_CLIENTS(state, payload) {
            state.data = payload
        },
        UPDATE_CLIENTS(state, payload) {
            state.data = payload
        },
        ADD_TASK(state,payload) {
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[payload.status].push(payload)
            state.selectedTaskStatus = payload.status
            state.selectedTaskIdx = state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[payload.status].length - 1
        },
        UPDATE_TASK(state,payload) {
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus].splice(state.selectedTaskIdx, 1);
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[payload.status].push(payload)
            state.selectedTaskStatus = payload.status
            state.selectedTaskIdx = state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[payload.status].length - 1
        },
        INCREMENT_TASK(state) {
            if (state.selectedTaskIdx === state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus].length -1) {
                state.selectedTaskIdx = 0
            } else {
                state.selectedTaskIdx++
            }
        },
        DECREMENT_TASK(state) {
            if (state.selectedTaskIdx === 0) {
                state.selectedTaskIdx = state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus].length - 1
            } else {
                state.selectedTaskIdx--
            }
        },
        SET_TASK(state, payload) {
            console.log('SET TASK',payload)
            /*state.data[state.selectedClientIdx]
                .projects[state.selectedProjectIdx]
                .tasks[state.selectedTaskStatus][state.selectedTaskIdx] = payload*/
        },
    },
};
