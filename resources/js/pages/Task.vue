<template>
    <v-container>
        <h1>Task: {{task.name}} ({{task.code}})</h1>
        <v-textarea
            name="description"
            filled
            label="Description"
            auto-grow
            v-model="task.description"
        ></v-textarea>
        <v-btn small color="primary" @click="save">Save</v-btn>
    </v-container>
</template>
<script>
export default {
    name: 'Note',
    data: () => ({
        dialog: false,
        name: null,
        code: null,
        date: null,
        menu: false,
    }),
    computed: {
        task: function () {
            return this.$store.getters.getTask(this.$route.params.id)
        }
    },
    methods: {
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
</style>
