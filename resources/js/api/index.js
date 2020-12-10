import axios from '../services/axios';

export default {
    updateClientDetail(id, markdown) {
        return axios.put('/ajax/clientnote', {
            id,
            markdown,
        });
    },
    saveProjectNotes(id, markdown) {
        return axios.put('/ajax/projectnotes', {
            id,
            markdown,
        });
    },
    saveClientNotes(id, markdown) {
        return axios.put('/ajax/clientnotes', {
            id,
            markdown,
        });
    },
    updateTaskOrder(payload) {
        let status = payload.status;
        let tasks = payload.tasks;
        return axios.put('/ajax/taskorder', {status, tasks});
    },
    updateClientOrder(payload) {
        return axios.put('/ajax/clientorder', {clients: payload});
    },
    getClients() {
        return axios.get('/ajax/clients');
    },
    getEvents() {
        return axios.get('/ajax/events');
    },
    getNotes() {
        return axios.get('/ajax/notes');
    },
    saveNewTask(payload) {
        console.log('saveNewTask', payload)
        return axios.post('/ajax/task', {id: payload[0], task: payload[1]});
    },
    updateTask(payload) {
        console.log('updateTask', payload)
        return axios.put('/ajax/task', payload);
    },
    deleteTask(payload) {
        console.log(payload)
        return axios.delete('/ajax/task/' + payload.id, payload);
    },
}
