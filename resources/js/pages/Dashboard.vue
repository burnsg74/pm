<template>
    <v-container>
        <v-row>
            <v-col>
                <draggable v-model="clients" group="clients" @end="drag=false" @start="drag=true">
                    <v-card v-for="client in clients" :key="client.id"
                            class="mx-auto mb-1"
                            dark
                            elevation="10">
                        <v-card-text>
                            <v-row>
                                <v-col cols="3">
                                    <router-link :to="'/client/'+client.id"><h3>{{ client.code }} :: {{
                                            client.name
                                        }}</h3></router-link>
                                </v-col>
                                <v-col v-for="(project,idx) in client.projects" :key="project.id"
                                       cols="5" class="mr-2">
                                    <router-link :to="'/project/'+project.id">{{project.code}}</router-link>
                                    <v-row>
                                        <v-col>
                                            Backlog: {{project.tasks.Backlog.length}}
                                        </v-col>
                                        <v-col>
                                            In-progress: {{project.tasks['In-Progress'].length}}
                                        </v-col>
                                        <v-col>
                                            Hold: {{project.tasks.Hold.length}}
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </draggable>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import draggable from 'vuedraggable'

export default {
    name: 'Dashboard',
    components: {
        draggable,
    },
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
        clients: {
            get() {
                return this.$store.state.clients.data
            },
            set(value) {
                this.$store.commit('SET_CLIENTS', value)
            }
        },
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
