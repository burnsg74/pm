<template>
    <v-container fluid>
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
            <!-- Viewing Task -->
            <v-col v-if="task !== undefined" v-show="isViewing" class="active-tab">
                <v-row class="view-app-bar" v-if="task !== undefined">
                    <v-col>
                        <v-icon class="float-left" @click="prev">mdi-chevron-left-box-outline</v-icon>
                        <v-icon class="float-left" @click="next">mdi-chevron-right-box-outline</v-icon>

                        <span class="ml-3">{{ task.code }} :: {{ task.name }}</span>
                    </v-col>
                    <v-col>
                        <v-icon class="float-right" @click="toggleView">mdi-close-box</v-icon>
                    </v-col>
                </v-row>
                <v-row>
                    <router-link
                        style="text-decoration: none "
                        :to="{ name: 'task-edit', params: task.id}"
                    >
                        <v-btn
                            elevation="2">
                            Edit Task
                        </v-btn>
                    </router-link>
                    <router-link
                        style="text-decoration: none "
                        :to="{ name: 'task-work', params: task.id}"
                    >
                        <v-btn
                            elevation="2">Start Work
                        </v-btn>
                    </router-link>
                    <!-- View Task -->
                    <v-col v-if="task !== undefined" cols="12">
                        <div class="html-viewer" style="color: white" v-html="task.notes"></div>
                        <v-btn
                            depressed
                            color="danger"
                            @click="deleteTask"
                        >
                            Delete
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
            <!-- Status List -->
            <v-col v-show="!isViewing" class="active-tab">
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
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Bold, Italic, Link, HardBreak, Heading,Blockquote } from 'tiptap-extensions'

export default {
    name: 'Tasks',
    components: {
        draggable,
        EditorMenuBar,
        EditorContent,
    },
    data() {
    return {
        isEditingTask: false,
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
        editor: new Editor({
            content: '',
            extensions: [
                // The editor will accept paragraphs and headline elements as part of its document schema.
                new Heading(),
                new Bold(),
                new Italic(),
                new Link(),
                new HardBreak(),
                new Blockquote(),
            ],
            onUpdate: ({getHTML, getJSON}) => {
                console.log('onUpdate')
                //this.html = getHTML()
                //this.json = getJSON()
            },
        }),
    }
    },
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
        deleteTask: function (idx) {
            this.$store.dispatch('deleteTask', idx)
        },
        setCleint: function (idx) {
            this.$store.dispatch('setSelectedClientIdx', idx)
        },
        toggleView: function (idx) {
            this.$store.dispatch('setSelectedTaskIdx', idx)
            this.isViewing = !this.isViewing
        },
        prev: function () {
            this.$store.dispatch('prevTask')
        },
        next: function () {
            this.$store.dispatch('nextTask')
        },
        toggleClientDetailVisibility: function () {
            this.editor.setContent(this.client.notes)
            this.clientDetailVisible = !this.clientDetailVisible
        },
        toggleClientDetailEditor: function () {
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
        setStatus: function (value) {
            console.log(value);
        },

    },
    beforeDestroy() {
        this.editor.destroy()
    },
}
</script>
<style scoped>

.html-viewer {
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

.view-app-bar {
    border-bottom: 1px solid chartreuse;
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
