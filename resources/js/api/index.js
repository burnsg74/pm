import axios from '../services/axios';

export default {
    updateClientDetail(id,markdown) {
        return axios.put('/ajax/clientnote', {
            id,
            markdown,
        });
    },
    updateProjectDetail(id,markdown) {
        return axios.put('/ajax/projectnote', {
            id,
            markdown,
        });
    },
    updateTaskOrder(payload) {
        return axios.put('/ajax/taskorder', {tasks:payload});
    },
    updateClientOrder(payload) {
        return axios.put('/ajax/clientorder', {clients:payload});
    },
}
