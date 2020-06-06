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

    export default {
        name: 'CertificatesTable',
        components: {AddTargetComponent, LatestScanResults},
        props: {
            fields: {
                type: Array,
                default () {
                    return ['subject', 'notBefore', 'notAfter', 'subject_alternative_name_list', 'numberOfActiveDeployments', 'numberOfActiveNotTrustedDeployments', {key: 'thumbprint_sha256', label: 'SHA-256'}, {key:'actions', filter: false, sorter: false}]
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
                        for (const verified_cert of verified_cert_chain.certificate_chain) {
                            current_res.push(verified_cert)
                        }
                    }
                    for (const received_cert of single_target.result_simplified.received_certificate_chain_list.certificate_chain) {
                        current_res.push(received_cert)
                    }
                    res_per_target[target_id] = current_res
                }
                return res_per_target
            },
            userCertsDataForTable(){
                let resPerTarget = this.userCertsPerTarget
                let res = []

                console.warn(resPerTarget)
                for (const target_id in resPerTarget){
                    res.push(...resPerTarget[target_id])
                }

                let sha256AlreadyInNewRes = new Set();
                let deduplicatedRes = res.filter(el => {
                    const uniqProperty = el.thumbprint_sha256
                    const thisAlreadySeen = sha256AlreadyInNewRes.has(uniqProperty);
                    sha256AlreadyInNewRes.add(uniqProperty);
                    return !thisAlreadySeen;
                });

                return deduplicatedRes
            },

            userTargetsLoading() {
                return this.$store.state.userTargetsLoading // todo: fix, tie in to userTargetsHistory
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