<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>PM</title>
    <link rel="stylesheet" href="/css/app.css">
    <style>
        [v-cloak] {
            display: none;
        }
    </style>
</head>
<body>
<v-app id="app" v-cloak>
    <v-navigation-drawer
        v-model="drawer"
        app
        clipped
        dark
        dense
        mini-variant
        temporary
    >
        <v-list dense dark>
            <v-list-item>
                <router-link to="/">
                    <v-icon>mdi-view-dashboard</v-icon>
                </router-link>
            </v-list-item>
            <v-list-item>
                <router-link to="/calendar">
                    <v-icon>mdi-calendar</v-icon>
                </router-link>
            </v-list-item>
            <v-list-item>
                <router-link to="/clients">
                    <v-icon>mdi-account</v-icon>
                </router-link>
            </v-list-item>
            <v-list-item>
                <router-link to="/projects">
                    <v-icon>mdi-folder-multiple</v-icon>
                </router-link>
            </v-list-item>
            <v-list-item>
                <router-link to="/tasks">
                    <v-icon>mdi-calendar-check</v-icon>
                </router-link>
            </v-list-item>
            <v-list-item>
                <router-link to="/notes">
                    <v-icon>mdi-paperclip</v-icon>
                </router-link>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
    <v-system-bar
        app
        clipped-left
        dark
        dense
    >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-breadcrumbs :items="items">
        </v-breadcrumbs>
        <v-spacer></v-spacer>
    </v-system-bar>
    <v-main>
        <router-view></router-view>
    </v-main>
    <v-footer
        app
        class="white--text"
    >
    </v-footer>
</v-app>
<script src="/js/app.js"></script>
</body>
</html>
