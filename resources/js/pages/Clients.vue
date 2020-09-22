<template>
    <v-container>
        <h1>Clients
            <v-icon @click="refresh">refresh</v-icon>
        </h1>
        <v-list-item v-for="client in clients" :key="client.id">
            <v-list-item-content>
                <v-list-item-title>
                    <router-link :to="'/client/'+client.id">{{ client.code }} :: {{ client.name }}</router-link>
                </v-list-item-title>
            </v-list-item-content>
        </v-list-item>
    </v-container>
</template>
<script>
export default {
    name: 'Clients',
    computed: {
        clients: function () {
            return this.$store.state.clients.data
        }
    },
    methods: {
        refresh: function (event) {
            console.log('Refresh')
            let vue = this
            axios.get('/ajax/clients').then(res => {
                console.log(res.data.payload);
                vue.$store.commit('SET_CLIENTS', res.data.payload)
            }).catch(error => {
                console.log(error.response)
            })
        }
    }
}
</script>
<style scoped>
</style>
