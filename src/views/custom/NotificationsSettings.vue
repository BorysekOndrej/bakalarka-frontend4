<template>
    <div style="max-width: 500px; margin: auto;">
        <h1>{{ msg }}</h1>
        <transition name="fade">
            <CCard v-if="show">
                <CCardHeader>
                    <CIcon name="cil-pencil"/> Email
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
                            <label for="scanNotificationsActive" class="col-sm-8 col-form-label">Send notifications via email</label>
                            <div class="col-sm-2">
                                <CSwitch
                                        id="scanNotificationsActive"
                                        class="mx-1"
                                        color="success"
                                        shape="pill"
                                        horizontal
                                        :checked.sync="form_notifications.emails_active"
                                />
                            </div>
                        </div>

                        <CInput
                                label="Emails:"
                                :value.sync="form_notifications.emails"
                                type="text"
                                horizontal
                                required
                                placeholder="Email(s) to which notifications should be sent. Separate by semicolon."
                        />
                    </CCard>
                </CCollapse>
            </CCard>
        </transition>
        <CCard>
            <pre class="m-0" style="text-align: left;">{{ form_notifications }}</pre>
        </CCard>
    </div>
</template>

<script>
    // import {callGetTargetInfoForEditDialog} from "../../api";

    export default {
        name: "NotificationsSettings",
        props: {
            msg: String,
            notifications: {
                type: Object,
                default: () => ({
                    emails_active: true,
                    emails: ""
                })
            },
        },
        data() {
            return {
                form_notifications: {
                    emails_active: true,
                    emails: "",
                },
                show: true,
                visible_mail_options: true,
            }
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
            prefillFormToDefaultOrPassedValues() {
                /*
                // Reset our form values
                this.form.target = {...this.target};
                if (!this.modifying_existing){
                    this.form.scanOrder = {...this.scanOrder};
                    this.form.notifications = {...this.notifications};
                }else{
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
                */
            },
            onSubmit(evt) {
                /*
                evt.preventDefault();
                console.log(JSON.stringify(this.form))
                this.$store.dispatch('addTarget', JSON.stringify(this.form))
                    .then(() => this.$router.push('/'))
                    .then(() => {
                        if (this.modifying_existing && this.target_definition_changed){
                            this.$store.dispatch('removeTarget', this.target.id)
                        }
                    })
                 */
            },
            onReset(evt) {
                evt.preventDefault();
                // this.prefillFormToDefaultOrPassedValues()
            }
        },
    }
</script>

<style scoped>
    div {
        /* background-color: lightgray; */
    }
</style>