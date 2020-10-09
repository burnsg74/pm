<template>
    <v-container fluid>
        <v-system-bar
            app
            clipped-left
            dark
            dense
        >
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs"
                            v-on="on">mdi-account-multiple
                    </v-icon>
                </template>
                <v-list dark dense class="client-dropdown">
                    <draggable v-model="clients" group="clients">
                        <v-list-item
                            v-for="(item, index) in clients"
                            :key="index"
                        >
                            <v-list-item-title>
                                <a v-on:click="setCleint(index)">{{ item.code }} :: {{ item.name }}</a>
                            </v-list-item-title>
                        </v-list-item>
                    </draggable>
                </v-list>
            </v-menu>
            <span class="project">
            {{ project.code }} :: {{ project.name }}
            </span>
            <v-btn dark x-small v-on:click="toggleClientDetailVisibility">
                <v-icon>mdi-account</v-icon>
            </v-btn>
            <v-btn dark x-small v-on:click="toggleProjectDetailVisibility">
                <v-icon>mdi-folder-multiple</v-icon>
            </v-btn>
            <v-btn color="green" x-small v-on:click="toggleAdd">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-icon @click="refresh">refresh</v-icon>
            <clock></clock>
        </v-system-bar>
        <!-- Client Details -->
        <v-row v-if="clientDetailVisible" v-on:dblclick="toggleClientDetailEditor"
               @keydown.esc="toggleClientDetailEditor">
            <v-col md="12">
                <v-card class="grey lighten-5 client-details">
                    <div v-show="!clientDetailIsEditing" class="html-viewer client-details" style="color: black"
                         v-html="client.html"></div>
                    <v-textarea v-show="clientDetailIsEditing"
                                v-model="clientDetailCache"
                                auto-grow
                                class="html-viewer"
                                dark
                                rows="1"
                                style="width: 100%; background: black"></v-textarea>
                </v-card>
            </v-col>
        </v-row>
        <!-- Project Details -->
        <v-row v-if="projectDetailVisible" v-on:dblclick="toggleProjectDetailEditor"
               @keydown.esc="toggleProjectDetailEditor">
            <v-col md="12">
                <v-card class="grey lighten-5">
                    <div v-show="!projectDetailIsEditing" class="html-viewer" style="color: black"
                         v-html="project.html"></div>
                    <v-textarea v-show="projectDetailIsEditing"
                                v-model="projectDetailCache"
                                auto-grow
                                class="html-viewer"
                                dark
                                rows="1"
                                style="width: 100%; background: black"></v-textarea>
                </v-card>
            </v-col>
        </v-row>
        <!-- Status Tabs -->
        <v-row class="ml-3 mr-3">
            <v-col :class="['rounded-t-xl', (currentStatus ==='Backlog') ? 'active-tab' : 'inactive-tab']" cols="12"
                   sm="3"
                   v-on:click="setSelectedTaskStatus('Backlog')">
                Backlog ::
                <span slot="badge"> {{ client.projects[0].tasks['Backlog'].length }} </span>
            </v-col>
            <v-col :class="['rounded-t-xl', (currentStatus ==='In-Progress') ? 'active-tab' : 'inactive-tab']" cols="12"
                   sm="3"
                   v-on:click="setSelectedTaskStatus('In-Progress')">
                In-Progress ::
                <span slot="badge"> {{ client.projects[0].tasks['In-Progress'].length }} </span>
            </v-col>
            <v-col :class="['rounded-t-xl', (currentStatus ==='Hold') ? 'active-tab' : 'inactive-tab']" cols="12"
                   sm="3"
                   v-on:click="setSelectedTaskStatus('Hold')">
                Hold ::
                <span slot="badge"> {{ client.projects[0].tasks['Hold'].length }} </span>
            </v-col>
            <v-col :class="['rounded-t-xl', (currentStatus ==='Done') ? 'active-tab' : 'inactive-tab']" cols="12"
                   sm="3"
                   v-on:click="setSelectedTaskStatus('Done')">
                Done ::
                <span slot="badge"> {{ client.projects[0].tasks['Done'].length }} </span>
            </v-col>
        </v-row>
        <!-- Status Tab Details -->
        <v-row class="ml-3 mr-3">
            <!-- Add new Task -->
            <v-col v-show="isAdding" class="active-tab">
                <v-row>
                    <v-col cols="10">
                        <v-row fluid>
                            <v-col md="12">
                                <v-text-field v-model="editingTask.code" label="Ticket Number"></v-text-field>
                                <v-text-field v-model="editingTask.name" label="Name"></v-text-field>
                                <v-textarea
                                    v-model="editingTask.markdown"
                                    label="Markdown"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="2">
                        <v-select
                            v-model="editingTask.status"
                            :items="statuses"
                            label="Status"
                        ></v-select>
                        <v-btn color="primary" small @click="save">Save</v-btn>
                    </v-col>
                </v-row>
            </v-col>

            <!-- Viewing Task -->
            <v-col v-show="isViewing" class="active-tab">
                <v-icon class="float-left" @click="prev">mdi-chevron-left-box-outline</v-icon>
                <v-icon class="float-left" @click="next">mdi-chevron-right-box-outline</v-icon>
                <v-icon class="float-right" @click="toggleView">mdi-close-box</v-icon>
                <v-row v-on:dblclick="toggleEditingTask">
                    <!-- View Task -->
                    <v-col v-if="!isEditingTask && task !== undefined " cols="12">
                        <v-row fluid>
                            <v-col md="12">
                                {{ task.code }} :: {{ task.name }}
                                <div class="html-viewer" style="color: white" v-html="task.html"></div>
                            </v-col>
                        </v-row>
                    </v-col>
                    <!-- Edit Task -->
                    <v-col cols="12">
                        <v-row fluid>
                            <v-col v-if="isEditingTask" md="12">
                                <v-text-field v-model="editingTask.code" label="Ticket Number"></v-text-field>
                                <v-select
                                    v-model="editingTask.status"
                                    :items="statuses"
                                    label="Status"
                                ></v-select>
                                <v-text-field v-model="editingTask.name" label="Name"></v-text-field>
                                <v-textarea
                                    v-model="editingTask.markdown"
                                    label="Markdown"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-col>
            <!-- Status List -->
            <v-col v-show="!isAdding && !isViewing" class="active-tab">
                <table class="tablet_mac">
                    <draggable v-model="tasks" group="tasks"
                               @end="drag=false" @start="drag=true">
                        <tr v-for="(task,idx) in tasks" :key="task.id">
                            <td class="pr-3 link">
                                <a v-on:click="toggleView(idx)">{{ task.code }}</a></td>
                            <td>{{ task.name }}</td>
                        </tr>
                    </draggable>
                </table>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import draggable from 'vuedraggable'

