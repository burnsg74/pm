<template>
    <v-container fluid>
        <v-row>
            <v-col cols="10">
                <v-list dense>
                    <v-subheader>
                        <h2>Tasks
                            <v-icon @click="refresh">refresh</v-icon>
                        </h2>
                    </v-subheader>
                    <v-list-item v-for="task in tasks" :key="task.id">
                        <v-list-item-content>
                            <v-list-item-title>
                                <router-link :to="'/task/'+task.id">{{ task.code }} :: {{ task.name }}</router-link>
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-col>
            <v-col cols="2">
                <span class="pb-3">
                <v-btn small color="primary" to="/task-new">Add new task</v-btn>
                </span>
                <v-select
                    v-model="selectedClient"
                    :items="clients"
                    clearable
                    dense
                    item-text="name"
                    item-value="id"
                    label="Client"
                ></v-select>
                <v-select
                    v-model="selectedStatus"
                    :items="statuses"
                    clearable
                    dense
                    label="Status"
                ></v-select>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
export default {
    name: 'Tasks',
    data: () => ({
        selectedClient: null,
        selectedStatus: null,
        statuses: ['Backlog', 'In-Progress', 'Hold', 'Done']
    }),
    computed: {
        tasks: function () {
            return this.$store.getters.getTasks(this.selectedClient, this.selectedStatus)
        },
        clients: function () {
            return this.$store.state.clients.data
        }
    },
    methods: {
        refresh: function (event) {
            console.log('Refresh')
            let vue = this
            axios.get('/ajax/tasks').then(res => {
                console.log(res.data.payload);
                vue.$store.commit('SET_TASKS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        }
    }
}
</script>
<style scoped>
</style>
