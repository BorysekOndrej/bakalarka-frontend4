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
                    caption="Primary test table"
                    :loading="loading"
                    :noItemsView="{ noResults: 'No results matching filter.', noItems: 'No targets' }"
                >
                    <!--
                    <template #status="{item}">
                        <td>
                            <CBadge :color="getBadge(item.status)">{{item.status}}</CBadge>
                        </td>
                    </template>
                    -->

                    <template #buttons="{item}">
                        <td class="button_only_td">
                            <!-- The whole row could be clickable, but that would make the copying values for difficult.-->
                            <CButton color="warning"
                                     class="btn-mi"
                                     v-on:click="edit_target(item)"
                                     v-c-tooltip="{content: 'Edit'}"
                            ><CIcon name="cil-pencil"/></CButton>

                            <CButton color="danger"
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
    import usersData from '../users/UsersData'
    import {callGetUserTargets} from "@/api";
    import AddTargetComponent from "./AddTargetComponent";
    import {filterObjToTargetDefinition} from "../../utils";

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
                caption: 'Test Table 1',
                editTargetModalVisible: false,
                targetToEdit: null,
                loading: false
            }
        },
        created() {
            this.syncGetUserTargets()
        },

        methods: {
            getBadge (status) {
                return status === 'Active' ? 'success'
                    : status === 'Inactive' ? 'secondary'
                        : status === 'Pending' ? 'warning'
                            : status === 'Banned' ? 'danger' : 'primary'
            },
            shuffleArray (array) {
                for (let i = array.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1))
                    let temp = array[i]
                    array[i] = array[j]
                    array[j] = temp
                }
                return array
            },

            getShuffledUsersData () {
                return this.shuffleArray(usersData.slice(0))
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