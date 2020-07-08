<template>
    <div>
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
                <NotificationsSettings
                        v-model="form"
                        ref="notificationsComponent"
                        :effective_notifications_options="effective_notifications_options"
                        :slack_fields="['team_name', 'channel_name', 'team_id', 'channel_id', {key: 'single_order', label: 'Local preference'}, 'actions']"
                        :email_fields="['email', 'validated', 'enabled', {key: 'single_order', label: 'Local preference'}, 'active', 'actions']"
                ></NotificationsSettings>
            </CCardBody>
            <CCardFooter>
                <CButton type="submit" size="sm" color="primary" v-on:click="onSubmit"><CIcon name="cil-check-circle"/> Submit</CButton>
                <CButton type="reset" size="sm" color="danger" v-on:click="onReset" ><CIcon name="cil-ban"/> Reset</CButton>
            </CCardFooter>
        </CCard>
        <CCard v-if="displayDebugInUI">
            <pre class="m-0" style="text-align: left;">{{ form }}</pre>
        </CCard>
    </div>
</template>

<script>
    import {
        callGetNotificationSettings,
        callGetNotificationSettingsRaw,
        callPostNotificationSettingsRaw
    } from "../../api";
    import NotificationsSettings from "./NotificationsSettings";
    import {default_notifications_settings} from "../../utils";

    export default {
        name: "NotificationSettingsStandalone",
        components: {NotificationsSettings},
        props: {
            msg: String,
            prefill: {
                type: Boolean,
                default: false
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
                visible_notification_options: false,
                effective_notifications_options: {
                    slack: null,
                    email: null
                },
            }
        },
        computed: {
        },

        created() {
            this.prefillFormToDefaultOrPassedValues()
            this.load_values_from_server()
        },
        methods: {
            load_values_from_server(){
                // todo: call on local change
                let self = this
                callGetNotificationSettingsRaw(this.target_id).then(function (response) {
                    self.form = response.data
                })
                callGetNotificationSettings(this.target_id).then(function (response) {
                    self.effective_notifications_options = response.data
                })
            },
            prefillFormToDefaultOrPassedValues() {
                this.form = default_notifications_settings()
                this.load_values_from_server()

                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            onSubmit(evt) {
                evt.preventDefault();
                console.log(JSON.stringify(this.form))
                callPostNotificationSettingsRaw(this.target_id, JSON.stringify(this.form))
                    .then(() => {
                    // todo: flash
                    })
            },
            onReset(evt) {
                evt.preventDefault();
                this.load_values_from_server()
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
