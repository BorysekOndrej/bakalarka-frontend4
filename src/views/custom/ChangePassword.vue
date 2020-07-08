<template>
    <div>
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
                <CForm>
                    <CInput
                            placeholder="Your current password"
                            type="password"
                            autocomplete="curent-password"
                            v-model="form.old_password"
                    >
                        <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                    </CInput>
                    <CInput
                            placeholder="New password"
                            type="password"
                            autocomplete="new-password"
                            v-model="form.new_password"
                            invalid-feedback="The password needs to have at least 6 characters."
                            :is-valid="password_validator"
                    >
                        <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                    </CInput>
                    <CInput
                            placeholder="New password again"
                            type="password"
                            v-model="form.new_password_again"
                            invalid-feedback="The two password fields don't match."
                            :is-valid="password_compare"
                    >
                        <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                    </CInput>
                </CForm>

            </CCardBody>
            <CCardFooter>
                <CButton type="submit" size="sm" color="primary" v-on:click="onSubmit" :disabled="disable_submit_button"><CIcon name="cil-check-circle"/> Submit</CButton>
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
        callPostChangePassword,
    } from "../../api";
    import {password_validator_util} from "../../utils";

    export default {
        name: "ChangePassword",
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
                        old_password: "",
                        new_password: "",
                        new_password_again: "",
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
            disable_submit_button: function () {
                let a = ( Boolean(this.form.new_password && this.form.new_password_again &&
                    this.password_validator() && this.password_compare()))
                return !a;
            },
        },

        created() {
            this.prefillFormToDefaultOrPassedValues()
        },
        methods: {
            password_validator (){
                return password_validator_util(this.form.new_password)
            },
            password_compare (){
                return this.form.new_password_again ?  this.form.new_password === this.form.new_password_again : undefined;
            },
            prefillFormToDefaultOrPassedValues() {
                this.form = {...this.form_default}

                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
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
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
