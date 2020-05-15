<template>
    <CChartLine
            :datasets="defaultDatasets"
            :options="defaultOptions"
            :labels="dates"
    />
</template>

<script>
    import { CChartLine } from '@coreui/vue-chartjs'
    import { getStyle, hexToRgba } from '@coreui/utils/src'

    function random (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    export default {
        name: 'GradeHistoryGraphComponent',
        components: {
            CChartLine
        },
        props: {
            number_of_days: {
                default: 30
            }
        },
        computed: {
            dates() {
                let res = []
                let today = new Date()
                let new_date = today;
                today.get
                for (let i = 0; i < this.number_of_days; i++){
                    res.push(`${new_date.getDate()}. ${new_date.getMonth()+1}`)
                    new_date.setDate(new_date.getDate()-1);
                }
                res.reverse()
                return res
            },
            defaultDatasets () {
                const brandSuccess = getStyle('success2') || '#4dbd74'
                const brandInfo = getStyle('info') || '#20a8d8'
                const brandDanger = getStyle('danger') || '#f86c6b'

                let elements = this.number_of_days
                const data1 = []
                const data2 = []
                const data3 = []

                for (let i = 0; i <= elements; i++) {
                    data1.push(random(50, 200))
                    data2.push(random(80, 100))
                    data3.push(65)
                }
                return [
                    {
                        label: 'My First dataset',
                        backgroundColor: hexToRgba(brandInfo, 10),
                        borderColor: brandInfo,
                        pointHoverBackgroundColor: brandInfo,
                        borderWidth: 2,
                        data: data1
                    },
                    {
                        label: 'My Second dataset',
                        backgroundColor: 'transparent',
                        borderColor: brandSuccess,
                        pointHoverBackgroundColor: brandSuccess,
                        borderWidth: 2,
                        data: data2
                    },
                    {
                        label: 'My Third dataset',
                        backgroundColor: 'transparent',
                        borderColor: brandDanger,
                        pointHoverBackgroundColor: brandDanger,
                        borderWidth: 1,
                        borderDash: [8, 5],
                        data: data3
                    }
                ]
            },
            defaultOptions () {
                return {

                    maintainAspectRatio: false,
                    legend: {
                        display: false
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
                                stepSize: Math.ceil(250 / 5),
                                max: 250
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
            }
        }
    }
</script>
