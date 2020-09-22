<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card class="mx-auto">
                    <v-card-title class="cyan lighten-2">
                        <v-row no-gutters>
                            <v-col>
                                <router-link class="white--text" to="/tasks">Tasks</router-link>
                            </v-col>
                            <v-col class="text-right">
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text>
                        <div v-for="(task,idx) in tasks" :key="task.id">
                            <router-link :to="'/task/'+task.id">{{ task.code }} :: {{ task.name }}</router-link>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
export default {
    name: 'Dashboard',
    data: () => ({
        items: [
            {
                text: 'Dashboard',
                disabled: false,
                href: '/clients',
            },
        ],
    }),
    computed: {
        clients: function () {
            return this.$store.state.clients.data
        },
        projects: function () {
            return this.$store.state.projects.data
        },
        tasks: function () {
            return this.$store.state.tasks.data
        },
        notes: function () {
            return this.$store.state.notes.data
        }
    },
    mounted() {
        this.$store.commit('SET_BREADCUM', [
            {
                text: 'Dashboard',
                disabled: false,
                to: '/',
            }
        ])
    },
}
</script>

<style scoped>
</style>
