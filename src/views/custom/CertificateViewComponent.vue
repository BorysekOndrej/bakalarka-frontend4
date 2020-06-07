<template>
    <CCard style="max-width: 800px; margin: auto">
    <table class="table table-borderless table-striped">
        <tbody>
        <tr>
            <th scope="row">Subject</th>
            <td>{{certificate.subject}}</td>
        </tr>
        <tr>
            <th scope="row">Thumbprint sha1</th>
            <td>{{certificate.thumbprint_sha1}}</td>
        </tr>
        <tr>
            <th scope="row">Thumbprint sha256</th>
            <td>{{certificate.thumbprint_sha256}}</td>
        </tr>
        <tr>
            <th scope="row">Common names</th>
            <td>?</td>
        </tr>
        <tr>
            <th scope="row">Alternative names</th>
            <td>{{certificate.subject_alternative_name_list}}</td>
        </tr>
        <tr>
            <th scope="row">Serial number</th>
            <td>{{certificate.serialNumber}}</td>
        </tr>
        <tr>
            <th scope="row">Valid from</th>
            <td>{{certificate.notBefore}}</td>
        </tr>
        <tr>
            <th scope="row">Valid until</th>
            <td>{{certificate.notAfter}}</td>
        </tr>
        <tr>
            <th scope="row">Public key</th> <!-- todo: check RSA vs EC-->
            <td>{{certificate.publicKey_algorithm}} - {{certificate.publicKey_size}} bits</td>
        </tr>
        <tr>
            <th scope="row">Signature algorithm</th>
            <td>{{certificate.signatureAlgorithm}}</td>
        </tr>
        <tr>
            <th scope="row">Issuer</th>
            <td>{{certificate.issuer}}</td>
        </tr>
        <tr>
            <th scope="row">As PEM</th>
            <td class="monospaceFont">{{certificate.as_pem}}</td>
        </tr>
        </tbody>
        <tfoot>
        <tr>
            <th scope="row">Other services</th>
            <td><a :href="censys">Censys</a> <a :href="crtsh">Crt.sh</a></td>
        </tr>
        </tfoot>
    </table>
    <CCard v-if="displayDebugInUI">
        <pre class="m-0" style="text-align: left;">{{ certificate }}</pre>
    </CCard>
    </CCard>
</template>

<script>
    import {testCertificate} from "../../utils";

    export default {
        name: "CertificateViewComponent",
        props: {
            certificate: {
                default () {
                    return {}
                }
            }

        },
        mounted() {
            // this.certificate = testCertificate() // todo: this modifies, prop. disable after done with debug
        },
        computed: {
            censys: function(){
                if (this.certificate.thumbprint_sha256 === undefined){
                    return ""
                }
                let a = this.certificate.thumbprint_sha256.replace(/:/g, "")
                return "https://censys.io/certificates/" + a
            },
            crtsh: function(){
                if (this.certificate.thumbprint_sha256 === undefined){
                    return ""
                }
                let a = this.certificate.thumbprint_sha256.replace(/:/g, "")
                return "https://crt.sh/?q=" + a
            }
        }
    }
</script>

<style scoped>
    .monospaceFont {
        font-family: monospace;
    }
</style>