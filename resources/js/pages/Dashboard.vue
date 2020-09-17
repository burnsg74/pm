<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card class="mx-auto">
                    <v-card-title class="cyan lighten-2">
                        <v-row no-gutters>
                            <v-col>
                                <router-link class="white--text" to="/clients">Clients</router-link>
                            </v-col>
                            <v-col class="text-right">
                                <router-link class="white--text " to="/client/add"> +</router-link>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text>
                        <table>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                            </tr>
                            <tr v-for="(client,idx) in clients" :key="client.id">
                                <td nowrap class="pr-3">
                                    <router-link :to="'/client/'+idx">{{ client.code }}</router-link>
                                </td>
                                <td nowrap>
                                    <router-link :to="'/client/'+idx">{{ client.name }}</router-link>
                                </td>
                            </tr>
                        </table>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col>
                <v-card class="mx-auto">
                    <v-card-title class="cyan lighten-2">
                        <v-row no-gutters>
                            <v-col>
                                <router-link class="white--text" to="/projects">Projects</router-link>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text>
                        <table>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                            </tr>
                            <tr v-for="(project, idx) in projects" :key="project.id">
                                <td nowrap class="pr-3">
                                    <router-link :to="'/project/'+idx">{{ project.code }}</router-link>
                                </td>
                                <td nowrap>
                                    <router-link :to="'/project/'+idx">{{ project.name }}</router-link>
                                </td>
                            </tr>
                        </table>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col>
                <v-card class="mx-auto">
                    <v-card-title class="cyan lighten-2">
                        <v-row no-gutters>
                            <v-col>
                                <router-link class="white--text" to="/tasks">Tasks</router-link>
                            </v-col>
                            <v-col class="text-right">
                                <router-link class="white--text " to="/task/add"> +</router-link>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text>
                        <div v-for="(task,idx) in tasks" :key="task.id">
                            <router-link :to="'/task/'+idx">{{ task.code }} - {{ task.name }}</router-link>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-card class="mx-auto">
                    <v-card-title class="teal lighten-3 white--text">
                        <router-link class="white--text" to="/calendar">Calendar</router-link>
                    </v-card-title>
                    <v-card-text>
                        Calendar
                    </v-card-text>
                </v-card>
            </v-col>
            <!--            <v-col>
                            <v-card class="mx-auto">
                                <v-card-title class="green lighten-3">
                                    <v-row no-gutters >
                                    <v-col>
                                        <router-link class="white&#45;&#45;text" to="/tasks">Leads</router-link>
                                    </v-col>
                                    <v-col class="text-right">
                                        <router-link class="white&#45;&#45;text " to="/tasks/add"> +</router-link>
                                    </v-col>
                                    </v-row>
                                </v-card-title>
                                <v-card-text>
                                    Tasks
                                </v-card-text>
                            </v-card>
                        </v-col>-->
            <v-col>
                <v-card class="mx-auto">
                    <v-card-title class="amber lighten-3">
                        <v-row no-gutters>
                            <v-col>
                                <router-link class="white--text" to="/notes">Notes</router-link>
                            </v-col>
                            <v-col class="text-right">
                                <router-link class="white--text " to="/note/create"> +</router-link>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text>
                        <div v-for="(note,idx) in notes" :key="note.id">
                            <router-link :to="'/note/'+idx">{{ note.name }}</router-link>
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
}
</script>

<style scoped>
</style>
