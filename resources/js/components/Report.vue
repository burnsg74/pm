<template>
    <div>
        <h1>Report</h1>
        <div>
            <h3>Sunday</h3>
            <v-data-table
                dense
                :items="items[0]"
                item-key="id"
                class="elevation-1"
            ></v-data-table>
        </div>
        <div>
            <h3>Monday</h3>
            <v-data-table
                dense
                :items="items[1]"
                item-key="id"
                class="elevation-1"
            ></v-data-table>
        </div>
        <div>
            <h3>Tuesday</h3>
            <v-data-table
                dense
                :items="items[2]"
                item-key="id"
                class="elevation-1"
            ></v-data-table>
        </div>
        <div>
            <h3>Wednesday</h3>
            <v-data-table
                dense
                :items="items[3]"
                item-key="id"
                class="elevation-1"
            ></v-data-table>
        </div>
        <div>
            <h3>Thursday</h3>
            <v-data-table
                dense
                :items="items[4]"
                item-key="id"
                class="elevation-1"
            ></v-data-table>
        </div>
        <div>
            <h3>Friday</h3>
            <div v-for="(value, name) in items[5]" class="ml-3">
            <h4>{{ name }}</h4>
            <v-simple-table class="ml-3">
                <template v-slot:default>
                    <thead>
                    <tr>
                        <th class="text-left"> Code </th>
                        <th class="text-left"> Start </th>
                        <th class="text-left"> End </th>
                        <th class="text-left"> Dur </th>
                        <th class="text-left"> Total </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr
                        v-for="item in value"
                        :key="item.name"
                    >
                        <td>{{ item.code }}</td>
                        <td>{{ item.start }}</td>
                        <td>{{ item.end }}</td>
                        <td>{{ item.dur }}</td>
                        <td>{{ item.total }}</td>
                    </tr>
                    </tbody>
                </template>
            </v-simple-table>
            </div>
        </div>
        <div>
            <h3>Saturday</h3>
            <v-data-table
                dense
                :items="items[6]"
                item-key="id"
                class="elevation-1"
            ></v-data-table>
        </div>
    </div>
</template>

<script>

export default {
    name: "Report",
    computed: {},
    data: () => ({
        "headers":{
            text:''
        },
        "items": {}
    }),
    mounted() {
        axios
            .get('/ajax/currentweekhours')
            .then(response => (this.items = response.data.payload))
    },
    methods: {}
}
</script>

<style scoped>

</style>
