<template>
    <CChartDoughnut
            :datasets="defaultDatasets"
            :labels="levelLabels"
    />
</template>

<script>
    import {CChartDoughnut} from "@coreui/vue-chartjs";
    import {expiresToGradeIndex} from "../../utils";

    export default {
        name: "ExpirationDonutComponent",
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
                for (let i = 0; i < this.levelLabels.length; i++){
                    res[i] = 0;
                }
                for (const x of this.userTargets){
                    let gradeIndex = expiresToGradeIndex(x.expires, this.expirationLevelsNumbericalThresholds)
                    res[gradeIndex]++
                }
                return res
            },
            defaultDatasets () {
                return [
                    {
                        backgroundColor: this.levelColors,
                        data: this.precalculatedGradesCount
                    }
                ]
            },
            expirationLevelsNumbericalThresholds (){
                return [30, 10, 1, 0, -30]
            },
            levelLabels (){
                let res = []
                res.push(`> ${this.expirationLevelsNumbericalThresholds[0]} days`)
                for (const x of this.expirationLevelsNumbericalThresholds){
                    if (x > 0){
                        res.push(`Expires in less than ${x} days`)
                    }else{
                        res.push(`Expired more than ${-x} days ago`)
                    }
                }
                res.push(`Not scanned yet`)
                return res
            },
            levelColors(){
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