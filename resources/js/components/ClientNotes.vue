<template>
    <v-row v-on:dblclick="toggleEditor">
        <v-col md="12">
            <v-card class="client-details">
                <div class="html-viewer client-details"
                     v-show="!showEditor"
                     v-html="project.client_notes_html"></div>
                <v-textarea v-show="showEditor"
                            v-model="markdownCache"
                            :key="autoGrowHack"
                            auto-grow
                            class="html-viewer"
                            dark
                            rows="1"
                            style="width: 100%; background: black"></v-textarea>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>

export default {
    name: "ClientNotes",
    data: () => ({
        showEditor: false,
        autoGrowHack: false,
        markdownCache:''
    }),
    computed: {
        project: function () {
            return this.$store.getters.getProject()
        }
    },
    methods: {
        toggleEditor: function () {
            this.showEditor = !this.showEditor
            if (this.showEditor) {
                this.markdownCache = this.project.client_notes_markdown
            } else {
                this.$store.dispatch('saveClientNotes',this.markdownCache)
            }
            this.autoGrowHack = !this.autoGrowHack
        }
    }
}
</script>

<style scoped>

.html-viewer {
    padding: 10px;
}
</style>
