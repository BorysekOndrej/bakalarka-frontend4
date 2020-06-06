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
                    :columnFilterValue="{ active: 'yes' }"
                    sorter
                    pagination
                    hover
                    striped
                    border
                    style="text-align: center"
                    caption="Primary test table"
                    :loading="userTargetsLoading"
                    :noItemsView="{ noResults: 'No results matching filter.', noItems: 'No targets' }"
                >
                    <template #grade="{item}">
                        <td style="padding-top: 0px; padding-bottom: 0px; vertical-align: middle;">
                            <h3><CBadge :color="getBadge(item.grade)">{{item.grade}}</CBadge></h3>
                        </td>
                    </template>

                    <template #ip_address="{item}">
                        <td v-if="item.ip_address">
                            {{ item.ip_address }}
                        </td>
                        <td v-else>
                            DNS
                        </td>
                    </template>

                    <template #actions="{item}">
                        <td class="button_only_td">
                            <!-- The whole row could be clickable, but that would make the copying values for difficult.-->

                            <CButton color="info"
                                     class="btn-mi"
                                     v-on:click="show_latest_scan_result(item)"
                                     v-c-tooltip="{content: 'Info'}"
                            ><CIcon name="cil-magnifying-glass"/></CButton>

                            <CButton
                                     color="danger"
                                     class="btn-mi"
                                     v-on:click="delete_target(item)"
                                     v-c-tooltip="{content: 'Archive'}"
                            ><CIcon name="cil-filter"/></CButton>

                        </td>
                    </template>
                </CDataTable>

            </CCardBody>
        </CCard>
        <CModal
                title="Existing target"
                :show.sync="editTargetModalVisible"
        >
            <AddTargetComponent
                    :modifying_existing="true"
                    :prefill="true"
                    :target="targetToEdit"
            ></AddTargetComponent>
            <template #footer>
                <div><!-- This hides default buttons. The div is needed, empty template doesn't work. --></div>
            </template>
        </CModal>
        <CModal
                title="Latest scan result for this target"
                :show.sync="latestScanResultsVisible"
                size="xl"
        >
            <LatestScanResults
                :target_id="latestScanResultsData"
            ></LatestScanResults>
            <template #footer>
                <div><!-- This hides default buttons. The div is needed, empty template doesn't work. --></div>
            </template>
        </CModal>
    </div>
</template>

<script>
    import AddTargetComponent from "./AddTargetComponent";
    import LatestScanResults from "./LatestScanResults";
    import {filterObjToTargetDefinition, EventBus} from "../../utils";
    import { freeSet } from '@coreui/icons'
    import _ from "lodash" // Import the entire lodash library

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
            let chainDepth = el.chainDepth || minDepthForEachCert[uniqProperty]
            minDepthForEachCert[uniqProperty] = Math.min(chainDepth, minDepthForEachCert[uniqProperty])

            return !thisAlreadySeen;
        });

        for (const singleRes of deduplicatedRes){
            singleRes.chainDepth = minDepthForEachCert[singleRes.thumbprint_sha256]
        }

        // console.warn(minDepthForEachCert)
        // console.warn(deduplicatedRes)
        return deduplicatedRes
    }

    export default {
        name: 'CertificatesTable',
        components: {AddTargetComponent, LatestScanResults},
        props: {
            fields: {
                type: Array,
                default () {
                    return ['subject', 'notBefore', 'notAfter', 'subject_alternative_name_list',
                        'numberOfActiveDeployments', 'numberOfActiveNotTrustedDeployments',
                        {key: 'chainDepth', label: 'Min Depth In Cert Chain'},
                        {key: 'thumbprint_sha256', label: 'SHA-256'},
                        {key:'actions', filter: false, sorter: false}]
                }
            },
        },
        data() {
            return {
                caption: 'List of your certificates',
                editTargetModalVisible: false,
                latestScanResultsVisible: false,
                latestScanResultsData: -1,
                targetToEdit: null,
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
                    for (const verified_cert_chain of single_target.result_simplified.verified_certificate_chains_list) {
                        let currentDepth = 1 // this can't be zero, because elsewere I'm using `currentDepth || Number.MAX_VALUE`
                        for (const verified_cert of verified_cert_chain.certificate_chain) {
                            let modified_cert = Object.assign(verified_cert, {"chainDepth": currentDepth})
                            current_res.push(modified_cert)
                            currentDepth += 1
                        }
                    }
                    for (const received_cert of single_target.result_simplified.received_certificate_chain_list.certificate_chain) {
                        current_res.push(received_cert)
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
                            x.thumbprint_sha256 === "19:E6:87:BE:C8:BA:5E:AE:A0:F1:EB:AD:66:98:69:18:AC:8A:BA:6E:DB:86:90:C8:30:74:41:B5:44:F3:0C:09")
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

                    if (obj.chainDepth === Number.MAX_VALUE){
                        obj.chainDepth = "Not part of any verified chain"
                    }
                });

                return res
            },
            userTargets() {
                return this.$store.getters.getUserTargets
            },
            userTargetsLoading() {
                return this.$store.state.userTargetsLoading // todo: fix, duplicate it for userTargetsHistory
            },
            rawDataFromHistory(){
                return this.$store.state.userTargetsHistory
            },
            freeSetVar(){
                return freeSet
            }
        },
        methods: {
            getBadge (status) {
                switch (status) {
                    case 'A': return 'success';
                    case 'B': return 'secondary';
                    case 'C': return 'warning';
                    case 'D':
                    case 'E': return 'danger';
                    case 'Not scanned yet':
                    default: return 'secondary'
                }
            },
            show_latest_scan_result(row){
                this.latestScanResultsData = row.id;
                this.latestScanResultsVisible = true;
            },
            edit_target(row){
                console.log("edit_target", {...row});
                this.targetToEdit = filterObjToTargetDefinition({...row});
                this.editTargetModalVisible = true;
            },
            delete_target(row){
                this.$store.dispatch('removeTarget', row.id)
            },
            reenable_target(row){
                // todo:
            },
            force_rescan(row){
                // todo:
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
</style>