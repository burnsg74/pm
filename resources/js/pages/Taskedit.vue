<template>
    <v-container fluid>
            <v-row>
                <v-col cols="10">
                    <v-row fluid>
                        <v-col md="12">
                            <v-text-field v-model="editingTask.code" label="Ticket Number"></v-text-field>
                            <v-text-field v-model="editingTask.name" label="Name"></v-text-field>
                            <editor-menu-bar class="editor-toolbar" v-slot="{ commands, isActive }" :editor="editor">
                                <div>
                                <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
                                    Bold
                                </button>
                                    <button :class="{ 'is-active': isActive.heading({ level: 1 }) }" @click="commands.heading({ level: 1 })">
                                        H1
                                    </button>
                                <button :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })">
                                    H2
                                </button>
                                </div>
                            </editor-menu-bar>
                            <editor-content class="editor" :editor="editor"/>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="2">
                    <v-select
                        v-model="editingTask.status"
                        :items="statuses"
                        label="Status"
                    ></v-select>
                    <v-btn color="primary" small @click="update">Update</v-btn>
                </v-col>
            </v-row>
    </v-container>
</template>
<script>
import {Editor, EditorContent, EditorMenuBar} from 'tiptap'
import {Bold, Italic, Link, HardBreak, Heading, Blockquote} from 'tiptap-extensions'

export default {
    name: 'Tasknew',
    components: {
        EditorMenuBar,
        EditorContent,
    },
    data() {
        return {
            isdirty: false,
            saveTimer: null,
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
                onUpdate: () => {
                    this.isdirty = true
                },
            }),
            editingTask: {'status':'Backlog'},
            statuses: ['Backlog', 'In-Progress', 'Hold', 'Done'],
        }
    },
    mounted() {
        this.editingTask = Object.assign({}, this.task)
        this.editor.setContent(this.task.notes)
    },
    computed: {
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
        update: function() {
            this.isdirty = false
            this.editingTask.notes = this.editor.getHTML()
            this.$store.dispatch('updateTask', this.editingTask)
            this.$router.push('/tasks')
        }
    },
    beforeDestroy() {
        this.editor.destroy()
    },
}
</script>
<style scoped>
.editor-toolbar {
    border-bottom: 1px solid chartreuse;
}
.editor {
    border-style: solid;
    border-color: white;
    border-width: 1px;
}
button {
    border-style: solid;
    border-color: white;
    border-width: 1px;
}
</style>
