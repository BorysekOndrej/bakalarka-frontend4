<template>
    <div class="wrapper">
        <CCard>
            <CCardHeader>
                <slot name="header">
                    <CIcon name="cil-grid"/> {{caption}}
                </slot>
            </CCardHeader>
            <CCardBody>
                <CAlert v-if="limit_to_ids" color="info">
                    Additional filtering of targets by IDs is {{ respectLimitToIDs ? "enabled" : "disabled"}}.
                    You can {{ !respectLimitToIDs ? "enable" : "disable"}} it by clicking
                    <a v-on:click="toggle_ids_filtering" class="alert-link">this link</a>
                    .
                    <br>
                    <span v-if="respectLimitToIDs">
                        Currently are shown only targets with IDs: {{limit_to_ids.join(", ")}}
                    </span>
                </CAlert>
                <CDataTable
                    :items="userTargets"
                    :fields="fields"
                    :items-per-page=10
                    columnFilter
                    :columnFilterValue="colFilter"
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

                            <CButton v-if="item.active == 'yes'"
                                     color="secondary"
                                     class="btn-mi"
                                     v-on:click="force_rescan(item)"
                                     v-c-tooltip="{content: 'Scan Now'}"
                            ><CIcon :content="freeSetVar.cilSync"/></CButton>

                            <CButton color="info"
                                     class="btn-mi"
                                     v-on:click="show_latest_scan_result(item)"
                                     v-c-tooltip="{content: 'Info'}"
                            ><CIcon name="cil-magnifying-glass"/></CButton>

                            <CButton color="warning"
                                     class="btn-mi"
                                     v-on:click="edit_target(item)"
                                     v-c-tooltip="{content: 'Edit'}"
                            ><CIcon name="cil-pencil"/></CButton>

                            <span v-if="item.active == 'yes'">
                                <CButton
                                     color="danger"
                                     class="btn-mi"
                                     v-on:click="delete_target(item)"
                                     v-c-tooltip="{content: 'Archive'}"
                                ><CIcon name="cil-ban"/></CButton>
                            </span>
                            <span v-else>
                                <CButton
                                        color="success"
                                        class="btn-mi"
                                        v-on:click="reenable_target(item)"
                                        v-c-tooltip="{content: 'Enable'}"
                                ><CIcon :content="freeSetVar.cilMediaPlay"/></CButton>
                                <!-- todo: this tooltip doesn't work, probably because it's being assigned to an element that is not in DOM by default.
                                    I haven't found a good way to fix it. No issue opened on github. Best documentation is for different version.
                                    https://coreui.io/docs/components/bootstrap/tooltips/
                                -->
                            </span>
                        </td>
                    </template>
                </CDataTable>

            </CCardBody>
        </CCard>
        <CModal
                title="Existing target"
                :show.sync="editTargetModalVisible"
                size="xl"
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
    import {callGetReenableTarget, callGetSSLyzeEnqueueNow} from "../../api";

    export default {
        name: 'TargetsTableComponent',
        components: {AddTargetComponent, LatestScanResults},
        props: {
            fields: {
                type: Array,
                default () {
                    return ['hostname', 'port', {key: 'ip_address', label: 'IP address'}, 'protocol', 'grade', 'expires', 'active', {key:'actions', filter: false, sorter: false}]
                }
            },
            limit_to_ids: {
                type: Array,
                default () {
                    return null
                }
            }
        },
        data() {
            return {
                caption: 'List of your targets',
                editTargetModalVisible: false,
                latestScanResultsVisible: false,
                latestScanResultsData: -1,
                targetToEdit: null,
                colFilter: { active: 'yes' },
                respectLimitToIDs: true,
            }
        },
        created() {
            this.$store.dispatch('syncUserTargetsWithBasicResults')

            let self = this;
            EventBus.$on('users-targets-modified', () => {
                self.$store.dispatch('syncUserTargetsWithBasicResults')
            });
        },
        computed: {
            userTargets() {
                if (this.limit_to_ids === null || this.respectLimitToIDs === false){
                    return this.$store.getters.getUserTargets
                }
                let self = this
                let res = this.$store.getters.getUserTargets.filter(function(x) {
                    return self.limit_to_ids.includes(x.id);
                });
                return res
            },
            userTargetsLoading() {
                return this.$store.state.userTargetsLoading
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
                callGetReenableTarget(row.id)
            },
            force_rescan(row){
                callGetSSLyzeEnqueueNow(row.id)
            },
            toggle_ids_filtering(){
                this.respectLimitToIDs = !this.respectLimitToIDs
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