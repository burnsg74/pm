const getDefaultState = () => {
    return {
        currentMode: 'Planning',
        modes: ['Planning','Break','Meeting','Working'],
        start: 0,
        duration: 0,
        items: [],
    }
}

const state = getDefaultState()
const getters = {
}
const actions = {
}
const mutations = {
}

export default {
    state,
    getters,
    actions,
    mutations,
}