export default {
    name: 'Dashboard',
    components: {
        draggable,
    },
    data: () => ({
        isEditing: false,
        isEditingTask: false,
        isAdding: false,
        isViewing: false,
        clientDetailVisible: false,
        clientDetailIsEditing: false,
        clientDetailCache: '',
        projectDetailVisible: false,
        projectDetailIsEditing: false,
        projectDetailCache: '',
        showBacklog: true,
        showProgress: false,
        showHold: false,
        editingTask: {},
        statuses: ['Backlog', 'In-Progress', 'Hold', 'Done'],
    }),
    computed: {
        clients: {
            get() {
                return this.$store.getters.getClients()
            },
            set(value) {
                this.$store.dispatch('setClientOrder', value)
            }
        },
        client: function () {
            return this.$store.getters.getClient()
        },
        project: function () {
            return this.$store.getters.getProject()
        },
        currentStatus: function () {
            return this.$store.getters.getSelectedTaskStatus()
        },
        tasks: {
            get() {
                return this.$store.getters.getTasks()
            },
            set(value) {
                this.$store.dispatch('setTaskOrder', value)
            }
        },
        task: {
            get() {
                return this.$store.getters.getTask()
            },
            set(value) {
                this.$store.commit('SET_TASK', value)
            }
        },
    },
    created() {
        if (this.$store.getters.getClients().length === 0) {
            this.refresh()
        }
    },
    methods: {
        setCleint: function (idx) {
            this.$store.dispatch('setSelectedClientIdx', idx)
        },
        toggleAdd: function () {
            this.editingTask = {
                code: '',
                name: '',
                markdown: '',
                status: this.clients.selectedTaskStatus
            }
            this.isAdding = !this.isAdding
        },
        toggleView: function (idx) {
            this.$store.dispatch('setSelectedTaskIdx', idx)
            this.isViewing = !this.isViewing
        },
        toggleEditingTask: function () {
            if (this.isEditingTask === false) {
                this.editingTask = JSON.parse(JSON.stringify(this.task));
                this.isEditingTask = true;
            } else {
                this.isEditingTask = false;

                let vue = this
                // Need to Track Old Status so we can grap it here
                axios.put('/ajax/task', {
                    id: this.editingTask.id,
                    status: this.editingTask.status,
                    code: this.editingTask.code,
                    name: this.editingTask.name,
                    markdown: this.editingTask.markdown,
                }).then(res => {
                    this.$store.dispatch('updateTask', res.data.payload)
                }).catch(error => {
                    console.log(error.response)
                })
                this.editingTask = {};
            }
        },
        prev: function () {
            this.$store.dispatch('prevTask')
        },
        next: function () {
            this.$store.dispatch('nextTask')
        },
        toggleClientDetailVisibility: function () {
            console.log('toggleClientDetailVisibility', this.clientDetailVisible)
            this.clientDetailVisible = !this.clientDetailVisible
        },
        toggleClientDetailEditor: function () {
            console.log('toggleClientDetailEditor', this.clientDetailIsEditing)
            if (this.clientDetailIsEditing === false) {
                this.clientDetailCache = JSON.parse(JSON.stringify(this.client.markdown));
                this.clientDetailIsEditing = true;
            } else {
                this.clientDetailIsEditing = false;
                this.$store.dispatch('updateClientDetail', this.clientDetailCache)
                this.clientDetailCache = '';
            }
        },
        toggleProjectDetailVisibility: function () {
            this.projectDetailVisible = !this.projectDetailVisible
        },
        toggleProjectDetail: function (event) {
            this.showProjectDetail = !this.showProjectDetail
        },
        toggleProjectDetailEditor: function () {
            console.log('toggleProjectDetailEditor', this.projectDetailIsEditing)
            if (this.projectDetailIsEditing === false) {
                this.projectDetailCache = JSON.parse(JSON.stringify(this.project.markdown));
                this.projectDetailIsEditing = true;
            } else {
                this.projectDetailIsEditing = false;
                this.$store.dispatch('updateProjectDetail', this.projectDetailCache)
                this.projectDetailCache = '';
            }
        },
        setSelectedTaskStatus: function (status) {
            this.isViewing = false;
            this.$store.dispatch('setSelectedTaskStatus', status)
        },
        update: function () {
            this.isViewing = !this.isViewing
        },
        save: function () {
            this.isAdding = false;
            let client = this.$store.getters.getClient()
            let project = this.$store.getters.getProject()

            axios.post('/ajax/task', {
                client_id: client.id,
                project_id: project.id,
                code: this.editingTask.code,
                status: this.editingTask.status,
                name: this.editingTask.name,
                markdown: this.editingTask.markdown,
            }).then(res => {
                this.$store.dispatch('addTask', res.data.payload)
                this.isViewing = true
            }).catch(error => {
                console.log('ERROR')
                console.log(error)
            })
        },
        setStatus: function (value) {
            console.log(value);
        },
        refresh: function (event) {
            console.log('Refresh')
            let vue = this
            axios.get('/ajax/clients').then(res => {
                vue.$store.commit('SET_CLIENTS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        }
    }
}
</script>
<style scoped>
.project {
    color: chartreuse;
    font-size: 16px;
    margin-right: 10px;
}

.html-viewer {
    padding: 10px;
    border-style: solid;
    border-color: aqua;
    border-width: 1px;
}

hr {
    color: aqua;
}

.client-dropdown {
    border-style: solid;
    border-color: aqua;
    border-width: 1px;
}

.active-tab {
    border-style: solid;
    border-color: aqua;
    border-width: 1px;
}

.inactive-tab {
    border-style: solid;
    border-color: grey;
    border-width: 1px;
}

.html-viewer {
    padding: 10px;
}
</style>
