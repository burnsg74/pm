<template>
    <div class="pa-3">
        <v-row v-if="!isEditingTask && task !== undefined ">
            <v-col md="auto">
                <v-icon v-if="!isWorkingOnTask" @click="prev">mdi-chevron-left-box-outline</v-icon>
                <v-icon v-if="!isWorkingOnTask" color="green" @click="startTimer">mdi-timer</v-icon>
                <v-btn v-if="isWorkingOnTask" outlined @click="stopTimer">
                    <v-icon color="red">mdi-timer-off</v-icon>
                    <span v-if="isWorkingOnTask" class="font-weight-bold pl-3">{{ worklogDurFormated }}</span>
                </v-btn>
                <v-icon v-if="!isWorkingOnTask" @click="next">mdi-chevron-right-box-outline</v-icon>
                <span class="ml-3 v-text-field">{{ project.code }}-{{ task.code }} :: </span>
            </v-col>
            <v-col md="auto">
                <span
                    v-if="!showNameInput"
                    class="pt-3"
                    @mouseleave="nameHover = false"
                    @mouseover="nameHover = true"
                >
                    {{ task.name }}
                    <v-icon v-if="nameHover" dense small @click="toggleNameInput">mdi-pencil</v-icon>
                </span>
                <v-text-field
                    v-if="showNameInput"
                    v-model="taskName"
                    class="mt-0"
                    dense
                    label="Name"
                    single-line
                    v-on:keyup.enter="updateTaskName"></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col
                md="auto">
                <v-select
                    v-model="taskStatus"
                    :items="project.statuses"
                    dense
                    label="Status"
                ></v-select>
            </v-col>
            <v-col md="auto">
                <v-icon class="float-right" @click="close">mdi-close-box</v-icon>
            </v-col>
        </v-row>
        <v-row>
            <!-- View Task -->
            <v-col v-if="!isEditingTask && task !== undefined " cols="12">
                <h4 @mouseleave="detailsHover = false"
                    @mouseover="detailsHover = true">Details
                    <v-icon v-if="detailsHover" dense small @click="toggleEditingTask">mdi-pencil</v-icon>
                    <v-icon v-if="detailsHover" dense small @click="openInApp">mdi-open-in-app</v-icon>
                </h4>
                <v-card class="pa-3">
                    <div class="html-viewer" style="color: white" v-html="task.note_html"></div>
                </v-card>
            </v-col>
            <v-col v-if="!isEditingTask && task !== undefined " cols="12">
                <h4>Scratchpad</h4>
                <v-card class="pa-3">
                    <div class="html-viewer" style="color: white" v-html="task.scratchpad_html"></div>
                </v-card>
            </v-col>
            <v-col v-if="!isEditingTask && task !== undefined " cols="12">
                <h4>Comments</h4>
                <v-card class="pa-3">
                    <div class="html-viewer" style="color: white"></div>
                </v-card>
            </v-col>
            <v-col v-if="!isEditingTask && task !== undefined " cols="12">
                <h4>Worklogs</h4>
                <v-card class="pa-3">
                    <v-data-table
                        :headers="worklogHeaders"
                        :items="task.worklogs"
                        :items-per-page="5"
                        class="elevation-1"
                        dense
                    >
                        <template v-slot:item.duration="{ item }">
                            {{new Date(item.duration * 1000).toISOString().substr(11, 8)}}
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
            <v-col v-if="!isEditingTask && task !== undefined " cols="12">
                <h4>History</h4>
                <v-card class="pa-3">
                    <div class="html-viewer" style="color: white"></div>
                </v-card>
            </v-col>

            <!-- Edit Task -->
            <v-col v-if="isEditingTask" cols="12">
                <v-row fluid>
                    <v-col md="4">
                        <v-text-field v-model="editingTask.code" :prefix="project.code + '-'"
                                      label="Ticket Number"></v-text-field>
                    </v-col>
                    <v-col md="4">
                        <v-text-field v-model="editingTask.name" label="Name"></v-text-field>
                    </v-col>
                    <v-col md="4">
                        <v-select
                            v-model="editingTask.status"
                            :items="project.statuses"
                            label="Status"
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row fluid>
                    <v-col cols="12">
                        <v-textarea
                            v-model="editingTask.note_markdown"
                            auto-grow
                            label="Ticket Details"
                        ></v-textarea>
                        <v-textarea
                            v-model="editingTask.scratchpad_markdown"
                            auto-grow
                            label="Scratchpad"
                        ></v-textarea>
                        <v-btn
                            color="primary"
                            depressed
                            v-on:click="toggleEditingTask"
                        >Save
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    name: "TaskView",
    components: {},
    data: () => ({
        isEditingTask: false,
        isWorkingOnTask: false,
        nameHover: false,
        detailsHover: false,
        showNameInput: false,
        worklogHeaders: [
            { text: 'Start', value:'start_at'},
            { text: 'End', value:'end_at'},
            { text: 'Dur', value:'duration'},
        ],
        editingTask: {
            code: '',
            name: '',
            markdown: '',
            scratchpad_markdown: '',
            scratchpad_html: '',
            note_markdown: '',
            note_html: '',
            status: '',
            duration: '',
        },
        workLogTimer: null,
        worklogStart: 0,
        worklogDur: 0,
        worklogDurFormated: '00:00:00',
    }),
    computed: {
        taskStatus: {
            get() {
                return this.$store.getters.getTask().status
            },
            set(payload) {
                console.log('Update Task Status', payload)
                this.$store.dispatch('updateTaskStatus', payload)
            }
        },
        taskName: {
            get() {
                return this.$store.getters.getTask().name
            },
            set(payload) {
                console.log('Update Task Name', payload)
                this.$store.dispatch('updateTaskName', payload)
                this.$forceUpdate()
            }
        },
        task: {
            get() {
                return this.$store.getters.getTask()
            },
            set(payload) {
                console.log('Update Task', payload)
                this.$store.dispatch('updateTask', payload)
            }
        },
        project: {
            get() {
                return this.$store.getters.getProject()
            },
            set(payload) {
                console.log('Update Project', payload)
                this.$store.dispatch('updateProject', payload)
            }
        }
    },
    mounted() {
    },
    methods: {
        toggleNameInput: function () {
            this.showNameInput = !this.showNameInput
        },
        toggleEditingTask: function () {
            this.isEditingTask = !this.isEditingTask
            if (this.isEditingTask) {
                this.editingTask = JSON.parse(JSON.stringify(this.task));
            } else {
                console.log('Save')
                this.$store.dispatch('updateTask', this.editingTask)
            }
        },
        updateTaskName: function (value) {
            console.log('Update Task Name', value)
            this.showNameInput = !this.showNameInput
        },
        viewTask: function (idx) {
            this.$store.dispatch('selectedTaskIdx', idx)
            this.$store.dispatch('setView', 'task-view')
        },
        prev: function () {
            document.title = 'Test'
            this.$store.dispatch('prevTask')
        },
        next: function () {
            this.$store.dispatch('nextTask')
        },
        close: function () {
            this.$store.dispatch('setView', 'board')
        },
        openInApp: function () {
            this.$store.dispatch('openTaskInApp')
        },
        startTimer: function () {
            console.log('Start Timer')
            this.isWorkingOnTask = true;
            this.workLogTimer = setInterval(this.tickWorkLog, 1000)
        },
        stopTimer: function () {
            clearInterval(this.workLogTimer);
            this.isWorkingOnTask = false;
            if (this.worklogDur > 60) {
                this.$store.dispatch('addWorkLog', this.worklogDur)
            }
        },
        tickWorkLog: function () {
            if (this.worklogDur % 60 === 0 ) {
                console.log('Save')
            }
            this.worklogDur++;
            this.worklogDurFormated = new Date(this.worklogDur * 1000).toISOString().substr(11, 8)
        }
    }
}
</script>

<style scoped>

</style>
