<template>
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
            <a v-on:click="toggleNotes()">
                <v-icon>mdi-file-document-multiple-outline</v-icon>
            </a>
            <a v-if="view !== 'task-new'" v-on:click="setView('task-new')">
                <v-icon style="background: green">mdi-plus-box-outline</v-icon>
            </a>
            <a v-if="view !== 'board'" v-on:click="showBoard()">
                <v-icon>mdi-bulletin-board</v-icon>
            </a>
        </span>
        <v-spacer></v-spacer>
        <a v-if="view !== 'report'" v-on:click="showReport()">
            <v-icon>mdi-bulletin-board</v-icon>
        </a>
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
        toggleNotes: function () {
            this.$store.dispatch('toggleNotes')
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
        },
        showReport: function () {
            this.$store.dispatch('setView', 'report')
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
