<template>
    <div style="max-width: 800px; margin: auto;">
        <h1>{{ msg }}</h1>
        <transition name="fade">
            <CCard v-if="show">
                <CCardHeader>
                    <CIcon name="cil-envelope-open"/> Email
                    <div class="card-header-actions">
                        <CLink
                                class="card-header-action btn-minimize"
                                @click="visible_mail_options=!visible_mail_options"
                        >
                            <CIcon :name="`cil-chevron-${visible_mail_options ? 'bottom' : 'top'}`"/>
                        </CLink>
                    </div>
                </CCardHeader>
                <CCollapse :show="visible_mail_options">
                    <CCard>
                        <div class="form-group row">
                            <label for="scanMailNotificationsActive" class="col-sm-8 col-form-label">Send notifications via email</label>
                            <div class="col-sm-2">
                                <CSwitch
                                        id="scanMailNotificationsActive"
                                        class="mx-1"
                                        color="success"
                                        shape="pill"
                                        horizontal
                                        :checked="emailInverted"
                                        @update:checked="toggleEmail"

                                />
                            </div>
                        </div>

                        <CInput
                                label="Add new emails:"
                                :value.sync="value.email.add_new_emails"
                                type="text"
                                horizontal
                                required
                                placeholder="Email(s) to which notifications should be sent. Separate by semicolon."
                        />
                        <CDataTable
                                :items="emailConnections"
                                :items-per-page=10
                                :fields="email_fields"
                                columnFilter
                                sorter
                                pagination
                                hover
                                striped
                                border
                                style="text-align: center"
                                caption="Primary test table"
                                :loading="notificationConnectionsLoading"
                                :noItemsView="{ noResults: 'No results matching filter.', noItems: 'No targets' }"
                        >

                            <template #actions="{item}">
                                <td class="button_only_td">
                                    <CButton
                                            color="danger"
                                            class="btn-mi"
                                            v-on:click="deleteSlackConnection(item)"
                                            v-c-tooltip="{content: 'Delete'}"
                                    ><CIcon name="cil-ban"/></CButton>
                                </td>
                            </template>
                        </CDataTable>
                    </CCard>
                </CCollapse>
            </CCard>
        </transition>
        <transition name="fade">
            <CCard v-if="show">
                <CCardHeader>
                    <CIcon :content="brands.cibSlack"/> Slack
                    <div class="card-header-actions">
                        <CLink
                                class="card-header-action btn-minimize"
                                @click="visible_slack_options=!visible_slack_options"
                        >
                            <CIcon :name="`cil-chevron-${visible_slack_options ? 'bottom' : 'top'}`"/>
                        </CLink>
                    </div>
                </CCardHeader>
                <CCollapse :show="visible_slack_options">
                    <CCard>
                        <div class="form-group row">
                            <label for="scanSlackNotificationsActive" class="col-sm-8 col-form-label">Send notifications via slack</label>
                            <div class="col-sm-2">
                                <CSwitch
                                        id="scanSlackNotificationsActive"
                                        class="mx-1"
                                        color="success"
                                        shape="pill"
                                        horizontal
                                        :checked="slackInverted"
                                        @update:checked="toggleSlack"
                                />
                            </div>
                        </div>
                        <CDataTable
                                :items="slackConnections"
                                :items-per-page=10
                                :fields="slack_fields"
                                columnFilter
                                sorter
                                pagination
                                hover
                                striped
                                border
                                style="text-align: center"
                                caption="Primary test table"
                                :loading="notificationConnectionsLoading"
                                :noItemsView="{ noResults: 'No results matching filter.', noItems: 'No targets' }"
                        >

                            <template #actions="{item}">
                                <td class="button_only_td">
                                    <CButton
                                            color="danger"
                                            class="btn-mi"
                                            v-on:click="deleteSlackConnection(item)"
                                            v-c-tooltip="{content: 'Delete'}"
                                    ><CIcon name="cil-ban"/></CButton>
                                </td>
                            </template>
                        </CDataTable>

                        <CButton type="submit" size="sm" color="primary" v-on:click="addNewSlackConnection">
                            <CIcon :content="brands.cibSlack" style="margin-right: 0.5em;"/>  Add new Slack connection</CButton>
                    </CCard>
                </CCollapse>
            </CCard>
        </transition>
        <CCard v-if="displayDebugInUI">
            <pre class="m-0" style="text-align: left;">{{ value }}</pre>
        </CCard>
    </div>
</template>

<script>
    import {callGetSlackAddURL} from "../../api";
    import {freeSet, brandSet} from "@coreui/icons";
    import {default_notifications_settings, EventBus} from "../../utils";

    export default {
        name: "NotificationsSettings",
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
                    return ['team_name', 'channel_name', 'team_id', 'channel_id', 'actions']
                }
            },
            email_fields: {
                type: Array,
                default () {
                    return ['email', 'validated', 'enabled', 'active', 'actions']
                }
            },
        },
        created() {
            // The following only applies to global state, i.e. target_id = None, but happens also when target_id != None
            // todo: solve better
            this.$store.dispatch('syncNotificationConnections')

            let self = this;
            EventBus.$on('slack-connections-modified', () => {
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
            freeSetVar(){
                return freeSet
            },
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
            slackInverted(){
                return !this.value.slack.force_disable
            },
            emailInverted(){
                return !this.value.email.force_disable
            }
        },
        methods: {
            prefillFormToDefaultOrPassedValues() {
                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            toggleSlack(){
                this.value.slack.force_disable = !this.value.slack.force_disable
            },
            toggleEmail(){
                this.value.email.force_disable = !this.value.email.force_disable
            },
            addNewSlackConnection(evt) {
                evt.preventDefault();

                // The following trick let's me open an new window without popup blocker.
                // todo: make the window contain information about loading
                let slackAuthWindow = window.open("about:blank",'slackAuthWindow', 'height=750,width=550');
                callGetSlackAddURL()
                    .then(function (response) {
                        slackAuthWindow.open(response.data,'slackAuthWindow');
                    })

                // https://stackoverflow.com/a/38165968
                let popupTick = setInterval(function() {
                    if (slackAuthWindow.closed) {
                        clearInterval(popupTick);
                        EventBus.$emit('slack-connections-modified')
                    }
                }, 500);

            },
            deleteSlackConnection(row){
                console.warn(row)
                this.$store.dispatch('removeSlackConnection', {'team_id': row.team_id, 'channel_id': row.channel_id})
            },
        },
    }
</script>

<style scoped>

</style>