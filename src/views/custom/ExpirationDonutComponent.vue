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
        created() {
            this.$store.dispatch('syncUserTargetsWithBasicResults')
        },
        computed: {
            userTargets() {
                return this.$store.getters.getUserTargets
            },
            precalculatedGradesCount(){
                let res = [];
                for (let i = 0; i < this.gradeLetters.length; i++){
                    res[i] = 0;
                }
                for (const x of this.userTargets){
                    let gradeIndex = this.gradeLetters.indexOf(x.grade)
                    if (gradeIndex < 0){
                        console.warn(`Unknown grade ${x.grade}. Skipping`)
                        continue
                    }
                    res[gradeIndex]++
                }
                return res
            },
            defaultDatasets () {
                return [
                    {
                        backgroundColor: this.gradeColors,
                        data: this.precalculatedGradesCount
                    }
                ]
            },
            gradeLetters (){
                return ['A', 'B', 'C', 'D', 'E', 'F', 'Not scanned yet']
            },
            gradeColors(){
                return [
                    '#639B4B', // A
                    '#8AC271', // B
                    '#F6B26B', // C
                    '#E4834C', // D
                    '#DD624E', // E
                    '#CC0000', // F
                    '#CED2D8', // Not scanned yet
                ]
            }
        }
    }

</script>

<style scoped>

</style>