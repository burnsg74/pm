<template>
    <v-container>
        <h1>Projects
            <v-icon @click="refresh">refresh</v-icon>
        </h1>
        <v-list-item v-for="(project,idx) in projects" :key="project.id">
            <v-list-item-content>
                <v-list-item-title>
                    <router-link :to="'/project/'+idx">{{ project.name }} ({{ project.code }})</router-link>
                    </v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color="primary"
                    dark
                    v-bind="attrs"
                    v-on="on"
                >
                    Add Project
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="headline">Add Project</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="name" label="Name *" required></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="code" label="Code"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                    <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
                    <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script>
export default {
    name: 'Projects',
    data: () => ({
        dialog: false,
        name: null,
        code: null,
        date: null,
        menu: false,
    }),
    watch: {
        menu(val) {
            val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
        },
    },
    mounted() {
    },
    computed: {
        projects: function () {
            return this.$store.state.projects.data
        }

    },
    methods: {
        save: function () {
            console.log('Save')
            this.dialog = false
            let vue = this
            axios.post('/ajax/project', {
                name: this.name,
                code: this.code,
            }).then(res => {
                console.log(res.data.payload);
                vue.$store.commit('SET_PROJECTS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        },
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
