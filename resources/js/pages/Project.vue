<template>
    <v-container fluid>
        <editor-menu-bar class="editor-toolbar" v-slot="{ commands, isActive }" :editor="editor">
            <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
                Bold
            </button>
        </editor-menu-bar>
        <editor-content :editor="editor"/>
        <v-btn
            depressed
            color="primary"
            @click="save"
        >
            Save
        </v-btn>
    </v-container>
</template>
<script>
import {Editor, EditorContent, EditorMenuBar} from 'tiptap'
import {Bold, Italic, Link, HardBreak, Heading, Blockquote} from 'tiptap-extensions'

export default {
    name: 'Project',
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
                onUpdate: ({getHTML, getJSON}) => {
                    console.log('onUpdate')
                    this.isdirty = true
                    clearInterval(this.saveTimer);
                    this.saveTimer = setInterval(this.save, 10000)
                    //this.html = getHTML()
                    //this.json = getJSON()
                },
            }),
        }
    },
    mounted() {
        this.editor.setContent(this.project.notes)
    },
    computed: {
        project: function () {
            return this.$store.getters.getProject()
        },
    },
    methods: {
        save: function() {
            this.isdirty = false
            clearInterval(this.saveTimer);
            this.saveTimer = null
            this.$store.dispatch('updateProjectNotes', this.editor.getHTML())
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
</style>
