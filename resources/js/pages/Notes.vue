<template>
    <v-container>
        <h1>Notes
            <v-icon @click="refresh">refresh</v-icon>
        </h1>
        <v-list-item v-for="(note,idx) in notes" :key="note.id">
            <v-list-item-content>
                <v-list-item-title>
                    <router-link :to="'/note/'+note.id">{{ note.name }} </router-link>
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
                    Add Note
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="headline">Add Note</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="name" label="Name *" required></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="note" label="note"></v-text-field>
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
    name: 'Tasks',
    data: () => ({
        dialog: false,
        name: null,
        note: null,
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
        notes: function () {
            return this.$store.state.notes.data
        }

    },
    methods: {
        save: function () {
            this.dialog = false
            let vue = this
            axios.post('/ajax/note', {
                name: this.name,
                note: this.note,
            }).then(res => {
                vue.$store.commit('SET_NOTES', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        },
        refresh: function (event) {
            console.log('Refresh')
            let vue = this
            axios.get('/ajax/notes').then(res => {
                vue.$store.commit('SET_NOTES', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        }
    }
}
</script>
<style scoped>
</style>
