<template>
    <div style="max-width: 500px; margin: auto;">
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
                                        :checked.sync="value.emails_active"
                                />
                            </div>
                        </div>

                        <CInput
                                label="Emails:"
                                :value.sync="value.emails_list"
                                type="text"
                                horizontal
                                required
                                placeholder="Email(s) to which notifications should be sent. Separate by semicolon."
                        />
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
                                        :checked.sync="value.slacks_active"
                                />
                            </div>
                        </div>
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

    export default {
        name: "NotificationsSettings",
        props: {
            msg: String,
            value: {
                type: Object,
                default: () => ({
                    emails_active: true,
                    slacks_active: true,
                    emails_list: ""
                })
            },
        },
        created() {
            this.$store.dispatch('syncSlackConnections')
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
        },
        methods: {
            prefillFormToDefaultOrPassedValues() {
                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
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

            },

        },
    }
</script>

<style scoped>

</style>