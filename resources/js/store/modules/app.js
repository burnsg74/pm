const getDefaultState = () => {
    return {
        view: 'board',
        showClientNotes: false,
        showProjectNotes: false,
        showTaskNew: false,
    }
}

const state = getDefaultState()
const getters = {
    getShowClientNotes: state => () => {
        return state.showClientNotes
    },
    getShowProjectNotes: state => () => {
        return state.showProjectNotes
    },
    getShowTaskNew: state => () => {
        return state.showTaskNew
    },
    getView: state => () => {
        return state.view
    },
}
const actions = {
    setView({commit}, view) {
        console.log('setView', view)
        commit('SET_VIEW', view)
    },
    toggleClientNotes({commit}) {
        commit('TOGGLE_CLIENT_NOTES')
    },
    toggleProjectNotes({commit}) {
        commit('TOGGLE_PROJECT_NOTES')
    },
    toggleTaskNew({commit}) {
        commit('TOGGLE_TASK_NEW')
    },
    setShowTaskNew({commit}, flag) {
        commit('SET_SHOW_TASK_NEW', flag);
    }
}
const mutations = {

    SET_VIEW(state, payload) {
        state.view = payload
    },
    TOGGLE_CLIENT_NOTES(state) {
        state.showClientNotes = !state.showClientNotes
    },
    TOGGLE_PROJECT_NOTES(state) {
        state.showProjectNotes = !state.showProjectNotes
    },
    TOGGLE_TASK_NEW(state) {
        state.showTaskNew = !state.showTaskNew
    },
    SET_SHOW_TASK_NEW(state, payload) {
        state.showTaskNew = payload
    }
}

export default {
    state,
    getters,
    actions,
    mutations,
}
