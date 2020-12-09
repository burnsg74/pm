<template>
    <div class="row">
        <div v-for="(status, index) in project.statuses" :key="index" class="col active-tab">
            <h3>{{ status }} <span slot="badge" v-if="taskByStatus(status)"> {{ taskByStatus(status).length }} </span></h3>
            <draggable v-if="taskByStatus(status)" :list="taskByStatus(status)" class="list-group" group="tasks" >
                <div
                    v-for="(task, index) in taskByStatus(status)"
                    :key="task.id"
                    class="list-group-item"
                >
                    <v-card class="mb-2" elevation="2">
                        <v-card-title>
                            <a v-on:click="viewTask(index)">{{project.code}}-{{ task.code }}</a>
                        </v-card-title>
                        <v-card-text>
                            {{ task.name }}
                        </v-card-text>
                    </v-card>
                </div>
            </draggable>
        </div>
    </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
    name: "Board",
    components: {
        draggable
    },
    computed: {
        project: function () {
            return this.$store.getters.getProject()
        }
    },
    methods: {
        taskByStatus: function (status) {
            return this.$store.getters.getTasksByStatus(status)
        },
        viewTask: function (idx) {
            this.$store.dispatch('selectedTaskIdx', idx)
            this.$store.dispatch('setView', 'task-view')
        }
    }
}
</script>

<style scoped>

</style>
