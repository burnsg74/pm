<template>
    <v-container fluid>
        <v-row>
            <v-col cols="10">
                <h2>{{ task.code }} :: <span v-if="!task.name">Not Set</span><span v-else>{{ task.name }}</span></h2>
                <v-row fluid v-on:dblclick="toggleEditor" @keydown.esc="toggleEditor">
                    <v-col md="12">
                        <v-card class="grey lighten-5">
                            <div v-show="!isEditing" class="html-viewer" style="color: black" v-html="task.html"></div>
                            <textarea v-show="isEditing" v-model="markdown" class="html-viewer" rows="30"
                                      style="width: 100%"></textarea>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="2">
                <v-select
                    v-model="selectedStatus"
                    :items="statuses"
                    dense
                    label="Status"
                    @change="updateStatus"
                ></v-select>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
export default {
    name: 'Task',
    data: () => ({
        selectedStatus: 'Backlog',
        isEditing: false,
        markdown: null,
        statuses: ['Backlog', 'In-Progress', 'Hold', 'Done']
    }),
    mounted() {
        let task = this.$store.getters.getTask(this.$route.params.id)
        this.selectedStatus = task.status
        this.$store.commit('SET_BREADCUM', [
            {
                text: 'Dashboard',
                disabled: false,
                to: '/',
            },
            {
                text: 'Client',
                disabled: false,
                to: '/client/' + task.client_id,
            },
            {
                text: 'Project',
                disabled: false,
                to: '/project/' + task.project_id,
            },
            {
                text: 'Tasks',
                disabled: false,
                to: '/tasks',
            },
        ])
    },
    computed: {
        task: function () {
            return this.$store.getters.getTask(this.$route.params.id)
        }
    },
    methods: {
        toggleEditor: function (event) {
            this.isEditing = !this.isEditing
            if (this.isEditing) {
                this.markdown = this.task.markdown
            } else {
                let vue = this
                axios.put('/ajax/note', {
                    path: vue.task.path,
                    markdown: vue.markdown,
                }).then(function (res) {
                    vue.$store.commit('SET_TASKS', res.data.payload)
                })
            }
        },
        updateStatus: function () {
            let vue = this
            axios.put('/ajax/task', {
                id: this.task.id,
                status: this.selectedStatus,
            }).then(res => {
                console.log(res.data.payload);
                let payload = {
                    id: vue.task.id,
                    status: vue.selectedStatus
                }
                vue.$store.commit('SET_TASK_STATUS', payload)
            }).catch(error => {
                console.log(error.response)
            })
        },
        save: function () {
            console.log('Save')
            this.dialog = false
            let vue = this
            axios.put('/ajax/task', {
                id: this.task.id,
                name: this.task.name,
                code: this.task.code,
                description: this.task.description,
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
.html-viewer {
    padding: 10px;
}
</style>
