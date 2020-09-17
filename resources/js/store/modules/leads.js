export default {
    state: {
        leads: [],
    },
    getters: {
        getLeads: state => {
            return state.leads
        },
        getLead: state => payload => {
            return state.leads[payload.status][payload.idx]
        },
        getLeadsLead: state => {
            return (typeof state.leads.Lead === 'undefined') ? [] : state.leads.Lead;
        },
        getLeadsSaved: state => {
            return (typeof state.leads.Saved === 'undefined') ? [] : state.leads.Saved;
        },
        getLeadsApplied: state => {
            return (typeof state.leads.Applied === 'undefined') ? [] : state.leads.Applied;
        },
        getLeadsHot: state => {
            return (typeof state.leads.Hot === 'undefined') ? [] : state.leads.Hot;
        },
        getLeadsLeadCount: state => {
            let x = (typeof state.leads.Lead === 'undefined') ? [] : state.leads.Lead;
            return x.length
        },
        getLeadsAppliedCount: state => {
            let x = (typeof state.leads.Applied === 'undefined') ? [] : state.leads.Applied;
            return x.length
        },
        getLeadsSavedCount: state => {
            let x = (typeof state.leads.Saved === 'undefined') ? [] : state.leads.Saved;
            return x.length
        },
        getLeadsHotCount: state => {
            let x = (typeof state.leads.Hot === 'undefined') ? [] : state.leads.Hot;
            return x.length
        },
    },
    actions: {},
    mutations: {
        setLeads(state, leads) {
            state.leads = leads;
        },
        removeLead(state, payload) {
            let status = payload.status
            let leads = state.leads[status]
            leads.forEach(checkAndRemove);

            function checkAndRemove(item, index) {
                if (item.id === payload.id) {
                    state.leads[status].splice(index, 1);
                }
            }
        },
        setLeadStatus(state, payload) {
            let oldStatus = payload.oldStatus
            let newStatus = payload.newStatus
            let leads = state.leads[oldStatus]
            leads.forEach(checkAndRemove);

            function checkAndRemove(item, index) {
                if (item.id === payload.id) {
                    state.leads[oldStatus].splice(index, 1)
                    console.log(typeof state.leads[newStatus] )
                    if (typeof state.leads[newStatus] === 'undefined') {
                        console.log('Create new')
                        state.leads[newStatus] = []
                        console.log(typeof state.leads[newStatus] )
                    }
                    state.leads[newStatus].push(item)
                }
            }
        }
    },
};
