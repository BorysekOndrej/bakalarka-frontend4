<template>
    <div>
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
                <CForm>
                    <CInput
                            label="Username"
                            horizontal
                            readonly
                            type="text"
                            v-model="form.username"
                    ></CInput>
                    <CInput
                            label="Email"
                            horizontal
                            readonly
                            type="text"
                            v-model="form.email"
                    ></CInput>
                    <CInput
                            label="API key"
                            horizontal
                            readonly
                            type="text"
                            v-model="form.main_api_key"
                    ></CInput>
                </CForm>

            </CCardBody>
            <!--
            <CCardFooter>
                <CButton type="submit" size="sm" color="primary" v-on:click="onSubmit" :disabled="disable_submit_button"><CIcon name="cil-check-circle"/> Submit</CButton>
                <CButton type="reset" size="sm" color="danger" v-on:click="onReset" ><CIcon name="cil-ban"/> Reset</CButton>
            </CCardFooter>
            -->
        </CCard>
        <CCard v-if="displayDebugInUI">
            <pre class="m-0" style="text-align: left;">{{ form }}</pre>
        </CCard>
    </div>
</template>

<script>
    import {callGetUserProfile} from "../../api";

    export default {
        name: "ProfileTab",
        props: {
            msg: String,
            prefill: {
                type: Boolean,
                default: false
            },
            form_default: {
                type: Object,
                default () {
                    return {
                        username: "",
                        email: "",
                        main_api_key: "",
                    }
                }
            },
        },
        data() {
            return {
                form: null,
            }
        },
        computed: {
            /*
            disable_submit_button: function () {
                return true;
            },
            */
        },

        created() {
            this.prefillFormToDefaultOrPassedValues()
        },
        methods: {
            prefillFormToDefaultOrPassedValues() {
                this.form = {...this.form_default}
                this.load_values_from_server()
                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            load_values_from_server(){
                let self = this
                callGetUserProfile().then(function (response) {
                    self.form = response.data
                })
            },
            /*
            onSubmit(evt) {
                evt.preventDefault();
                console.log(JSON.stringify(this.form))
                callPostChangePassword(JSON.stringify(this.form))
                    .then(() => {
                    // todo: flash
                    })
            },
            onReset(evt) {
                evt.preventDefault();
                this.prefillFormToDefaultOrPassedValues()
            }
             */
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
