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
        <CCard v-if="displayDebugInUI">
            <pre class="m-0" style="text-align: left;">{{ value }}</pre>
        </CCard>
    </div>
</template>

<script>
    export default {
        name: "NotificationsSettings",
        props: {
            msg: String,
            value: {
                type: Object,
                default: () => ({
                    emails_active: true,
                    emails_list: ""
                })
            },
        },
        data() {
            return {
                show: true,
                visible_mail_options: true,
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
        },
    }
</script>

<style scoped>

</style>