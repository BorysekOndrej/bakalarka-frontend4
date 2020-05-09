<template>
    <div style="max-width: 600px; margin: auto;">
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
                <NotificationsSettings
                        v-model="form"
                        ref="notificationsComponent"
                ></NotificationsSettings>
            </CCardBody>
            <CCardFooter>
                <CButton type="submit" size="sm" color="primary" v-on:click="onSubmit"><CIcon name="cil-check-circle"/> Submit</CButton>
                <CButton type="reset" size="sm" color="danger" v-on:click="onReset" ><CIcon name="cil-ban"/> Reset</CButton>
            </CCardFooter>
        </CCard>
        <CCard>
            <pre class="m-0" style="text-align: left;">{{ form }}</pre>
        </CCard>
    </div>
</template>

<script>
    import {callGetNotificationSettings, callPostNotificationSettings} from "../../api";
    import NotificationsSettings from "./NotificationsSettings";

    export default {
        name: "NotificationSettingsStandalone",
        components: {NotificationsSettings},
        props: {
            msg: String,
            prefill: {
                type: Boolean,
                default: false
            },
            notifications: {
                type: Object,
                default: () => ({
                    emails_active: true,
                    emails_list: ""
                })
            },
            user_id_prop: {
                type: Number,
            },
            target_id: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                form: null,
                show: true,
                visible_notification_options: false
            }
        },
        computed: {
            user_id: function(){
                return this.user_id_prop ? this.user_id_prop : this.$store.getters.getUserID
            }
        },

        created() {
            this.prefillFormToDefaultOrPassedValues(true)
        },
        mounted(){
            this.prefillFormToDefaultOrPassedValues()
        },
        watch: {
            notifications: {
                deep:true,
                // eslint-disable-next-line no-unused-vars
                handler(newVal) {
                    this.prefillFormToDefaultOrPassedValues()
                }
            }
        },

        methods: {

            load_values_from_server(){
                let self = this
                callGetNotificationSettings(this.user_id, this.target_id).then(function (response) {
                    self.form = response.data
                    // console.log("A1")
                    // self.$refs.notificationsComponent.prefillFormToDefaultOrPassedValues()
                    // console.log("A2")
                    // console.log("RESET DONE")
                })
            },
            prefillFormToDefaultOrPassedValues(beforeMounted=false) {
                this.form = {...this.notifications};
                /*
                if (!beforeMounted){
                    //this.$refs.notificationsComponent.prefillFormToDefaultOrPassedValues()
                }

                if (this.notifications === null ){
                    return;
                }
                */

                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            onSubmit(evt) {
                evt.preventDefault();
                console.log(JSON.stringify(this.form))
                callPostNotificationSettings(this.user_id, this.target_id, JSON.stringify(this.form))
                    .then(() => {
                    // todo: flash
                    })
            },
            onReset(evt) {
                evt.preventDefault();
                this.load_values_from_server()
                // this.prefillFormToDefaultOrPassedValues()
            }
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
