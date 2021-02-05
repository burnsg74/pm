<template>
    <v-system-bar
        app
        clipped-left
        dark
    >
        <v-btn-toggle
            v-model="page"
            class="mt-3"
            dark
            dense
        >
            <v-btn outlined small>Calendar</v-btn>
            <v-btn outlined small>Board</v-btn>

        </v-btn-toggle>
    </v-system-bar>
</template>

<script>
import {mapState} from 'vuex';

export default {
    name: "AppModeBar",
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
        mode: {
            get() {
                return this.$store.getters.getMode()
            },
            set(payload) {
                this.$store.dispatch('setMode', payload)
            }

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
