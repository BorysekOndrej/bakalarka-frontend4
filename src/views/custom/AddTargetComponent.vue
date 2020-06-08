<template>
    <div style="max-width: 600px; margin: auto;">
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardHeader>
                <p>
                    Add new target
                </p>
            </CCardHeader>
            <CCardBody>

            <CTextarea
                    label="Hostname:"
                    :value.sync="form.target.hostname"
                    type="text"
                    horizontal
                    required
                    placeholder="example.com
example.org
www.example.org
"
                    addInputClasses="hostnames-text-area"
            />

                <template v-if="superEasyMode == false">
                <transition name="fade">
                    <CCard v-if="show">
                        <CCardHeader>
                            <CIcon name="cil-pencil"/> Advanced target properties
                            <div class="card-header-actions">
                                <CLink
                                        class="card-header-action btn-minimize"
                                        @click="visible_target_advanced_options=!visible_target_advanced_options"
                                >
                                    <CIcon :name="`cil-chevron-${visible_target_advanced_options ? 'bottom' : 'top'}`"/>
                                </CLink>
                            </div>
                        </CCardHeader>
                        <CCollapse :show="visible_target_advanced_options">
                            <CCard>
                                <CInput
                                        label="Port:"
                                        :value.sync="form.target.port"
                                        type="number"
                                        min=0
                                        max=65535
                                        horizontal
                                        placeholder="If not specified, default port for HTTPS is assumed (i.e. 443)"
                                />

                                <CInput
                                        label="IP address:"
                                        :value.sync="form.target.ip_address"
                                        horizontal
                                        placeholder="If not specified, IPs will be resolved using DNS"
                                />

                                <CSelect
                                        label="SSL/TLS Protocol:"
                                        horizontal
                                        :value.sync="form.target.protocol"
                                        :options="ssl_protocols"
                                        required
                                />
                            </CCard>
                        </CCollapse>
                    </CCard>
                </transition>

                <transition name="fade">
                    <CCard v-if="show">
                        <CCardHeader>
                            <CIcon name="cil-calendar"/> Scan scheduling
                            <div class="card-header-actions">
                                <CLink
                                        class="card-header-action btn-minimize"
                                        @click="visible_scan_order_options=!visible_scan_order_options"
                                >
                                    <CIcon :name="`cil-chevron-${visible_scan_order_options ? 'bottom' : 'top'}`"/>
                                </CLink>
                            </div>
                        </CCardHeader>
                        <CCollapse :show="visible_scan_order_options">
                            <CCard>
                                <CSelect
                                        label="How often to check:"
                                        horizontal
                                        :value.sync="form.scanOrder.periodicity"
                                        :options="periodicity_options"
                                        required
                                />

                                <div class="form-group row">
                                    <label for="scanOrderActive" class="col-sm-4 col-form-label">Is currently activated</label>
                                    <div class="col-sm-2">
                                        <CSwitch
                                                id="scanOrderActive"
                                                class="mx-1"
                                                color="success"
                                                shape="pill"
                                                horizontal
                                                :checked.sync="form.scanOrder.active"
                                        />
                                    </div>
                                </div>
                            </CCard>
                        </CCollapse>
                    </CCard>
                </transition>


                <transition name="fade">
                    <CCard v-if="show">
                        <CCardHeader>
                            <CIcon name="cil-envelope-open"/> Notification options
                            <div class="card-header-actions">
                                <CLink
                                        class="card-header-action btn-minimize"
                                        @click="visible_notification_options=!visible_notification_options"
                                >
                                    <CIcon :name="`cil-chevron-${visible_notification_options ? 'bottom' : 'top'}`"/>
                                </CLink>
                            </div>
                        </CCardHeader>
                        <CCollapse :show="visible_notification_options">
                            <NotificationsSettings
                                    v-model="form.notifications"
                                    ref="notificationsComponent"
                            ></NotificationsSettings>
                        </CCollapse>

                    </CCard>
                </transition>
                </template>

            </CCardBody>
            <CCardFooter>

                <template v-if="modifying_existing && target_definition_changed">
                <CAlert show color="info">
                    <h4 class="alert-heading">Change to target definition detected</h4>
                    <p>
                        You've changed the Target which this rule monitors. Saving this change will archive the original
                        target and will add new target to be monitored.
                        History of those two won't be connected. The original target and it's history will be available
                        from the Archived targets page.
                        <!-- todo: add link to Archived targets page -->
                    </p>
                </CAlert>
                </template>

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
    import {callGetTargetInfoForEditDialog} from "../../api";
    import NotificationsSettings from "./NotificationsSettings";
    import {defaultTargetDefinition} from "../../utils";

    export default {
        name: "addTargetComponent",
        components: {NotificationsSettings},
        props: {
            msg: String,
            modifying_existing: {
                type: Boolean,
                default: false
            },
            prefill: {
                type: Boolean,
                default: false
            },
            superEasyMode: { // this hides any advanced options
                type: Boolean,
                default: false
            },
            target: {
                type: Object,
                default () {
                    return defaultTargetDefinition()
                }
            },
            scanOrder: {
                type: Object,
                default: () => ({
                    periodicity: 5*60,
                    active: true
                })
            },
            notifications: {
                type: Object,
                default: () => ({
                    emails_active: true,
                    emails_list: ""
                })
            },
        },
        data() {
            return {
                form: {
                    target: null,
                    scanOrder: null,
                    notifications: null
                },
                ssl_protocols: ['HTTPS', 'SMTPS'],
                periodicity_options: [{label: '5 minutes', value: 5*60}, {label: '12 hours', value: 12*60*60}],
                show: true,
                visible_target_advanced_options: false,
                visible_scan_order_options: false,
                visible_notification_options: false
            }
        },
        created() {
            this.prefillFormToDefaultOrPassedValues(true)
        },
        mounted(){
            this.prefillFormToDefaultOrPassedValues()
        },
        watch: {
            // eslint-disable-next-line no-unused-vars
            target: function(newVal, oldVal) {
                if (this.prefill) {
                    this.prefillFormToDefaultOrPassedValues()
                }
            }
        },
        methods: {
            prefillFormToDefaultOrPassedValues(beforeMounted=false) {
                this.form.target = {...this.target};
                this.form.scanOrder = {...this.scanOrder};
                this.form.notifications = {...this.notifications};

                if (!beforeMounted){
                    this.$refs.notificationsComponent.prefillFormToDefaultOrPassedValues()
                }

                if (this.target === null || this.target.id === null){
                    return;
                }
                // Reset our form values
                if (this.modifying_existing){
                    let self = this
                    callGetTargetInfoForEditDialog(this.form.target.id)
                        .then(function (response) {
                            self.form.scanOrder = response.data.scanOrder
                            self.form.notifications = response.data.notifications
                        })
                }
                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            onSubmit(evt) {
                evt.preventDefault();
                console.log(JSON.stringify(this.form))
                this.$store.dispatch('addTarget', JSON.stringify(this.form))
                    .then(() => this.$router.push('/'))
                    .then(() => {
                        if (this.modifying_existing && this.target_definition_changed){
                            this.$store.dispatch('removeTarget', this.target.id)
                        }
                    })
            },
            onReset(evt) {
                evt.preventDefault();
                this.prefillFormToDefaultOrPassedValues()
            }
        },
        computed: {
            target_definition_changed: function () {
                let json_target_new = JSON.stringify(this.target);
                let json_target_old = JSON.stringify(this.form.target);
                return json_target_new !== json_target_old;
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h3 {
        margin: 40px 0 0;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        display: inline-block;
        margin: 0 10px;
    }
    a {
        color: #42b983;
    }
</style>

<style>
    textarea.hostnames-text-area {
        /* this for some reason doesn't work when it's in scoped section */
        min-height: 100px;
    }
</style>
