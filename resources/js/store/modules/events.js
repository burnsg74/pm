import api from "../../api";

const getDefaultState = () => {
    return {
        items: [],
    }
}

const state = getDefaultState()

const getters = {}

const actions = {
    loadEvents({commit, state}, payload) {
        console.log('Load Events')
        api.getEvents().then(function(response){
            let items = [];
            response.data.payload.forEach(function(item) {
                let newItem = {
                    start:  new Date(item.start_at),
                    end: new Date(item.end_at),
                    name: item.name,
                    color: item.color,
                    timed: item.timed
                };
                items.push(newItem)
            })
            commit('SET_EVENTS',  items)
        });
    },
}

const mutations = {
    SET_EVENTS(state, payload) {
        console.log(payload)
        state.data = payload
    },
}



export default {
    state,
    getters,
    actions,
    mutations,
}
