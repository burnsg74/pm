<template>
    <v-container fluid>
        <v-row>
            <v-col cols="10">
                <v-row fluid>
                    <v-col md="12">
                        <v-text-field v-model="name" label="Name"></v-text-field>
                        <v-textarea
                            v-model="markdown"
                            label="Markdown"
                        ></v-textarea>
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="2">
                <v-text-field v-model="ticket" label="Ticket Number"></v-text-field>
                <v-select
                    label="Client"
                    v-model="selectedClient"
                    :items="clients"
                    item-text="name"
                    item-value="id"
                ></v-select>
                <v-select
                    label="Project"
                    v-model="selectedProject"
                    :items="projects"
                    item-text="name"
                    item-value="id"
                ></v-select>
                <v-select
                    v-model="selectedStatus"
                    :items="statuses"
                    label="Status"
                ></v-select>
                <v-btn color="primary" small @click="save">Save</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
export default {
    name: 'NewTasks',
    data: () => ({
        selectedClient: null,
        selectedProject: null,
        selectedStatus: 'Backlog',
        ticket: null,
        name: null,
        markdown: null,
        statuses: ['Backlog', 'In-Progress', 'Hold', 'Done']
    }),
    mounted() {
    },
    computed: {
        clients: function () {
            return this.$store.state.clients.data
        },
        projects: function () {
            return this.$store.state.projects.data
        }
    },
    methods: {
        save: function () {
            console.log('Save')
            let vue = this
            axios.post('/ajax/task', {
                client_id: this.selectedClient,
                project_id: this.selectedProject,
                status: this.selectedStatus,
                ticket: this.ticket,
                name: this.name,
                markdown: this.markdown,
            }).then(res => {
                console.log(res.data.payload);
            }).catch(error => {
                console.log(error.response)
            })
        },
    }
}
</script>
<style scoped>
</style>
