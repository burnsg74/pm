<template>
    <v-container>
        <h1>Projects
            <v-icon @click="refresh">refresh</v-icon>
        </h1>
        <v-list-item v-for="project in projects" :key="project.id">
            <v-list-item-content>
                <v-list-item-title>
                    <router-link :to="'/project/'+project.id">{{ project.code }} :: {{ project.name }}</router-link>
                    </v-list-item-title>
            </v-list-item-content>
        </v-list-item>
    </v-container>
</template>
<script>
export default {
    name: 'Projects',
    computed: {
        projects: function () {
            return this.$store.state.projects.data
        }

    },
    methods: {
        refresh: function (event) {
            console.log('Refresh')
            let vue = this
            axios.get('/ajax/projects').then(res => {
                console.log(res.data.payload);
                vue.$store.commit('SET_PROJECTS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        }
    }
}
</script>
<style scoped>
</style>
