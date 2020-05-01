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
                    :items="items"
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
                    :loading="loading"
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

                    <template #buttons="{item}">
                        <td class="button_only_td">
                            <!-- The whole row could be clickable, but that would make the copying values for difficult.-->
                            <CButton color="warning"
                                     class="btn-mi"
                                     v-on:click="edit_target(item)"
                                     v-c-tooltip="{content: 'Edit'}"
                            ><CIcon name="cil-pencil"/></CButton>

                            <CButton v-if="item.active == 'yes'"
                                     color="danger"
                                     class="btn-mi"
                                     v-on:click="delete_target(item)"
                                     v-c-tooltip="{content: 'Archive'}"
                            ><CIcon name="cil-ban"/></CButton>
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
    </div>
</template>

<script>
    import {callGetUserTargets} from "@/api";
    import AddTargetComponent from "./AddTargetComponent";
    import {filterObjToTargetDefinition, EventBus} from "../../utils";

    export default {
        name: 'TargetsTable',
        components: {AddTargetComponent},
        props: {
            items: {
                type: Array,
            },
            fields: {
                type: Array,
                default () {
                    return ['hostname', 'port', 'ip_address', 'protocol', 'grade', 'expires', 'active', {key:'buttons', filter: false, sorter: false}]
                }
            },
        },
        data() {
            return {
                caption: 'List of your targets',
                editTargetModalVisible: false,
                targetToEdit: null,
                loading: false
            }
        },
        created() {
            this.syncGetUserTargets()

            var self = this;
            EventBus.$on('users-targets-modified', () => {
                self.syncGetUserTargets()
            });
        },

        methods: {
            getBadge (status) {
                return status === 'A' ? 'success'
                    : status === 'B' ? 'secondary'
                        : status === 'C' ? 'warning'
                            : status === 'D' ? 'danger' : 'danger'
            },
            edit_target(row){
                console.log("edit_target", {...row});
                this.targetToEdit = filterObjToTargetDefinition({...row});
                this.editTargetModalVisible = true;
            },
            delete_target(row){
                this.$store.dispatch('removeTarget', row.id)
            },
            async syncGetUserTargets() {
                this.loading = true
                const response = await callGetUserTargets();
                // console.log(response)
                this.items = response.data;
                this.loading = false
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
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
</style>