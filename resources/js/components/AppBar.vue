<template>
    <v-system-bar
        app
        clipped-left
        dark
        dense
    >
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-icon
                    v-bind="attrs"
                    v-on="on">{{ currentModeIcon }}
                </v-icon>
            </template>
            <v-list dark dense>
                <v-list-item @click="setMode('planning')">
                    <v-list-item-icon>
                        <v-icon>mdi-clipboard-plus</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Planing</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="setMode('working')">
                    <v-list-item-icon>
                        <v-icon>mdi-clipboard-flow</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Working</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="setMode('reporting')">
                    <v-list-item-icon>
                        <v-icon>mdi-clipboard-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Reporting</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-menu>
        <span v-if="currentMode === 'planning'">
            <a v-if="view !== 'board'" v-on:click="showBoard()">
                <v-icon>mdi-bulletin-board</v-icon>
            </a>
            <!-- Calendar Planning -->
        </span>
        <span v-if="currentMode === 'working'">
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs"
                        v-on="on">mdi-account-multiple
                </v-icon>
            </template>
            <v-list class="client-dropdown" dark dense>
                <draggable v-model="projects.items" group="projects">
                    <v-list-item
                        v-for="(project, index) in projects.items"
                        :key="index"
                    >
                        <v-list-item-title>
                            <a v-on:click="setProject(index)">{{ project.name }}</a>
                        </v-list-item-title>
                    </v-list-item>
                </draggable>
            </v-list>
        </v-menu>
        <span v-if="project" class="project">
                {{ project.name }}
        <a v-on:click="toggleClientNotes()">
            <v-icon>mdi-account</v-icon>
        </a>
        <a v-on:click="toggleProjectNotes()">
            <v-icon>mdi-folder</v-icon>
        </a>
        <a v-if="view !== 'task-new'" v-on:click="setView('task-new')">
            <v-icon style="background: green">mdi-plus-box-outline</v-icon>
        </a>
            <a v-if="view !== 'board'" v-on:click="showBoard()">
                <v-icon>mdi-bulletin-board</v-icon>
            </a>
            </span>
        </span>
        <span v-if="currentMode === 'reporting'">
            <!-- Calendar Past events -->
            <!-- Worklogs/Meetigns/Planning by Project-->
        </span>
        <v-spacer></v-spacer>
        <v-icon @click="refresh">refresh</v-icon>
        <clock></clock>
    </v-system-bar>
</template>

<script>
import Clock from "./Clock";
import {mapState} from 'vuex';
import draggable from 'vuedraggable'

export default {
    name: "AppBar",
    components: {Clock, draggable},
    data() {
        return {
            currentMode: 'working',
            currentModeIcon: 'mdi-clipboard-flow'
        };
    },
    computed: {
        ...mapState([
            'projects',
        ]),
        project: function () {
            return this.$store.getters.getProject()
        },
        view: function () {
            return this.$store.getters.getView()
        },
    },
    props: {
        projectCode: String
    },
    methods: {
        setMode: function (mode) {
            console.log('Set Mode', mode)
            this.currentMode = mode
            if (mode === 'planning') {
                this.currentModeIcon = 'mdi-clipboard-plus'
            }
            if (mode === 'working') {
                this.currentModeIcon = 'mdi-clipboard-flow'
            }
            if (mode === 'reporting') {
                this.currentModeIcon = 'mdi-clipboard-check'
            }
        },
        setView: function (view) {
            console.log('SetView', view)
            this.$store.dispatch('setView', view)
        },
        toggleClientNotes: function () {
            this.$store.dispatch('toggleClientNotes')
        },
        toggleProjectNotes: function () {
            this.$store.dispatch('toggleProjectNotes')
        },
        toggleTaskNew: function () {
            this.$store.dispatch('toggleTaskNew')
        },
        setProject: function (idx) {
            console.log('setSelectedProjectIdx', idx)
            this.$store.dispatch('setSelectedProjectIdx', idx)
        },
        refresh: function (event) {
            let vue = this
            axios.get('/ajax/projects').then(res => {
                vue.$store.commit('SET_PROJECTS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        },
        showBoard: function () {
            this.$store.dispatch('setView', 'board')
        }
    }
}
</script>

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
