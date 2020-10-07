<template>
    <v-container>
        <!-- Top Menu Bar -->
        <v-row>
            <v-col class="pt-0">
                <h2>
                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs"
                                    v-on="on">mdi-account-multiple
                            </v-icon>
                        </template>
                        <v-list>
                            <v-list-item
                                v-for="(item, index) in clients"
                                :key="index"
                            >
                                <v-list-item-title>
                                    <router-link :to="'/client/'+item.id">{{ item.code }} :: {{
                                            item.name
                                        }}
                                    </router-link>
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    {{ project.code }} :: {{ project.name }}
                    <v-icon v-on:click="toggleClientDetail">mdi-account</v-icon>
                    <v-icon v-on:click="toggleProjectDetail">mdi-folder-multiple</v-icon>
                    <v-icon v-on:click="toggleAdd">mdi-plus</v-icon>
                    <v-icon @click="refresh" class="float-right">refresh</v-icon>
                </h2>
            </v-col>
        </v-row>
        <!-- Client Details -->
        <v-row v-if="showClientDetail" fluid v-on:dblclick="toggleEditor" @keydown.esc="toggleEditor">
            <v-col md="12">
                <v-card class="grey lighten-5">
                    <div v-show="!isEditing" class="html-viewer" style="color: black"
                         v-html="client.html"></div>
                    <textarea v-show="isEditing" v-model="markdown" class="html-viewer" rows="30"
                              style="width: 100%"></textarea>
                </v-card>
            </v-col>
        </v-row>
        <!-- Project Details -->
        <v-row v-if="showProjectDetail" fluid v-on:dblclick="toggleProjectDetail"
               @keydown.esc="toggleProjectDetail">
            <v-col md="12">
                <v-card class="grey lighten-5">
                    <div v-show="!isEditing" class="html-viewer" style="color: black"
                         v-html="project.html"></div>
                    <textarea v-show="isEditing" v-model="markdown" class="html-viewer" rows="30"
                              style="width: 100%"></textarea>
                </v-card>
            </v-col>
        </v-row>
        <!-- Status Tabs -->
        <v-row>
            <v-col
                :class="['rounded-t-xl', (currentStatus ==='Backlog') ? 'active-tab' : 'inactive-tab']"
                v-on:click="setSelectedTaskStatus('Backlog')">
                Backlog ::
                <span slot="badge"> {{ client.projects[0].tasks['Backlog'].length }} </span>
            </v-col>
            <v-col :class="['rounded-t-xl', (currentStatus ==='In-Progress') ? 'active-tab' : 'inactive-tab']"
                   v-on:click="setSelectedTaskStatus('In-Progress')">
                In-Progress ::
                <span slot="badge"> {{ client.projects[0].tasks['In-Progress'].length }} </span>
            </v-col>
            <v-col :class="['rounded-t-xl', (currentStatus ==='Hold') ? 'active-tab' : 'inactive-tab']"
                   v-on:click="setSelectedTaskStatus('Hold')">
                Hold ::
                <span slot="badge"> {{ client.projects[0].tasks['Hold'].length }} </span>
            </v-col>
            <v-col :class="['rounded-t-xl', (currentStatus ==='Done') ? 'active-tab' : 'inactive-tab']"
                   v-on:click="setSelectedTaskStatus('Done')">
                Done ::
                <span slot="badge"> {{ client.projects[0].tasks['Done'].length }} </span>
            </v-col>
        </v-row>
        <!-- Status Tab Details -->
        <v-row>
            <!-- Add new Task -->
            <v-col v-show="isAdding" class="active-tab">
                <v-row >
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
                <table class="tablet_mac" >
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
    name: 'Client',
    components: {
        draggable,
    },
    watch: {
        '$route'(to, from) {
            this.$store.dispatch('setClientById', this.$route.params.id)
            this.isViewing = false;
        },
    },
    data: () => ({
        isEditing: false,
        isEditingTask: false,
        isAdding: false,
        isViewing: false,
        showClientDetail: false,
        showProjectDetail: false,
        showBacklog: true,
        showProgress: false,
        showHold: false,
        editingTask: {},
        statuses: ['Backlog', 'In-Progress', 'Hold', 'Done'],
    }),
    computed: {
        clients: function () {
            return this.$store.getters.getClients()
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
        tasks: function () {
            return this.$store.getters.getTasks()
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
    methods: {
        toggleAdd: function () {
            this.editingTask = {
                code: '',
                name:'',
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
            if (this.isEditingTask === false){
                this.editingTask = JSON.parse(JSON.stringify(this.task)) ;
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
        toggleClientDetail: function (event) {
            this.showClientDetail = !this.showClientDetail
        },
        toggleProjectDetail: function (event) {
            this.showProjectDetail = !this.showProjectDetail
        },
        toggleEditor: function (event) {
            this.isEditing = !this.isEditing
            if (this.isEditing) {
                this.markdown = this.client.markdown
            } else {
                let vue = this
                axios.put('/ajax/note', {
                    path: vue.client.path,
                    markdown: vue.markdown,
                }).then(function (res) {
                    vue.$store.commit('SET_CLIENTS', res.data.payload)
                })
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
                console.log(res.data.payload);
                vue.$store.commit('SET_CLIENTS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        }
    }
}
</script>
<style scoped>
.html-viewer {
    padding: 10px;
}

hr {
    color: aqua;
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
