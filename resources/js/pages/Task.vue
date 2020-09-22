<template>
    <v-container>
        <h2>{{task.code}} :: {{task.name}} </h2>
        <v-row fluid v-on:dblclick="toggleEditor" @keydown.esc="toggleEditor">
            <v-col md="12">
                <v-card class="grey lighten-5">
                    <div class="html-viewer" v-show="!isEditing" style="color: black" v-html="task.html"></div>
                    <textarea class="html-viewer" rows="30" v-show="isEditing" v-model="markdown" style="width: 100%"></textarea>
                </v-card>
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
    mounted() {
        let task = this.$store.getters.getTask(this.$route.params.id)
        this.$store.commit('SET_BREADCUM', [
            {
                text: 'Dashboard',
                disabled: false,
                to: '/',
            },
            {
                text: 'Client',
                disabled: false,
                to: '/client/'+task.client_id,
            },
            {
                text: 'Project',
                disabled: false,
                to: '/project/'+task.project_id,
            },
            {
                text: 'Tasks',
                disabled: false,
                to: '/tasks',
            },
        ])
    },
    computed: {
        task: function () {
            return this.$store.getters.getTask(this.$route.params.id)
        }
    },
    methods: {
        toggleEditor: function (event) {
            this.isEditing = !this.isEditing
            if (this.isEditing) {
                this.markdown = this.task.markdown
            } else {
                let vue = this
                axios.put('/ajax/note', {
                    path: vue.task.path,
                    markdown: vue.markdown,
                }).then(function (res) {
                    vue.$store.commit('SET_TASKS', res.data.payload)
                })
            }
        },
        save: function () {
            console.log('Save')
            this.dialog = false
            let vue = this
            axios.put('/ajax/task', {
                id: this.task.id,
                name: this.task.name,
                code: this.task.code,
                description: this.task.description,
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
