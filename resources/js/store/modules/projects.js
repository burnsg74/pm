import api from "../../api";

const getDefaultState = () => {
    return {
        selectedProjectIdx: 0,
        selectedTaskIdx: 0,
        items: [],
    }
}

const state = getDefaultState()
const getters = {
    getProject: state => () => {
        return state.items[state.selectedProjectIdx]
    },
    getTask: state => () => {
        return state.items[state.selectedProjectIdx].tasks[state.selectedTaskIdx]
    },
    getTasksByStatus: state => (status) => {
        return state.items[state.selectedProjectIdx].tasks.filter(
            item => item.status == status
        );
    },
}
const actions = {
    setSelectedProjectIdx({commit}, idx) {
        commit('SET_PROJECT_IDX', idx)
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
    nextTask({commit}) {
        commit('INCREMENT_TASK')
    },
    prevTask({commit}) {
        commit('DECREMENT_TASK')
    }

}
const mutations = {
    SET_PROJECTS(state, payload) {
        state.items = payload
    },
    ADD_TASK(state, payload) {
        state.items[state.selectedProjectIdx].tasks.push(payload)
    },
    UPDATE_TASK(state, payload) {
        state.items[state.selectedProjectIdx].tasks[state.selectedTaskIdx] = payload
    },
    SET_PROJECT_IDX(state, payload) {
        state.selectedProjectIdx = payload
    },
    SET_TASK_IDX(state, payload) {
        state.selectedTaskIdx = payload
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
        if (state.selectedTaskIdx === state.items[state.selectedProjectIdx].tasks.length - 1) {
            state.selectedTaskIdx = 0
        } else {
            state.selectedTaskIdx++
        }
    },
    DECREMENT_TASK(state) {
        if (state.selectedTaskIdx === 0) {
            state.selectedTaskIdx = state.items[state.selectedProjectIdx].tasks.length - 1
        } else {
            state.selectedTaskIdx--
        }
    },
}

export default {
    state,
    getters,
    actions,
    mutations,
}
