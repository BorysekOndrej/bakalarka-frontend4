<template>
    <CCard style="max-width: 800px; margin: auto">
    <table class="table table-borderless table-striped" style="text-align:center;">
        <thead>
        <tr>
            <th scope="col">SSL/TLS version</th>
            <th scope="col">Number of different ciphers accepted</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <th scope="row">SSL 2</th>
            <td>{{result.sslv2.accepted_cipher_list.length}}</td>
        </tr>
        <tr>
            <th scope="row">SSL 3</th>
            <td>{{result.sslv3.accepted_cipher_list.length}}</td>
        </tr>
        <tr>
            <th scope="row">TLS 1</th>
            <td>{{result.tlsv1.accepted_cipher_list.length}}</td>
        </tr>
        <tr>
            <th scope="row">TLS 1.1</th>
            <td>{{result.tlsv11.accepted_cipher_list.length}}</td>
        </tr>
        <tr>
            <th scope="row">TLS 1.2</th>
            <td>{{result.tlsv12.accepted_cipher_list.length}}</td>
        </tr>
        <tr>
            <th scope="row">TLS 1.3</th>
            <td>{{result.tlsv13.accepted_cipher_list.length}}</td>
        </tr>
        </tbody>
    </table>


    </CCard>
</template>

<script>
    export default {
        name: "SSLTLS",
        props: {
            result: {
                default () {
                    return {}
                }
            }

        },
        mounted() {
        },
        computed: {
        }
    }
</script>

<style scoped>

</style>