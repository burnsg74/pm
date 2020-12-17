<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="pusher-config" content="{{ json_encode([
        'key' => env('PUSHER_APP_KEY'),
        'port' => env('LARAVEL_WEBSOCKETS_PORT'),
    ]) }}">
    <title>PM</title>
    <link rel="stylesheet" href="/css/app.css">
    <link rel="stylesheet" href="/css/prism.css">
    <style>
        [v-cloak] {
            display: none;
        }
    </style>
</head>
<body>
<div id="app">
    <v-app v-cloak id="app">
        <v-system-bar
            app
            clipped-left
            dark
            dense
        >Test</v-system-bar>
    </v-app>
</div>
<script src="/js/app.js"></script>
<script src="/js/prism.js"></script>
<script>
window.BROADCASTING_PORT = '{{ env('BROADCASTING_PORT') }}';
</script>
</body>
</html>
