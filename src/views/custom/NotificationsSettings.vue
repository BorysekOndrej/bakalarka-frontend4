<template>
    <div>
        <h1>{{ msg }}</h1>
        <NotificationsSettingsSingleChannel
                channel_name="email"
                :channel_icon="$options.freeSet.cilEnvelopeOpen"
                v-model="value.email"
                :effective_notifications_options_channel="effective_notifications_options.email"
                :tableFields="email_fields"
        ></NotificationsSettingsSingleChannel>
        <NotificationsSettingsSingleChannel
                channel_name="slack"
                :channel_icon="brands.cibSlack"
                v-model="value.slack"
                :effective_notifications_options_channel="effective_notifications_options.slack"
                :tableFields="slack_fields"
        ></NotificationsSettingsSingleChannel>

        <CCard v-if="displayDebugInUI">
            <pre class="m-0" style="text-align: left;">{{ value }}</pre>
        </CCard>
    </div>
</template>

<script>
    import {callGetSlackAddURL} from "../../api";
    import {freeSet, brandSet} from "@coreui/icons";
    import {default_notifications_settings, EventBus} from "../../utils";
    import NotificationsSettingsSingleChannel from "./NotificationsSettingsSingleChannel";

    export default {
        name: "NotificationsSettings",
        components: {NotificationsSettingsSingleChannel},
        freeSet,
        props: {
            msg: String,
            effective_notifications_options: {
                type: Object,
                default: () => ({
                    email: null,
                    slack: null,
                })
            },
            value: {
                type: Object,
                default () {
                    return default_notifications_settings()
                }
            },
            slack_fields: {
                type: Array,
                default () {
                    return ['team_name', 'channel_name', 'team_id', 'channel_id', {key: 'single_order', label: 'Local preference'}, 'active']
                }
            },
            email_fields: {
                type: Array,
                default () {
                    return ['email', 'validated', 'enabled', {key: 'single_order', label: 'Local preference'}, 'active']
                }
            },
        },
        created() {
            // The following only applies to global state, i.e. target_id = None, but happens also when target_id != None
            // todo: solve better
            this.$store.dispatch('syncNotificationConnections')

            let self = this;
            EventBus.$on('connections-modified', () => {
                self.$store.dispatch('syncNotificationConnections')
            });

        },
        data() {
            return {
                show: true,
                visible_mail_options: true,
                visible_slack_options: true,
            }
        },
        computed: {
            brands(){
                return brandSet
            },
            slackConnections() {
                if (this.effective_notifications_options.slack){
                    return this.effective_notifications_options.slack
                }
                return this.$store.state.slackConnections
            },
            notificationConnectionsLoading() {
                return this.$store.state.notificationConnectionsLoading
            },
            emailConnections() {
                if (this.effective_notifications_options.email){
                    return this.effective_notifications_options.email
                }
                return this.$store.state.emailConnections
            },
        },
        methods: {
            prefillFormToDefaultOrPassedValues() {
                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            toggleChannelAllowedNeutralDisabled(channelPref, id){
                if (this.isChannelForceAllowed(channelPref, id) === this.isChannelForceDisabled(channelPref, id)){
                    channelPref.force_enabled_ids.push(id)
                    return
                }
                if (this.isChannelForceDisabled(channelPref, id)){
                    channelPref.force_disabled_ids = channelPref.force_disabled_ids.filter(e => e !== id)
                    return
                }
                channelPref.force_enabled_ids = channelPref.force_enabled_ids.filter(e => e !== id)
                channelPref.force_disabled_ids.push(id)
            },
            channelAllowedNeutralDisabledIcon(channelPref, id){
                if (this.isChannelForceAllowed(channelPref, id)){
                    return this.$options.freeSet.cilCheckCircle
                }
                if (this.isChannelForceDisabled(channelPref, id)){
                    return this.$options.freeSet.cilXCircle
                }
                return this.$options.freeSet.cilCircle
            },
            isChannelForceAllowed(channelPref, id){
                return channelPref.force_enabled_ids.includes(id)
            },
            isChannelForceDisabled(channelPref, id){
                return channelPref.force_disabled_ids.includes(id)
            },
        },
    }
</script>

<style scoped>

</style>