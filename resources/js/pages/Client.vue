<template>
    <v-container>
        <h1> {{ client.code }} :: {{ client.name }}</h1>
        <v-row fluid v-on:dblclick="toggleEditor" @keydown.esc="toggleEditor">
            <v-col md="12">
                <v-card class="grey lighten-5">
                    <div class="html-viewer" v-show="!isEditing" style="color: black" v-html="client.html"></div>
                    <textarea class="html-viewer" rows="30" v-show="isEditing" v-model="markdown" style="width: 100%"></textarea>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
export default {
    name: 'Client',
    data: () => ({
        isEditing: false,
        markdown: null,
    }),
    computed: {
        client: function () {
            return this.$store.getters.getClient(this.$route.params.id)
        }
    },
    methods: {
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
    }
}
</script>
<style scoped>
.html-viewer {
    padding: 10px;
}
</style>
