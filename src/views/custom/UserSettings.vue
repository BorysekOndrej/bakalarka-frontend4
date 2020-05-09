<template>
    <div style="max-width: 600px; margin: auto;">
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
                <NotificationSettingsStandalone
                        :user_id="user_id"
                ></NotificationSettingsStandalone>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
    import NotificationSettingsStandalone from "./NotificationSettingsStandalone";

    export default {
        name: "UserSettings",
        components: {NotificationSettingsStandalone},
        props: {
            msg: String,
            prefill: {
                type: Boolean,
                default: false
            },
            user_id: {
                type: Number,
                default: 42     // todo: make dynamic call here
            },
        },
        data() {
            return {
                show: true,
            }
        },
/*
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
            prefillFormToDefaultOrPassedValues(beforeMounted=false) {
                this.form = {...this.notifications};

                if (!beforeMounted){
                    this.$refs.notificationsComponent.prefillFormToDefaultOrPassedValues()
                }

                if (this.notifications === null ){
                    return;
                }
                // Reset our form values
                let self = this
                callGetNotifications(this.user_id, this.target_id)
                    .then(function (response) {
                        self.form = response.data
                    })

                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            onSubmit(evt) {
                evt.preventDefault();
                console.log(JSON.stringify(this.form))
            },
            onReset(evt) {
                evt.preventDefault();
                this.prefillFormToDefaultOrPassedValues()
            }
        },
*/
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
