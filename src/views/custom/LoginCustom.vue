<template>
  <CContainer class="d-flex content-center min-vh-100">
    <CRow>
      <CCol>
        <CCardGroup>
          <CCard class="p-4">
            <CCardBody>
              <CForm>
                <h1>Login</h1>
                <p class="text-muted">Sign in to your account</p>
                <CInput
                  placeholder="Username"
                  autocomplete="username"
                  v-model="username"
                >
                  <template #prepend-content><CIcon name="cil-user"/></template>
                </CInput>
                <CInput
                  placeholder="Password"
                  type="password"
                  autocomplete="new-password"
                  v-model="password"
                  invalid-feedback="The password needs to have at least 6 characters."
                  :is-valid="password_validator"
                >
                  <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                </CInput>
                <c-row>
                  <CCol col="12" class="text-left">
                    <CAlert show color="warning" v-if="errorMsg" >{{errorMsg}}</CAlert>
                  </CCol>
                </c-row>
                <CRow>
                  <CCol col="6" class="text-left">
                    <CButton color="primary"
                             class="px-4"
                             v-on:click="authenticate"
                             :disabled="disable_submit_button"
                    >Login</CButton>
                  </CCol>
                  <CCol col="6" class="text-right">
                    <CButton color="link" class="px-0" disabled="">Forgot password?</CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
          <CCard
            color="primary"
            text-color="white"
            class="text-center py-5 d-sm-down-none"
            body-wrapper
          >
            <h2>Sign up</h2>
            <p>Do you want to get notification before the certificates on you site expire?</p>
            <router-link to="/register" tag="span" >
            <CButton
              color="secondary"
              class="active mt-3"
            >
              Register Now!
            </CButton>
            </router-link>
          </CCard>
        </CCardGroup>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script>
import { EventBus, password_validator_util } from '@/utils'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',

      errorMsg: ''
    }
  },
  computed: {
    disable_submit_button() {
      let a = this.username && this.password_validator();
      let b = !a;
      // console.log(b);
      return b;
    },
  },
  methods: {
    password_validator (){
      return password_validator_util(this.password)
    },
    authenticate () {
      if (this.disable_submit_button){
        console.warn("Login button pressed even when it should have been disabled.")
        return;
      }
      this.$store.dispatch('login', { username: this.username, password: this.password })
              .then(() => this.$router.push('/'))
    },
  },
  mounted () {
    EventBus.$on('failedAuthentication', (msg) => {
      this.errorMsg = msg
    })
  },
  beforeDestroy () {
    EventBus.$off('failedAuthentication')
  }
}

</script>
