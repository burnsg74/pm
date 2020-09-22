<template>
    <v-container>
        <v-list dense>
            <v-subheader>
                <h2>Tasks
                <v-icon @click="refresh">refresh</v-icon>
                </h2>
            </v-subheader>
        <v-list-item v-for="task in tasks" :key="task.id">
            <v-list-item-content>
                <v-list-item-title>
                    <router-link :to="'/task/'+task.id">{{ task.code }} :: {{ task.name }} </router-link></v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        </v-list>
    </v-container>
</template>
<script>
export default {
    name: 'Tasks',
    computed: {
        tasks: function () {
            return this.$store.state.tasks.data
        }
    },
    methods: {
        refresh: function (event) {
            console.log('Refresh')
            let vue = this
            axios.get('/ajax/tasks').then(res => {
                console.log(res.data.payload);
                vue.$store.commit('SET_TASKS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        }
    }
}
</script>
<style scoped>
</style>
