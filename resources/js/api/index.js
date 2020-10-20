import axios from '../services/axios';

export default {
    updateClient(payload) {
        return axios.put('/ajax/client', payload);
    },
    updateProjectDetail(payload) {
        return axios.put('/ajax/project', payload);
    },
    updateTaskOrder(payload) {
        return axios.put('/ajax/taskorder', {tasks: payload});
    },
    updateClientOrder(payload) {
        return axios.put('/ajax/clientorder', {clients: payload});
    },
    getEvents() {
        return axios.get('/ajax/events');
    },
    addTask(payload) {
        console.log(payload)
        return axios.post('/ajax/task', payload);
    },
    updateTask(payload) {
        console.log('updateTask',payload)
        return axios.put('/ajax/task', payload);
    },
    deleteTask(payload) {
        console.log(payload)
        return axios.delete('/ajax/task/' + payload.id, payload);
    },
}
