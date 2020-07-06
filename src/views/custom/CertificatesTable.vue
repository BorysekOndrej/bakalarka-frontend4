<template>
    <div class="wrapper">
        <CCard>
            <CCardHeader>
                <slot name="header">
                    <CIcon name="cil-grid"/> {{caption}}
                </slot>
            </CCardHeader>
            <CCardBody>

                <CDataTable
                    :items="userCertsDataForTable"
                    :fields="fields"
                    :items-per-page=10
                    columnFilter
                    sorter
                    pagination
                    hover
                    striped
                    border
                    style="text-align: center"
                    caption="Primary test table"
                    :loading="isLoading"
                    :noItemsView="{ noResults: 'No results matching filter.', noItems: 'There are either no active scans or the targets are yet to be scanned or they don\'t supply any certificates.' }"
                >
                    <template #minDepthInCertChain="{item}">
                        <td>
                            {{ item.minDepthInCertChain }} {{ (item.minDepthInCertChain === 1)? "(leaf)" : "" }}
                        </td>
                    </template>

                    <template #thumbprint_sha256="{item}">
                        <td class="sha256LimitWidth">
                            {{ item.thumbprint_sha256 }}
                        </td>
                    </template>
                    <template #notBefore="{item}">
                        <td v-bind:style="getStyleIfOutsideRange({ notBefore: date_to_moment(item.notBefore) })">
                            {{ date_to_string(item.notBefore) }}
                        </td>
                    </template>
                    <template #notAfter="{item}">
                        <td v-bind:style="getStyleIfOutsideRange({ notAfter: date_to_moment(item.notAfter) } )">
                            {{ date_to_string(item.notAfter) }}
                        </td>
                    </template>
                    <template #actions="{item}">
                        <td class="button_only_td">
                            <!-- The whole row could be clickable, but that would make the copying values for difficult.-->

                            <CButton color="info"
                                     class="btn-mi"
                                     v-on:click="show_certificate_properties(item)"
                                     v-c-tooltip="{content: 'Show all certificate properties'}"
                            ><CIcon name="cil-magnifying-glass"/></CButton>

                            <CButton
                                     color="secondary"
                                     class="btn-mi"
                                     v-on:click="go_to_targets_using_cert(item)"
                                     v-c-tooltip="{content: 'Go to table of targets filtered to targets using this certificate'}"
                            ><CIcon :content="freeSetVar.cilFilter"/></CButton>

                        </td>
                    </template>
                </CDataTable>

            </CCardBody>
        </CCard>
        <CModal
                title="Certificate details"
                :show.sync="showCertificateDetails"
                size="xl"
        >
            <CertificateViewComponent
                    :certificate="currentCertDetails"
            ></CertificateViewComponent>
            <template #footer>
                <div><!-- This hides default buttons. The div is needed, empty template doesn't work. --></div>
            </template>
        </CModal>
    </div>
</template>

