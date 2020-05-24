<template>
    <CChartLine
            :datasets="defaultDatasets"
            :options="defaultOptions"
            :labels="dates"
    />
</template>

<script>
    import { CChartLine } from '@coreui/vue-chartjs'
    import { hexToRgba } from '@coreui/utils/src'
    import moment from "moment";
    import {generalLevelColors} from "../../utils";

    export default {
        name: 'GradeHistoryGraphComponent',
        components: {
            CChartLine
        },
        props: {
            number_of_days: {
                default: 30
            },
            unified_date_format: {
                default: "D. M."
            },
            grades: {
                default () {
                    return ["A", "B", "C", "D", "E", "F", "Not scanned yet"]
                }
            }
        },
        created() {
            this.$store.dispatch('syncUserTargetsHistory')
        },
        computed: {
            rawDataFromHistory(){
                return this.$store.state.userTargetsHistory
            },
            preprocessDataFromHistory1(){
                let target_ids = new Set()
                for (const x of this.rawDataFromHistory){
                    let target_id = x.target.id
                    target_ids.add(target_id)
                }

                let targets_dict = {}
                for (const x of target_ids){
                    targets_dict[x] = []
                }

                for (const x of this.rawDataFromHistory){
                    let timestamp = x.timestamp
                    let target_id = x.target.id
                    let grade =  x.result_simplified.grade
                    targets_dict[target_id].push({timestamp, grade})
                }

                for (const x of target_ids){
                    let sortedArr = targets_dict[x].sort(function(a, b) { return a[0] - b[0]; });
                    targets_dict[x] = sortedArr
                }
                return targets_dict
            },
            preprocessDataFromHistory2(){
                let targets_dict = this.preprocessDataFromHistory1
                let targets_res = {}
                for(let target_id in targets_dict){
                    targets_res[target_id] = {}
                    for (const x of this.dates){
                        targets_res[target_id][x] = undefined
                    }
                }
                for(let target_id in targets_dict){
                    let single_target_arr = targets_dict[target_id]
                    for (const single_scan of single_target_arr){
                        let timestamp_numerical = single_scan.timestamp
                        let timestamp_moment_start_of_day = moment.unix(timestamp_numerical).startOf('day')
                        let timestamp_string_start_of_day = timestamp_moment_start_of_day.format(this.unified_date_format);

                        let previousBest = targets_res[target_id][timestamp_string_start_of_day]
                        let newContender = single_scan.grade

                        if (previousBest !== undefined){
                            console.debug(`Duplicate scan result for target on the same day. Previous best: ${previousBest}, new contender: ${newContender}`)
                            if (newContender === undefined){
                                console.debug("New contender was undefined. Skip.")
                                continue
                            }
                            if (this.grades.indexOf(newContender) >= this.grades.indexOf(previousBest)){
                                console.debug(`New contender is same or worse: previous best: ${previousBest}, new contender: ${newContender}. Skip.`)
                                continue
                            }
                        }

                        targets_res[target_id][timestamp_string_start_of_day] = newContender
                    }
                }
                // console.debug("preprocessDataFromHistory2", targets_res)
                return targets_res
            },
            preprocessDataFromHistory3(){
                let resulting_dict = {}
                let targets_date_dict = this.preprocessDataFromHistory2
                for (let single_date in this.dates){
                    resulting_dict[this.dates[single_date]] = {}
                    for (const single_grade of this.grades){
                        resulting_dict[this.dates[single_date]][single_grade] = 0
                    }
                }
                for (const single_date of this.dates) {
                    for (let target_id in targets_date_dict) {
                        //console.warn(targets_date_dict[target_id][single_date])
                        let grade = targets_date_dict[target_id][single_date]
                        resulting_dict[single_date][grade]++
                    }
                }
                // console.debug("preprocessDataFromHistory3", resulting_dict)
                return resulting_dict
            },
            preprocessDataFromHistory4(){
                let date_grade_dict = this.preprocessDataFromHistory3
                let grade_date_dict = {}
                for (const single_grade of this.grades){
                    grade_date_dict[single_grade] = {}
                    for (let single_date in this.dates) {
                        grade_date_dict[single_grade][this.dates[single_date]] = date_grade_dict[this.dates[single_date]][single_grade]
                    }
                }
                // console.debug("preprocessDataFromHistory4", grade_date_dict)
                return grade_date_dict
            },
            preprocessDataFromHistory5(){
                let grade_date_dict = this.preprocessDataFromHistory4
                let grade_date_dict_sorted = {}
                for (const single_grade of this.grades){
                    grade_date_dict_sorted[single_grade] = []
                    for (let single_date in this.dates) {
                        grade_date_dict_sorted[single_grade].push(grade_date_dict[single_grade][this.dates[single_date]])
                    }
                }
                console.debug("preprocessDataFromHistory5", grade_date_dict_sorted)
                return grade_date_dict_sorted
            },
            maxYScale(){
                let currentMax = 1
                let grade_date_dict_sorted = this.preprocessDataFromHistory5
                for (const single_grade of this.grades){
                    currentMax = Math.max(currentMax, Math.max(...grade_date_dict_sorted[single_grade]))
                }
                //console.warn(currentMax)
                return currentMax + 1
            },
            dates() {
                let res = []
                for (let i = 0; i < this.number_of_days; i++){
                    let date_string = moment().subtract(i, 'days').format(this.unified_date_format)
                    res.push(date_string)
                }
                res.reverse()
                return res
            },
            defaultDatasets () {
                let gradesReversed = this.grades.slice().reverse();

                let res = []
                for (const single_grade of gradesReversed){
                    let indexOfGrade = this.grades.indexOf(single_grade)
                    let newColor = this.levelColors[indexOfGrade]
                    // console.log(single_grade, indexOfGrade, newColor)
                    let newSingleRes = {
                            label: `${single_grade} or worse`,
                            backgroundColor: hexToRgba(newColor, 10*indexOfGrade),
                            borderColor: newColor,
                            pointHoverBackgroundColor: newColor,
                            borderWidth: 2,
                            data: this.sumarize_lower_levels(single_grade)
                        }
                    if (single_grade === "Not scanned yet"){
                        newSingleRes.label = single_grade
                    }
                    if (res.length > 0 && res[res.length - 1].data.toString() === newSingleRes.data.toString()){
                        continue;
                    }
                    res.push(newSingleRes)
                }
                res.reverse()
                return res
            },
            defaultOptions () {
                return {

                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                drawOnChartArea: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                maxTicksLimit: 5,
                                stepSize: Math.ceil(this.maxYScale / 5),
                                max: this.maxYScale
                            },
                            gridLines: {
                                display: true
                            }
                        }]
                    },
                    elements: {
                        point: {
                            radius: 0,
                            hitRadius: 10,
                            hoverRadius: 4,
                            hoverBorderWidth: 3
                        }
                    }
                }
            },
            levelColors(){
                return generalLevelColors()
            }
        },
        methods: {
            sumarize_lower_levels(highestLevel){
                let input = this.preprocessDataFromHistory5

                let levels_arrs_to_sumarize = []
                for (const single_grade of this.grades){
                    if (this.grades.indexOf(highestLevel) <= this.grades.indexOf(single_grade)){
                        levels_arrs_to_sumarize.push(input[single_grade])
                    }
                }
                // console.log(levels_arrs_to_sumarize)
                let result1 = []
                for (let i = 0; i < levels_arrs_to_sumarize[0].length; i++){
                    result1.push(0)
                }
                for (const single_level of levels_arrs_to_sumarize){
                    for (let i = 0; i < levels_arrs_to_sumarize[0].length; i++){
                        result1[i] += single_level[i]
                    }
                }
                return result1
            },
        }
    }
</script>
