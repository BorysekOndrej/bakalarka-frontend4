<template>
    <div>
        <h1>{{ msg }}</h1>
        <CCard v-if="last_scan_json.result">
            <div v-for="x in last_scan_json.result.certificate_information.received_certificate_chain_list.certificate_chain">
                <CertificateViewComponent
                    :certificate="x"
                ></CertificateViewComponent>
                <br>
                <hr>
            </div>
            <hr>
            <SSLTLS
                :result="last_scan_json.result"
            ></SSLTLS>
            <hr>
            <CCard v-if="displayDebugInUI">
                <pre class="m-0" style="text-align: left;">{{ last_scan_json }}</pre>
            </CCard>
        </CCard>
    </div>
</template>
received_certificate_chain_list
<script>
    import {callGetResultForTarget} from "../../api";
    import CertificateViewComponent from "./CertificateViewComponent";
    import SSLTLS from "./SSLTLS";

    export default {
        name: "latestScanResults",
        components: {SSLTLS, CertificateViewComponent},
        props: {
            msg: String,
            target_id: {
                type: Number,
                default: -1
            },
        },
        data() {
            return {
                last_scan_json: "Not (yet?) received answer through main path of execution. Still very much WIP.",
            }
        },
        mounted(){
            this.prefillFormToDefaultOrPassedValues()
        },
        watch: {
            // eslint-disable-next-line no-unused-vars
            target_id: function(newVal, oldVal) {
                this.prefillFormToDefaultOrPassedValues()
            }
        },
        methods: {
            prefillFormToDefaultOrPassedValues() {
                if (this.target_id < 0){
                    return;
                }
                let self = this
                callGetResultForTarget(this.target_id)
                    .then(function (response) {
                        self.last_scan_json = response.data
                    })
            },
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