<script>
    import {EventBus, filterObjToTargetDefinition} from "../../utils";
    import moment from "moment";
    import { freeSet } from '@coreui/icons'
    import _ from "lodash"
    import { getColor } from '@coreui/utils/src'
    import CertificateViewComponent from "./CertificateViewComponent";

    function deduplicateArrayOfCerts(arrCerts){
        let sha256AlreadyInNewRes = new Set();
        let minDepthForEachCert = new Map()
        // console.warn(arrCerts)

        let deduplicatedRes = arrCerts.filter(el => {
            const uniqProperty = el.thumbprint_sha256
            const thisAlreadySeen = sha256AlreadyInNewRes.has(uniqProperty);
            sha256AlreadyInNewRes.add(uniqProperty);

            if (minDepthForEachCert[uniqProperty] === undefined){
                minDepthForEachCert[uniqProperty] = Number.MAX_VALUE
            }
            let minDepthInCertChain = el.minDepthInCertChain || minDepthForEachCert[uniqProperty]
            minDepthForEachCert[uniqProperty] = Math.min(minDepthInCertChain, minDepthForEachCert[uniqProperty])

            return !thisAlreadySeen;
        });

        for (const singleRes of deduplicatedRes){
            singleRes.minDepthInCertChain = minDepthForEachCert[singleRes.thumbprint_sha256]
        }

        // console.warn(minDepthForEachCert)
        // console.warn(deduplicatedRes)
        return deduplicatedRes
    }

    export default {
        name: 'CertificatesTable',
        components: {CertificateViewComponent},
        props: {
            fields: {
                type: Array,
                default () {
                    return ['subject', 'notBefore', 'notAfter', 'subject_alternative_name_list',
                        'numberOfActiveDeployments', 'numberOfActiveNotTrustedDeployments',
                        {key: 'minDepthInCertChain', label: 'Min Depth In Verified Cert Chain'},
                        {key: 'thumbprint_sha256', label: 'SHA-256'},
                        {key:'actions', filter: false, sorter: false}]
                }
            },
        },
        data() {
            return {
                caption: 'List of your certificates',
                showCertificateDetails: false,
                currentCertDetails: {}
            }
        },
        created() {
            this.$store.dispatch('syncUserTargetsHistory')
            this.$store.dispatch('syncUserTargetsWithBasicResults')

            // todo: sync also syncUserTargetsHistory
            var self = this;
            EventBus.$on('users-targets-modified', () => {
                self.$store.dispatch('syncUserTargetsWithBasicResults')
            });
        },
        computed: {
            userCertsPerTarget(){
                let test1 = this.rawDataFromHistory
                let res_per_target = {}
                for (const single_target of test1) {
                    let target_id = single_target.target.id
                    let current_res = []
                    // console.warn(single_target);
                    if (single_target === undefined || single_target.result_simplified === undefined) {
                        continue
                    }
                    if (single_target.result_simplified.verified_certificate_chains_list) {
                        for (const verified_cert_chain of single_target.result_simplified.verified_certificate_chains_list) {
                            let currentDepth = 1 // this can't be zero, because elsewere I'm using `currentDepth || Number.MAX_VALUE`
                            for (const verified_cert of verified_cert_chain.certificate_chain) {
                                let modified_cert = Object.assign(verified_cert, {"minDepthInCertChain": currentDepth})
                                current_res.push(modified_cert)
                                currentDepth += 1
                            }
                        }
                    }
                    if (single_target.result_simplified.received_certificate_chain_list) {
                        for (const received_cert of single_target.result_simplified.received_certificate_chain_list.certificate_chain) {
                            current_res.push(received_cert)
                        }
                    }
                    let current_res_deduplicated = deduplicateArrayOfCerts(current_res)
                    res_per_target[target_id] = current_res_deduplicated
                }

                return res_per_target
            },
            userCertsDeduplicated(){
                let resPerTarget = this.userCertsPerTarget
                let res = []

                //console.warn(resPerTarget)
                for (const target_id in resPerTarget){
                    res.push(...resPerTarget[target_id])
                }

                let deduplicatedRes = deduplicateArrayOfCerts(res)

                return deduplicatedRes
            },
            userCertsDataForTable(){
                let certsDeduplicated = this.userCertsDeduplicated
                let certsPerTarget = this.userCertsPerTarget
                let userTarget = this.userTargets
                // let rawDataFromHistory = this.rawDataFromHistory

                let res = _.cloneDeep(certsDeduplicated)

                res.forEach(function(obj) {
                    obj.subject_alternative_name_list = obj.subject_alternative_name_list.replace(/,/g, "\n");

                    let target_ids_using_cert = new Set()
                    Object.keys(certsPerTarget).forEach(function(key) {
                        let filterToCurrentCert = certsPerTarget[key].filter(x =>
                            x.thumbprint_sha256 === obj.thumbprint_sha256)
                        if (filterToCurrentCert.length){
                            target_ids_using_cert.add(key)
                        }
                    });

                    obj.numberOfActiveDeployments = target_ids_using_cert.size

                    // console.log(target_ids_using_cert)
                    // console.log(userTarget)


                    obj.numberOfActiveNotTrustedDeployments = 0
                    for (const target_id_str of target_ids_using_cert){
                        let target_id = parseInt(target_id_str)
                        for (const x of userTarget) {
                            if (x.id !== target_id) {
                                continue
                            }
                            if (x.grade == "T"){ // todo: fix, I currently don't have grade T
                                obj.numberOfActiveNotTrustedDeployments += 1
                            }
                        }
                    }

                    if (obj.minDepthInCertChain === Number.MAX_VALUE){
                        obj.minDepthInCertChain = "Not part of any verified chain"
                    }
                });

                return res
            },
            userTargets() {
                return this.$store.getters.getUserTargets
            },
            rawDataFromHistory(){
                return this.$store.state.userTargetsHistory
            },
            freeSetVar(){
                return freeSet
            },
            isLoading(){
                return this.$store.state.userTargetsLoading || this.$store.state.userTargetsHistoryLoading
            }
        },
        methods: {
            date_to_moment(date){
                return moment(date, moment.ISO_8601)
            },
            date_to_string(date){
                return this.date_to_moment(date).format('YYYY-MM-DD hh:mm:ss');
            },
            show_certificate_properties(row){
                // console.log("show_certificate_properties", {...row});
                this.showCertificateDetails = true;
                this.currentCertDetails = {...row}
            },
            go_to_targets_using_cert(row){
                let arrOfIDsUsingCert = []
                let userCertsPerTarget = this.userCertsPerTarget
                for (const target_id in userCertsPerTarget){
                    let res1 = userCertsPerTarget[target_id].filter(el => {
                        return el.thumbprint_sha256 === row.thumbprint_sha256
                    });
                    if (res1.length){
                        arrOfIDsUsingCert.push(target_id)
                    }
                }
                this.$router.push({ name: 'List of targets', params: { target_id: arrOfIDsUsingCert.join(",") } })
            },
            getStyleIfOutsideRange(params){
                if (params.date === undefined){
                    params.date = moment()
                }
                if (
                    (params.notBefore && params.date < params.notBefore) ||
                    (params.notAfter && params.date > params.notAfter)
                ){
                    return { color: getColor("warning") }
                }
                return {}
            }
        }
    }
</script>

<style scoped>
    button.btn-mi {
        padding: 0.05rem 0.2rem;
        margin-left: 0.21875rem;
        margin-right: 0.21875rem;
    }
    td.button_only_td{
        min-width: 155px;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
    .sha256LimitWidth {
        max-width: 185px;
    }
</style>