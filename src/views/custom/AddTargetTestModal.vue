<template>
    <div class="wrapper">
    <CButton color="secondary" @click="modal1Visible = true" class="mr-1">
        Launch modal for new target
    </CButton>
    <CButton color="secondary" @click="modal2Visible = true" class="mr-1">
        Launch modal for existing target
    </CButton>

    <CModal
            title="New target"
            :show.sync="modal1Visible"
    >
        <AddTargetComponent></AddTargetComponent>
        <template #footer>
            <div><!-- This hides default buttons. The div is needed, empty template doesn't work. --></div>
        </template>
    </CModal>
    <CModal
            title="Existing target"
            :show.sync="modal2Visible"
    >
        <AddTargetComponent
                :prefill="true"
                :notifications="{active:false}"
                :target="{hostname:'test2', port:null}"
        ></AddTargetComponent>
        <template #footer>
            <div><!-- This hides default buttons. The div is needed, empty template doesn't work. --></div>
        </template>
    </CModal>
    </div>

</template>

<script>
    import AddTargetComponent from "./AddTargetComponent";
    export default {
        name: "AddTargetTestModal",
        components: {AddTargetComponent},
        data () {
            return {
                modal1Visible: false,
                modal2Visible: false,
            }
        }

    }
</script>

<style scoped>

</style>