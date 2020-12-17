<template>
    <v-app v-cloak id="app">
        <app-bar></app-bar>
        <v-main>
            <v-container fluid>
                <calendar v-if="view==='calendar'" ></calendar>
                <client-notes v-if="showClientNotes"></client-notes>
                <project-notes v-if="showProjectNotes"></project-notes>
                <task-new v-if="view==='task-new'" ></task-new>
                <board v-if="view==='board'"></board>
                <task-view v-if="view==='task-view'"></task-view>
            </v-container>
        </v-main>
    </v-app>
</template>

<!-- JS -->
<script>
import AppBar from "./components/AppBar";
import ClientNotes from "./components/ClientNotes";
import ProjectNotes from "./components/ProjectNotes";
import TaskNew from "./components/TaskNew";
import Board from './components/Board';
import TaskView from "./components/TaskView";
import Calendar from "./components/Calendar";

export default {
    name: 'Main',
    components: {
        TaskView,
        AppBar,
        ClientNotes,
        ProjectNotes,
        TaskNew,
        Calendar,
        Board
    },
    data: () => ({}),
    computed: {
        showClientNotes: function () {
            return this.$store.getters.getShowClientNotes()
        },
        showProjectNotes: function () {
            return this.$store.getters.getShowProjectNotes()
        },
        showTaskNew: function () {
            return this.$store.getters.getShowTaskNew()
        },
        view: function () {
            return this.$store.getters.getView()
        },
    },
    methods: {}
}
</script>

<!-- Styling -->
<style scoped>
</style>
