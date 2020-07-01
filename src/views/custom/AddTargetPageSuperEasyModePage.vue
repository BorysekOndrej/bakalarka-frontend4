<template>
    <AddTarget
        :target="target_from_url"
        superEasyMode="true"
    ></AddTarget>
</template>

<script>
    import AddTarget from "./AddTargetComponent";
    import {defaultTargetDefinition, filterObjToTargetDefinition} from "../../utils";
    export default {
        name: "AddTargetPageSuperEasyMode",
        components: {AddTarget},
        computed: {
            target_from_url() {
                if (this.$route.params.hostnames){
                    return filterObjToTargetDefinition({hostname: this.$route.params.hostnames}, true)
                }
                return defaultTargetDefinition()
            }
        }
    }
</script>

<style scoped>

</style>