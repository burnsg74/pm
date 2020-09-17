<template>
    <v-container>
        <h1>Client: {{client.name}} ({{client.code}})</h1>
    </v-container>
</template>
<script>
export default {
    name: 'Client',
    data: () => ({
        dialog: false,
        name: null,
        code: null,
        date: null,
        menu: false,
    }),
    computed: {
        client: function () {
            return this.$store.getters.getClient(this.$route.params.id)
        }
    },
    methods: {
    }
}
</script>
<style scoped>
</style>
