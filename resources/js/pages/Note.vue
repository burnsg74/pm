<template>
    <v-container>
        <h1>Note: {{note.name}} ({{note.code}})</h1>
    </v-container>
</template>
<script>
export default {
    name: 'Note',
    data: () => ({
        dialog: false,
        name: null,
        code: null,
        date: null,
        menu: false,
    }),
    computed: {
        note: function () {
            return this.$store.getters.getNote(this.$route.params.id)
        }
    },
    methods: {
    }
}
</script>
<style scoped>
</style>
