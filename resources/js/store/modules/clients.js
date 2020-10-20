import api from "../../api";

const getDefaultState = () => {
    return {
        selectedClientIdx: 0,
        selectedProjectIdx: 0,
        selectedTaskStatus: 'Backlog',
        selectedTaskIdx: 0,
        data: [],
    }
}

const state = getDefaultState()

export default {
    state,
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
        getSelectedTaskStatus: state => () => {
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
        updateClientNotes({commit, state}, notes) {
            console.log('updateClient')
            commit('SET_CLIENT_NOTES', notes)
            api.updateClient(state.data[state.selectedClientIdx]).then(function (response) {
                console.log('Saved', response)
            })
        },
        updateProjectDetail({commit, state}, markdown) {
            console.log('updateProjectDetail')
            let project = state.data[state.selectedClientIdx].projects[state.selectedProjectIdx]
            api.updateProjectDetail(project.id, markdown).then(function (response) {
                let html = response.data.payload
                commit('SET_PROJECT_NOTE', {markdown, html})
            })
        },
        setClientOrder({commit, state}, payload) {
            console.log('setClientOrder')
            commit('SET_CLIENTS', payload)
            api.updateClientOrder(payload)
        },
        setTaskOrder({commit, state}, payload) {
            console.log('setTaskOrder')
            commit('SET_TASK_ORDER', payload)
            api.updateTaskOrder(payload)
        },
        setClientById({commit, state}, id) {
            commit('SET_CLIENT_IDX', state.data.findIndex(item => item.id == id))
        },
        setSelectedTaskStatus({commit}, status) {
            commit('SET_SELECTED_TASK_STATUS', status)
        },
        setSelectedClientIdx({commit}, idx) {
            commit('SET_CLIENT_IDX', idx)
        },
        setSelectedTaskIdx({commit}, idx) {
            commit('SET_SELECTED_TASK_IDX', idx)
        },
        setTask({commit, state}, id) {
            commit('SET_CLIENT_IDX', state.data.findIndex(item => item.id == id))
        },
        updateTask({commit, state}, payload) {
            console.log('updateTask')
            payload = {
                ...payload,
                'id':state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus][state.selectedTaskIdx].id,
                'client_id': state.data[state.selectedClientIdx].id,
                'project_id': state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].id
            }
            console.log('Update Task ', payload)
            api.updateTask(payload).then(function (response) {
                commit('UPDATE_TASK', response.data.payload)
            })
        },
        addTask({commit, state}, payload) {
            payload = {
                ...payload,
                'client_id': state.data[state.selectedClientIdx].id,
                'project_id': state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].id
            }
            console.log('add Task 2', payload)
            api.addTask(payload).then(function (response) {
                commit('ADD_TASK', response.data.payload)
            })
        },
        deleteTask({commit, state}, payload) {
            let task = state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus][state.selectedTaskIdx]
            console.log('Task', task)
            api.deleteTask(task).then(function (response) {
                console.log('Saved', response)
                commit('DELETE_TASK')
                commit('INCREMENT_TASK')
            })
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
        SET_CLIENT_NOTES(state, payload) {
            state.data[state.selectedClientIdx].notes = payload
        },
        SET_PROJECT_NOTE(state, payload) {
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].markdown = payload.markdown
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].html = payload.html
        },
        ADD_TASK(state, payload) {
            console.log('Adding Task',payload)
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[payload.status].push(payload)
            state.selectedTaskStatus = payload.status
            state.selectedTaskIdx = state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[payload.status].length - 1
        },
        UPDATE_TASK(state, payload) {
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus].splice(state.selectedTaskIdx, 1);
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[payload.status].push(payload)
            state.selectedTaskStatus = payload.status
            state.selectedTaskIdx = state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[payload.status].length - 1
        },
        DELETE_TASK(state) {
            console.log('DELETE_TASK')
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus].splice(state.selectedTaskIdx, 1);
        },
        INCREMENT_TASK(state) {
            if (state.selectedTaskIdx === state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus].length - 1) {
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
            console.log('SET TASK', payload)
            /*state.data[state.selectedClientIdx]
                .projects[state.selectedProjectIdx]
                .tasks[state.selectedTaskStatus][state.selectedTaskIdx] = payload*/
        },
        SET_TASK_ORDER(state, payload) {
            state.data[state.selectedClientIdx].projects[state.selectedProjectIdx].tasks[state.selectedTaskStatus] = payload
        },
    },
};
