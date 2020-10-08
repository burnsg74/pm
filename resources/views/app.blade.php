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
