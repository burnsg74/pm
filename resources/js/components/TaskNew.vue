<template>
    <div>
        <v-row fluid>
            <v-col md="4">
                <v-text-field v-model="newTask.code" :prefix="project.code + '-'"
                              label="Ticket Number"></v-text-field>
            </v-col>
            <v-col md="4">
                <v-text-field v-model="newTask.name" label="Name"></v-text-field>
            </v-col>
            <v-col md="4">
                <v-select
                    v-model="newTask.status"
                    :items="project.statuses"
                    label="Status"
                ></v-select>
            </v-col>
        </v-row>
        <v-row fluid>
            <v-col md="12">
                <v-textarea
                    v-model="newTask.markdown"
                    auto-grow
                    label="Description"
                ></v-textarea>
            </v-col>
        </v-row>
        <v-row fluid>
            <v-col cols="12">
                <v-btn color="$orange" small @click="cancel">Cancel</v-btn>
                <v-btn color="primary" small @click="save">Save</v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script>

export default {
    name: "TaskNew",
    computed: {
        project: function () {
            return this.$store.getters.getProject()
        }
    },
    data: () => ({
        newTask: {
            code: '',
            name: '',
            markdown: '',
            status: '',
        }
    }),
    methods: {
        save: function () {
            this.$store.dispatch('saveNewTask',this.newTask)
            this.$store.dispatch('setShowTaskNew',false)
        },
        cancel: function () {
            this.$store.dispatch('setView', 'board')
        }
    }
}
</script>

<style scoped>

</style>
