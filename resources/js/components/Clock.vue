<template>
    <span class="clock" v-on:click="setView('calendar')">{{ currentDateTime }}</span>
</template>

<script>
export default {
    name: 'Clock',
    data() {
        return {
            timer: '',
            currentDateTime: ''
        }
    },
    mounted() {
        this.timer = setInterval(this.updateClock, 1000)
    },
    methods: {
        updateClock() {
            var d = new Date()
            var formatter = new Intl.DateTimeFormat('en-us', {
                weekday: 'short',
                month: 'numeric',
                day: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
            })
            this.currentDateTime = formatter.format(d)
        },
        setView: function (view) {
            this.$store.dispatch('setView', view)
        }
    }
}
</script>

<style scoped>
.clock {
    color: rgb(17, 236, 229);
    text-decoration: none;
    font-size: 18px;
}
</style>
