<template>
    <v-app v-cloak id="app">
        <v-system-bar
            app
            clipped-left
            dark
            dense
        >
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs"
                            v-on="on">mdi-account-multiple
                    </v-icon>
                </template>
                <v-list class="client-dropdown" dark dense>
                    <draggable v-model="clients" group="clients">
                        <v-list-item
                            v-for="(item, index) in clients"
                            :key="index"
                        >
                            <v-list-item-title>
                                <a v-on:click="setCleint(index)">{{ item.name }}</a>
                            </v-list-item-title>
                        </v-list-item>
                    </draggable>
                </v-list>
            </v-menu>
            <span class="project">
                {{ project.name }}
            </span>
            <router-link
                :to="{ name: 'client'}"
            >
                    <v-icon>mdi-account</v-icon>
            </router-link>
            <router-link
                :to="{ name: 'project'}"
            >
                <v-icon>mdi-folder</v-icon>
            </router-link>
            <router-link
                :to="{ name: 'tasks'}"
            >
                <v-icon>mdi-clipboard-text</v-icon>
            </router-link>
            <router-link
                to='/task/new'
            >
                <v-icon style="background: green">mdi-plus-box-outline</v-icon>
            </router-link>
            <v-spacer></v-spacer>
            <v-icon @click="refresh">refresh</v-icon>
            <clock></clock>
        </v-system-bar>
        <v-main>
            <v-container fluid>
                <router-view></router-view>
            </v-container>
        </v-main>
        <v-footer
            app
            class="white--text"
        >
        </v-footer>
    </v-app>
</template>

<!-- JS -->
<script>
import draggable from 'vuedraggable'

export default {
    name: 'Layout',
    components: {
        draggable,
    },
    computed: {
        clients: {
            get() {
                return this.$store.getters.getClients()
            },
            set(value) {
                this.$store.dispatch('setClientOrder', value)
            },
        },
        client: function () {
            return this.$store.getters.getClient()
        },
        project: function () {
            return this.$store.getters.getProject()
        },
        currentStatus: function () {
            return this.$store.getters.getSelectedTaskStatus()
        },
        tasks: {
            get() {
                return this.$store.getters.getTasks()
            },
            set(value) {
                this.$store.dispatch('setTaskOrder', value)
            }
        },
        task: {
            get() {
                return this.$store.getters.getTask()
            },
            set(value) {
                this.$store.commit('SET_TASK', value)
            }
        },
    },
    methods: {
        setCleint: function (idx) {
            this.$store.dispatch('setSelectedClientIdx', idx)
        },
        refresh: function (event) {
            let vue = this
            axios.get('/ajax/clients').then(res => {
                vue.$store.commit('SET_CLIENTS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        }
    }
}
</script>

<!-- Styling -->
<style scoped>
.client-dropdown {
    border-style: solid;
    border-color: aqua;
    border-width: 1px;
}
.project {
    color: chartreuse;
    font-size: 16px;
    margin-right: 10px;
}
</style>
