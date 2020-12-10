<template>
    <div class="row">
        <div v-for="(status, index) in project.statuses" :key="index" class="col active-tab">
            <h3>{{ status }} <span slot="badge" v-if="tasks[status]"> {{ tasks[status].length }} </span></h3>
            <draggable v-if="tasks[status]" v-model="tasks[status]" :options="{group:{pull:true,put:true},animation: 150}"class="list-group" group="tasks" @change="changeTaskLocation(status,$event)">
                <div
                    v-for="(task, index) in tasks[status]"
                    :key="task.id"
                    class="list-group-item"
                >
                    <v-card class="mb-2" elevation="2">
                        <v-card-title>
                            <a v-on:click="viewTask(status,index)">{{project.code}}-{{ task.code }}</a>
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
    data() {
        return {
        };
    },
    computed: {
        project: function () {
            return this.$store.getters.getProject()
        },
        tasks: {
            get() {
                return  Object.assign({}, this.$store.getters.getTasks());
            },
            set(value) {
                console.log('SET',value)
                //this.$store.dispatch('setTaskOrder', value)
            }
        },
    },
    methods: {
        taskByStatus: function (status) {
            return this.$store.getters.getTasksByStatus(status)
        },
        viewTask: function (status, idx) {
            console.log('View',status,idx)
            this.$store.dispatch('selectTask', {status,idx})
            this.$store.dispatch('setView', 'task-view')
        },
        changeTaskLocation: function(status, event) {
            this.$store.dispatch('changeTaskLocationReorderTask',{status,event})
        },
    }
}
</script>

<style scoped>
.list-group {
    height: 100%;
}
</style>
