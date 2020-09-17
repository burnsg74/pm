<template>
    <v-container>
        <h1>Project: {{project.name}} ({{project.code}})</h1>
    </v-container>
</template>
<script>
export default {
    name: 'Project',
    data: () => ({
        dialog: false,
        name: null,
        code: null,
        date: null,
        menu: false,
    }),
    computed: {
        project: function () {
            return this.$store.getters.getProject(this.$route.params.id)
        }
    },
    methods: {
    }
}
</script>
<style scoped>
</style>
