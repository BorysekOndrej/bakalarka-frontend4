<template>
    <TargetsTableComponent
        :limit_to_ids="limit_to_ids"
    ></TargetsTableComponent>
</template>

<script>
    import TargetsTableComponent from "./TargetsTableComponent";
    export default {
        name: "TargetsTablePage",
        components: {TargetsTableComponent},
        data() {
            return {
                // test1: null,
            }
        },
        computed: {
            limit_to_ids() {
                if (this.$route.params.target_id){
                    let strArr = this.$route.params.target_id.split(",")
                    let intArr = strArr.map(x => parseInt(x))
                    return intArr
                }
                return null
            }
        }
    }
</script>

<style scoped>

</style>