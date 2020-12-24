<template>
    <div>
        <v-toolbar dense>
            <v-btn icon v-on:click="toggleEditor">
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon v-on:click="openInApp">
                <v-icon>mdi-open-in-app</v-icon>
            </v-btn>
        </v-toolbar>
        <v-row >
            <v-col md="12">
                <v-card class="client-details">
                    <div v-show="!showEditor"
                         class="html-viewer client-details"
                         v-html="project.client_notes_html"></div>
                    <v-textarea v-show="showEditor"
                                :key="autoGrowHack"
                                v-model="markdownCache"
                                auto-grow
                                class="html-viewer"
                                dark
                                rows="1"
                                style="width: 100%; background: black"></v-textarea>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>

export default {
    name: "ClientNotes",
    data: () => ({
        showEditor: false,
        autoGrowHack: false,
        markdownCache: ''
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
                this.$store.dispatch('saveClientNotes', this.markdownCache)
            }
            this.autoGrowHack = !this.autoGrowHack
        },
        openInApp: function () {
            this.$store.dispatch('openClientNotesInApp')
        }
    }
}
</script>

<style scoped>

.html-viewer {
    padding: 10px;
}
</style>
