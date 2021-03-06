import api from "../../api";

const getDefaultState = () => {
    return {
        selectedProjectIdx: 0,
        selectedTaskStatus: 'Backlog',
        selectedTaskIdx: 0,
        items: [],
    }
}

const state = getDefaultState()
const getters = {
    getProject: state => () => {
        return state.items[state.selectedProjectIdx]
    },
    getTasks: state => () => {
        return state.items[state.selectedProjectIdx].tasks
    },
    getTask: state => () => {
        return state.items[state.selectedProjectIdx].tasks[state.selectedTaskStatus][state.selectedTaskIdx]
    },
    getTasksByStatus: state => (status) => {
        return state.items[state.selectedProjectIdx].tasks[status]
    },
}
const actions = {
    setSelectedProjectIdx({commit}, idx) {
        commit('SET_PROJECT_IDX', idx)
    },
    selectTask({commit, state}, payload){
        commit('SET_SELECTED_TASK_STATUS', payload.status)
        commit('SET_SELECTED_TASK_IDX', payload.idx)
    },
    selectedTaskIdx({commit}, idx) {
        commit('SET_TASK_IDX', idx)
    },
    saveProjectNotes({commit, state}, markdown) {
        let project = state.items[state.selectedProjectIdx]
        api.saveProjectNotes(project.id, markdown).then(function (response) {
            let html = response.data.payload
            commit('SET_PROJECT_NOTES', {html, markdown})
        })
    },
    saveClientNotes({commit, state}, markdown) {
        let project = state.items[state.selectedProjectIdx]
        api.saveClientNotes(project.id, markdown).then(function (response) {
            let html = response.data.payload
            commit('SET_CLIENT_NOTES', {html, markdown})
        })
    },
    openClientNotesInApp({commit, state}) {
        let project = state.items[state.selectedProjectIdx]
        api.openClientNotes(project.id)
    },
    openProjectNotesInApp({commit, state}) {
        let project = state.items[state.selectedProjectIdx]
        api.openProjectNotes(project.id)
    },
    openTaskInApp({commit, state}) {
        let task = state.items[state.selectedProjectIdx].tasks[state.selectedTaskStatus][state.selectedTaskIdx]
        api.openTask(task.id)
    },
    saveNewTask({commit, state}, newTask) {
        console.log('SNT', newTask)
        let project = state.items[state.selectedProjectIdx]
        api.saveNewTask([project.id, newTask]).then(function (response) {
            let task = response.data.payload
            commit('ADD_TASK', task)
        })
    },
    updateTask({commit, state}, task) {
        console.log('SNT', task)
        api.updateTask(task).then(function (response) {
            let task = response.data.payload
            commit('UPDATE_TASK', task)
        })
    },
    updateTaskStatus({commit, state}, status) {
        console.log('SNT status', status)
        // commit('SET_TASK_IDX', idx)
        //         commit('SET_SELECTED_TASK_STATUS', payload.status)
        //         commit('SET_SELECTED_TASK_IDX', payload.idx)
        // commit('ADD_TASK', task)

        let task = Object.assign({}, state.items[state.selectedProjectIdx].tasks[state.selectedTaskStatus][state.selectedTaskIdx])
        task.status = status
        api.updateTask(task).then(function (response) {
            let task = response.data.payload
            let oldTaskStatus = state.selectedTaskStatus
            let oldTaskIdx = state.selectedTaskIdx
            commit('ADD_TASK', task)
            commit('REMOVE_TASK', {idx:oldTaskIdx,status:oldTaskStatus})
        })
    },
    updateTaskName({commit, state}, payload) {
        let task = Object.assign({}, state.items[state.selectedProjectIdx].tasks[state.selectedTaskStatus][state.selectedTaskIdx])
        task.name = payload
        api.updateTask(task).then(function (response) {
            let task = response.data.payload
            commit('UPDATE_TASK', task)
        })
    },
    changeTaskLocationReorderTask({commit, state}, payload) {
        console.log('changeTaskLocation', payload)
        const action = Object.keys(payload.event)[0]
        console.log('Action', action)
        const status = payload.status
        let task = ''
        let oldIndex = ''
        let newIndex = ''
        switch (action) {
            case 'moved':
                console.log('Move me')
                task = payload.event.moved.element
                oldIndex = payload.event.moved.oldIndex
                newIndex = payload.event.moved.newIndex
                commit('REORDER_TASK', {status, oldIndex, newIndex})
                break;
            case 'added':
                console.log('Add me')
                task = payload.event.added.element
                newIndex = payload.event.added.newIndex
                commit('ADD_TASK_TO_IDX', {status, newIndex, task})
                break;
            case 'removed':
                console.log('Remove me')
                oldIndex = payload.event.removed.oldIndex
                commit('REMOVE_TASK_IDX', {status, oldIndex})
                break;
        }
    },
    nextTask({commit}) {
        commit('INCREMENT_TASK')
    },
    prevTask({commit}) {
        commit('DECREMENT_TASK')
    },
    addWorkLog({commit, state}, worklogDur){
        console.log('Add Worklog',worklogDur)
        let taskId = state.items[state.selectedProjectIdx].tasks[state.selectedTaskStatus][state.selectedTaskIdx].id
        api.addWorkLog( {worklogDur,taskId}).then(function (response) {
            let worklog = response.data.payload
            commit('ADD_WORKLOG', worklog)
        })
    }

}
const mutations = {
    SET_PROJECTS(state, payload) {
        state.items = payload
    },
    ADD_TASK(state, payload) {
        state.items[state.selectedProjectIdx].tasks[payload.status].push(payload)
        state.selectedTaskIdx = state.items[state.selectedProjectIdx].tasks[payload.status].length - 1
        state.selectedTaskStatus = payload.status
    },
    REMOVE_TASK(state, payload) {
        console.log('Remove Task',payload)
        state.items[state.selectedProjectIdx].tasks[payload.status].splice(payload.idx,1)
    },
    UPDATE_TASK(state, payload) {
        console.log('Update Task',payload,state.selectedTaskIdx)
        state.items[state.selectedProjectIdx].tasks[payload.status][state.selectedTaskIdx] = payload
    },
    SET_PROJECT_IDX(state, payload) {
        state.selectedProjectIdx = payload
    },
    SET_TASK_IDX(state, payload) {
        state.selectedTaskIdx = payload
    },
    SET_SELECTED_TASK_IDX(state, payload){
        state.selectedTaskIdx = payload
    },
    SET_SELECTED_TASK_STATUS(state, payload){
        state.selectedTaskStatus = payload
    },
    SET_PROJECT_NOTES(state, payload) {
        state.items[state.selectedProjectIdx].project_notes_html = payload.html
        state.items[state.selectedProjectIdx].project_notes_markdown = payload.markdown
    },
    SET_CLIENT_NOTES(state, payload) {
        state.items[state.selectedProjectIdx].client_notes_html = payload.html
        state.items[state.selectedProjectIdx].client_notes_markdown = payload.markdown
    },
    INCREMENT_TASK(state) {
        if (state.selectedTaskIdx === state.items[state.selectedProjectIdx].tasks[state.selectedTaskStatus].length - 1) {
            state.selectedTaskIdx = 0
        } else {
            state.selectedTaskIdx++
        }
    },
    DECREMENT_TASK(state) {
        if (state.selectedTaskIdx === 0) {
            state.selectedTaskIdx = state.items[state.selectedProjectIdx].tasks[state.selectedTaskStatus].length - 1
        } else {
            state.selectedTaskIdx--
        }
    },
    REORDER_TASK(state, payload) {
        let status = payload.status;
        let tasks = state.items[state.selectedProjectIdx].tasks[payload.status]

        if (payload.newIndex >= tasks) {
            let i = payload.newIndex - tasks.length + 1;
            while (i--) {
                tasks.push(undefined);
            }
        }
        tasks.splice(payload.newIndex, 0, taskList.splice(payload.oldIndex, 1)[0]);

        api.updateTaskOrder({status,tasks})
    },
    ADD_TASK_TO_IDX(state, payload) {
        let status = payload.status;
        let tasks = state.items[state.selectedProjectIdx].tasks[payload.status]

        tasks.splice(payload.newIndex, 0, payload.task)

        api.updateTaskOrder({status,tasks})
    },
    REMOVE_TASK_IDX(state, payload) {
        let status = payload.status;
        let tasks = state.items[state.selectedProjectIdx].tasks[payload.status]

        tasks.splice(payload.oldIndex, 1)

        api.updateTaskOrder({status,tasks})
    },
    ADD_WORKLOG(state, payload) {
        state.items[state.selectedProjectIdx].worklog.push(payload)
    }
}

export default {
    state,
    getters,
    actions,
    mutations,
}
