<template>
    <div style="max-width: 600px; margin: auto;">
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
                <transition name="fade">
                    <CCard v-if="show">
                        <CCardHeader>
                            <CIcon name="cil-pencil"/> Domain
                        </CCardHeader>
                        <CCardBody>
                            <CInput
                                    label="Emails:"
                                    :value.sync="form.hostname"
                                    type="text"
                                    horizontal
                                    required
                                    placeholder="Hostname for which you would like to know subdomains"
                            />

                        </CCardBody>
                    </CCard>
                </transition>
                <CCard>
                    <pre class="m-0" style="text-align: left;">{{ result }}</pre>
                </CCard>
            </CCardBody>
            <CCardFooter>
                <CButton type="submit" size="sm" color="primary" v-on:click="onSubmit"><CIcon name="cil-check-circle"/> Search</CButton>
                <CButton type="reset" size="sm" color="danger" v-on:click="onReset" ><CIcon name="cil-ban"/> Reset</CButton>

                <CButton type="submit" size="sm" color="success" v-on:click="forwardToAddTarget" style="float: right;">
                    <CIcon :content="freeSetVar.cilShareAll" /> Add result as targets
                </CButton>
            </CCardFooter>
        </CCard>
        <CCard v-if="displayDebugInUI">
            <pre class="m-0" style="text-align: left;">{{ form }}</pre>
        </CCard>
    </div>
</template>

<script>
    import {callGetCertificateTransparency} from "../../api";
    import {freeSet} from "@coreui/icons";

    export default {
        name: "SearchCertificateTransparency",
        props: {
            msg: String,
            prefill: {
                type: Boolean,
                default: false
            },
            form_default: {
                type: Object,
                default: () => ({
                    hostname: null,
                })
            },
        },
        data() {
            return {
                form: null,
                show: true,
                result: null,
            }
        },
        created() {
            this.prefillFormToDefaultOrPassedValues()
        },
        methods: {
            prefillFormToDefaultOrPassedValues() {
                this.form = {...this.form_default};

                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            onSubmit(evt) {
                evt.preventDefault();
                console.log(JSON.stringify(this.form))
                let self = this
                callGetCertificateTransparency(this.form.hostname)
                    .then(function (response) {
                        self.result = response.data
                    })
            },
            onReset(evt) {
                evt.preventDefault();
                this.prefillFormToDefaultOrPassedValues()
            },
            forwardToAddTarget(evt) {
                if (this.result === undefined || this.result === null ||
                    this.result.result === undefined || this.result.result === null ||
                    this.result.length === 0){
                    console.log("Redirect stopped, because the result is not worth redirecting.")
                    return
                }
                console.log(this.result.result)

                this.$router.push({ name: 'Add Target', params: { hostnames: this.cleanupHostnamesForAdding(this.result.result) } })
            },
            cleanupHostnamesForAdding(hostnamesArr){
                let hostnamesSet = new Set()
                hostnamesArr = hostnamesArr.map(x => x.replace(/^(?:\*\.)/,"")) // this makes *.example.com -> example.com
                hostnamesArr = hostnamesArr.map(x => {
                    let splitRes = x.split("@")
                    return splitRes[splitRes.length-1]
                    }
                ) // this makes lorem@example.com -> example.com
                hostnamesArr.forEach(el => hostnamesSet.add(el))
                return [...hostnamesSet].join(",")
            }
        },
        computed: {
            freeSetVar(){
                return freeSet
            },
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
