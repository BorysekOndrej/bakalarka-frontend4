<template>
    <CChartDoughnut
            :datasets="defaultDatasets"
            :labels="gradeLetters"
    />
</template>

<script>
    import {CChartDoughnut} from "@coreui/vue-chartjs";

    export default {
        name: "GradesDonutComponent",
        components: {
            CChartDoughnut
        },
        computed: {
            defaultDatasets () {
                return [
                    {
                        backgroundColor: [
                            '#639B4B',
                            '#8AC271',
                            '#F6B26B',
                            '#E4834C',
                            '#DD624E',
                            '#CC0000',
                            '#CED2D8',
                        ],
                        data: [5, 1, 2, 5, 1, 20, 0]
                    }
                ]
            },
            gradeLetters (){
                return ['A', 'B', 'C', 'D', 'E', 'F', 'T']
            }
        }
    }

</script>

<style scoped>

</style>