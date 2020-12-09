<template>
    <div class="pa-3">
        <v-row v-if="!isEditingTask && task !== undefined " class="view-app-bar">
            <v-col class="pa-3 lighten-1">
                <v-icon class="float-left" @click="prev">mdi-chevron-left-box-outline</v-icon>
                <v-icon class="float-left" @click="next">mdi-chevron-right-box-outline</v-icon>
                <span class="ml-3">{{project.code}}-{{ task.code }} :: {{ task.name }}</span>
            </v-col>
            <v-col>
                <v-icon class="float-right" @click="close">mdi-close-box</v-icon>
            </v-col>
        </v-row>
        <v-row v-on:dblclick="toggleEditingTask">
            <!-- View Task -->
            <v-col v-if="!isEditingTask && task !== undefined " cols="12">
                <v-card class="pa-3">
                <div class="html-viewer" style="color: white" v-html="task.note_html"></div>
                <div class="html-viewer" style="color: white" v-html="task.scratchpad_html"></div>
                </v-card>
            </v-col>
            <!-- Edit Task -->
            <v-col v-if="isEditingTask" cols="12">
                <v-row fluid>
                    <v-col md="4">
                        <v-text-field v-model="editingTask.code" :prefix="project.code + '-'" label="Ticket Number"></v-text-field>
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
                        >Save</v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    name: "TaskView",
    data: () => ({
        isEditingTask: false,
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
        worklogStart: 0,
        worklogDur: 0
    }),
    computed: {
        task: function () {
            return this.$store.getters.getTask()
        },
        project: function () {
            return this.$store.getters.getProject()
        }
    },
    methods: {
        toggleEditingTask: function () {
            this.isEditingTask = !this.isEditingTask
            if (this.isEditingTask) {
                this.editingTask = JSON.parse(JSON.stringify(this.task));
            } else {
                console.log('Save')
                this.$store.dispatch('updateTask', this.editingTask )
            }
        },
        viewTask: function (idx) {
            this.$store.dispatch('selectedTaskIdx', idx)
            this.$store.dispatch('setView', 'task-view')
        },
        prev: function () {
            this.$store.dispatch('prevTask')
        },
        next: function () {
            this.$store.dispatch('nextTask')
        },
        close: function () {
            this.$store.dispatch('setView', 'board')
        }
    }
}
</script>

<style scoped>

</style>
