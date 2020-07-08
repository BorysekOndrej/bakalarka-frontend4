<template>
  <div class="d-flex align-items-center min-vh-100">
    <CContainer fluid>
      <CRow class="justify-content-center">
        <CCol md="6">
          <CCard class="mx-4 mb-0">
            <CCardBody class="p-4">
              <CForm>
                <h1>Register</h1>
                <p class="text-muted">Create your account</p>
                <CInput
                  placeholder="Username"
                  autocomplete="username"
                  v-model="form.username"
                >
                  <template #prepend-content><CIcon name="cil-user"/></template>
                </CInput>
                <CInput
                  placeholder="Email"
                  autocomplete="email"
                  prepend="@"
                  type="email"
                  v-model="form.email"
                />

                <CInput
                  placeholder="Password"
                  type="password"
                  autocomplete="new-password"
                  v-model="form.password"
                  invalid-feedback="The password needs to have at least 6 characters."
                  :is-valid="password_validator"
                >
                  <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                </CInput>
                <CInput
                  placeholder="Repeat password"
                  type="password"
                  autocomplete="new-password"
                  class="mb-4"
                  v-model="form.password_again"
                  invalid-feedback="The two password fields don't match."
                  :is-valid="password_compare"
                >
                  <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                </CInput>

                <CAlert show color="warning" v-if="errorMsg" >{{errorMsg}}</CAlert>

                <CButton color="success" block :disabled="disable_submit_button" v-on:click="register">Create Account</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import { EventBus } from '@/utils'
import {password_validator_util} from "../../utils";
// import {required, minLength, sameAs, email} from "vuelidate/lib/validators";

export default {
  name: 'Register',
  data () {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        password_again: '',
      },
      errorMsg: ''
    }
  },/*
  validations: {
    username: {
      required,
    },
    email: {
      required,
      email
    },
    password: {
      required,
      minLength: minLength(requiredPasswordLen)
    },
    password_again: {
      required,
      sameAsPassword: sameAs('password')
    },
  },*/
  computed: {
    disable_submit_button: function () {
      let a = ( Boolean(this.form.username && this.form.email && this.form.password && this.form.password_again &&
              this.password_validator() && this.password_compare() && this.email_validator()))
      let b = !a
      console.log(b); // todo: this returns correct value, but doesn't disable as I've expected
      return b;
    }
  },
  methods: {
    password_validator (){
      return password_validator_util(this.form.password)
    },
    password_compare (){
      return this.form.password_again ?  this.form.password === this.form.password_again : undefined;
    },
    email_validator(){
      return this.validEmail(this.form.email)
    },
    validEmail: function (email) { // taken from https://vuejs.org/v2/cookbook/form-validation.html
      // todo: this might not be the same validator as is used for type="mail"
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },

    register () {
      // todo: move validations to inside of store function
      if (this.disable_submit_button){
        console.warn("Register button pressed even when it should have been disabled.")
        return;
      }
      let toSend = {...this.form}
      delete toSend['password_again']
      this.$store.dispatch('register', toSend)
              .then(() => this.$router.push('/'))
    },
  },
  mounted () {
    EventBus.$on('failedRegistering', (msg) => {
      this.errorMsg = msg
    })
  },
  beforeDestroy () {
    EventBus.$off('failedRegistering')
  }
}

</script>

