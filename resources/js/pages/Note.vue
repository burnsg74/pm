<template>
    <v-container>
        <h1>Note: {{note.name}} </h1>
        <v-row fluid v-on:dblclick="toggleEditor" @keydown.esc="toggleEditor">
            <v-col md="12">
                <v-card class="grey lighten-5">
                    <div class="html-viewer" v-show="!isEditing" style="color: black" v-html="note.html"></div>
                    <textarea class="html-viewer" rows="30" v-show="isEditing" v-model="markdown" style="width: 100%"></textarea>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn small color="primary" @click="save">Save</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>

export default {
    name: 'Note',
    data: () => ({
        isEditing: false,
        markdown: null,
    }),
    computed: {
        note: function () {
            return this.$store.getters.getNote(this.$route.params.id)
        }
    },
    methods: {
        toggleEditor: function (event) {
            this.isEditing = !this.isEditing
            if (this.isEditing) {
                this.markdown = this.note.markdown
            } else {
                let vue = this
                axios.put('/ajax/note', {
                    path: vue.note.path,
                    markdown: vue.markdown,
                }).then(function (res) {
                    vue.$store.commit('SET_NOTES', res.data.payload)
                })
            }
        },
        save: function () {
            axios.put('/ajax/note', {
                id: this.note.id,
                name: this.note.name,
                note: this.note.note,
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
