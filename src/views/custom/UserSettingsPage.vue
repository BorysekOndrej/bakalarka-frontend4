<template>
    <div style="max-width: 600px; margin: auto;">
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
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
                            ></NotificationsSettings>
                        </CCollapse>

                    </CCard>
                </transition>

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
    import {callGetTargetInfoForEditDialog} from "../../api";
    import NotificationsSettings from "./NotificationsSettings";

    export default {
        name: "addTargetComponent",
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
        },
        data() {
            return {
                form: {
                    notifications: null
                },
                show: true,
                visible_notification_options: false
            }
        },
        created() {
            this.prefillFormToDefaultOrPassedValues()
        },
        mounted(){
            this.prefillFormToDefaultOrPassedValues()
        },
        methods: {
            prefillFormToDefaultOrPassedValues() {
                this.form.notifications = {...this.notifications};

                if (this.notifications === null ){
                    return;
                }
                // Reset our form values
                if (this.modifying_existing){
                    let self = this
                    /* // todo:
                    callGetTargetInfoForEditDialog(this.form.target.id)
                        .then(function (response) {
                            self.form.notifications = response.data.notifications
                        })
                     */
                }
                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            onSubmit(evt) {
                evt.preventDefault();
                /*
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
                this.prefillFormToDefaultOrPassedValues()
            }
        },
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
