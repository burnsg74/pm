<template>
    <v-container>
        <v-row  v-for="project in client.projects" :key="project.id" >
            <v-col class="pt-0">
                <v-row>
                    <v-col class="pt-0">
                        <h2> {{ project.code }} :: {{ project.name }}
                            <v-icon v-on:click="toggleClientDetail">mdi-account</v-icon>
                            <v-icon v-on:click="toggleProjectDetail">mdi-folder-multiple</v-icon>
                        </h2>
                    </v-col>
                </v-row>
                <v-row v-if="showClientDetail" fluid v-on:dblclick="toggleEditor" @keydown.esc="toggleEditor">
                    <v-col md="12">
                        <v-card class="grey lighten-5">
                            <div class="html-viewer" v-show="!isEditing" style="color: black" v-html="client.html"></div>
                            <textarea class="html-viewer" rows="30" v-show="isEditing" v-model="markdown" style="width: 100%"></textarea>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row v-if="showProjectDetail" fluid v-on:dblclick="toggleProjectDetail" @keydown.esc="toggleProjectDetail">
                    <v-col md="12">
                        <v-card class="grey lighten-5">
                            <div class="html-viewer" v-show="!isEditing" style="color: black" v-html="project.html"></div>
                            <textarea class="html-viewer" rows="30" v-show="isEditing" v-model="markdown" style="width: 100%"></textarea>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col :class="['rounded-t-xl', (currentStatus ==='Backlog') ? 'active-tab' : 'inactive-tab']" v-on:click="setItems('Backlog')">Backlog</v-col>
                    <v-col :class="['rounded-t-xl', (currentStatus ==='In-Progress') ? 'active-tab' : 'inactive-tab']" v-on:click="setItems('In-Progress')">In-Progress</v-col>
                    <v-col :class="['rounded-t-xl', (currentStatus ==='Hold') ? 'active-tab' : 'inactive-tab']" v-on:click="setItems('Hold')">Hold</v-col>
                    <v-col :class="['rounded-t-xl', (currentStatus ==='Done') ? 'active-tab' : 'inactive-tab']" v-on:click="setItems('Done')">Done</v-col>
                </v-row>
                <v-row>
                <v-col class="active-tab" >
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                    <v-data-table
                        dense
                        :headers="headers"
                        :items="items"
                        :search="search"
                        item-key="id"
                        class="elevation-1"
                        dark
                    >
                        <template #item.code="{ item }">
                            <router-link :to="{ name: 'task', params: { id: item.id } }">
                                {{ item.code }}
                            </router-link>
                        </template>
                    </v-data-table>
                </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
export default {
    name: 'Client',
    mounted: async function() {
        this.items = this.client.projects[0].tasks['Backlog']
    },
    data: () => ({
        isEditing: false,
        markdown: null,
        showClientDetail: false,
        showProjectDetail: false,
        showBacklog: true,
        showProgress: false,
        showHold: false,
        currentStatus: 'Backlog',
        search:'',
        headers: [
            {
                text: 'Ticket',
                value: 'code'
            },
            {
                text: 'Name',
                value: 'name'
            },
        ],
        items:[]
    }),
    computed: {
        client: function () {
            return this.$store.getters.getClient(this.$route.params.id)
        }
    },
    methods: {
        toggleClientDetail: function (event) {
            this.showClientDetail = !this.showClientDetail
        },
        toggleProjectDetail: function (event) {
            this.showProjectDetail = !this.showProjectDetail
        },
        toggleEditor: function (event) {
            this.isEditing = !this.isEditing
            if (this.isEditing) {
                this.markdown = this.client.markdown
            } else {
                let vue = this
                axios.put('/ajax/note', {
                    path: vue.client.path,
                    markdown: vue.markdown,
                }).then(function (res) {
                    vue.$store.commit('SET_CLIENTS', res.data.payload)
                })
            }
        },
        setItems: function (status) {
            this.currentStatus = status
            this.items = this.client.projects[0].tasks[status]
        }
    }
}
</script>
<style scoped>
.html-viewer {
    padding: 10px;
}
.active-tab {
    border-style: solid;
    border-color: aqua;
    border-width: 1px;
}
.inactive-tab {
    border-style: solid;
    border-color: grey;
    border-width: 1px;
}
</style>
