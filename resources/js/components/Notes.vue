<template>
    <div>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-navigation-drawer
            v-model="drawer"
            absolute
            bottom
            temporary
        >
            Test
            <v-treeview
                v-model="tree"
                :items="items"
                :open="initiallyOpen"
                activatable
                dense
                item-key="name"
                open-on-click
            >
                <template v-slot:prepend="{ item, open }">
                    <v-icon v-if="!item.file">
                        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                    </v-icon>
                    <v-icon v-else>
                        {{ files[item.file] }}
                    </v-icon>
                </template>
                <template slot="label" slot-scope="{ item }">
                    <a @click="openFile(item)">{{ item.name }}</a>
                </template>
            </v-treeview>
        </v-navigation-drawer>
        <div v-html="content"> </div>
    </div>
</template>

<script>

export default {
    name: "Notes",
    computed: {},
    data: () => ({
        drawer: false,
        content: '',
        initiallyOpen: ['public'],
        files: {
            html: 'mdi-language-html5',
            js: 'mdi-nodejs',
            json: 'mdi-code-json',
            md: 'mdi-language-markdown',
            pdf: 'mdi-file-pdf',
            png: 'mdi-file-image',
            txt: 'mdi-file-document-outline',
            xls: 'mdi-file-excel',
        },
        tree: [],
        items: [
            {
                id: 1,
                name: '.git',
            },
            {
                id: 2,
                name: 'node_modules',
            },
            {
                name: 'public',
                children: [
                    {
                        name: 'static',
                        children: [{
                            name: 'logo.png',
                            file: 'png',
                        }],
                    },
                    {
                        name: 'favicon.ico',
                        file: 'png',
                    },
                    {
                        name: 'index.html',
                        file: 'html',
                    },
                ],
            },
            {
                name: '.gitignore',
                file: 'txt',
            },
            {
                name: 'babel.config.js',
                file: 'js',
            },
            {
                name: 'package.json',
                file: 'json',
            },
            {
                name: 'README.md',
                file: 'md',
            },
            {
                name: 'vue.config.js',
                file: 'js',
            },
            {
                name: 'yarn.lock',
                file: 'txt',
            },
        ],
    }),
    mounted() {
        axios
            .get('/ajax/notes')
            .then(response => (this.items = response.data.payload))
    },
    methods: {
        openFile(item) {
            console.log('OpenFile', item)
            this.content = item.html
        }
    }
}
</script>

<style scoped>

</style>
