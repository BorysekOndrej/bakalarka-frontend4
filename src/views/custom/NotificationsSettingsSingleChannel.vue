<template>
    <div>
        <h1>{{ msg }}</h1>
        <transition name="fade">
            <CCard v-if="show">
                <CCardHeader>
                    <CIcon :content="channel_icon"/> {{channel_name | capitalize }}
                    <div class="card-header-actions">
                        <CLink
                                class="card-header-action btn-minimize"
                                @click="visible_channel_options=!visible_channel_options"
                        >
                            <CIcon :name="`cil-chevron-${visible_channel_options ? 'bottom' : 'top'}`"/>
                        </CLink>
                    </div>
                </CCardHeader>
                <CCollapse :show="visible_channel_options">
                    <CCard>
                        <div class="form-group row">
                            <label for="scanMailNotificationsActive" class="col-sm-8 col-form-label">Send notifications via
                                {{channel_name}}</label>
                            <div class="col-sm-2">
                                <CSwitch
                                        id="scanMailNotificationsActive"
                                        class="mx-1"
                                        color="success"
                                        shape="pill"
                                        horizontal
                                        :checked="channelInverted"
                                        @update:checked="toggleChannel"

                                />
                            </div>
                        </div>

                        <CInput
                                v-if="channel_name == 'email'"
                                label="Add new emails:"
                                :value.sync="value.add_new_emails"
                                type="text"
                                horizontal
                                required
                                placeholder="Email(s) to which notifications should be sent. Separate by semicolon."
                        />
                        <CDataTable
                                :items="effective_notifications_options_channel"
                                :items-per-page=10
                                :fields="tableFields"
                                columnFilter
                                sorter
                                pagination
                                hover
                                striped
                                border
                                style="text-align: center"
                                caption="Primary test table"
                                :loading="notificationConnectionsLoading"
                                :noItemsView="{ noResults: 'No results matching filter.', noItems: 'No targets' }"
                        >
                            <template #single_order="{item}">
                                <td class="button_only_td">
                                    <CButton
                                            color="dark"
                                            variant="outline"
                                            v-on:click="toggleChannelAllowedNeutralDisabled(item.id)"
                                    >
                                        <CIcon
                                               :content="channelAllowedNeutralDisabledIcon(item.id)"
                                        />
                                    </CButton>
                                </td>
                            </template>
                            <template #actions="{item}">
                                <td class="button_only_td">
                                    <CButton
                                            v-if="channel_name == 'email' && item.validated == false"
                                            color="primary"
                                            class="btn-mi"
                                            v-on:click="requestEmailValidation(item)"
                                            v-c-tooltip="{content: 'Resend validation email'}"
                                    ><CIcon :content="$options.freeSet.cilEnvelopeLetter"/></CButton>
                                    <CButton
                                            color="danger"
                                            class="btn-mi"
                                            v-on:click="deleteChannelConnection(item)"
                                            v-c-tooltip="{content: 'Delete'}"
                                    ><CIcon name="cil-ban"/></CButton>
                                </td>
                            </template>
                        </CDataTable>
                        <CButton
                                v-if="channel_name == 'slack'"
                                type="submit"
                                size="sm"
                                color="primary"
                                v-on:click="addNewSlackConnection"
                        >
                            <CIcon :content="brands.cibSlack" style="margin-right: 0.5em;"/>  Add new Slack connection
                        </CButton>
                    </CCard>
                </CCollapse>
            </CCard>
        </transition>
    </div>
</template>

<script>
    import {callGetSlackAddURL, callPostRequestEmailValidation} from "../../api";
    import {freeSet, brandSet} from "@coreui/icons";
    import {EventBus} from "../../utils";

    export default {
        name: "NotificationsSettingsSingleChannel",
        freeSet,
        props: {
            msg: String,
            channel_name: String,
            channel_icon: Array,
            effective_notifications_options_channel: {
                type: Array,
                default: null
            },
            value: {
                type: Object,
            },
            tableFields: {
                type: Array,
            },
        },
        created() {
        },
        data() {
            return {
                show: true,
                visible_channel_options: true,
            }
        },
        computed: {
            notificationConnectionsLoading() {
                return this.$store.state.notificationConnectionsLoading
            },
            channelInverted(){
                return !this.value.force_disable
            },
            brands(){
                return brandSet
            }
        },
        methods: {
            prefillFormToDefaultOrPassedValues() {
                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.$nextTick(() => {
                    this.show = true;
                })
            },
            toggleChannel(){
                this.value.force_disable = !this.value.force_disable
            },
            toggleChannelAllowedNeutralDisabled(id){
                let channelPref = this.value
                if (this.isChannelForceAllowed(id) === this.isChannelForceDisabled(id)){
                    channelPref.force_enabled_ids.push(id)
                    return
                }
                if (this.isChannelForceDisabled(id)){
                    channelPref.force_disabled_ids = channelPref.force_disabled_ids.filter(e => e !== id)
                    return
                }
                channelPref.force_enabled_ids = channelPref.force_enabled_ids.filter(e => e !== id)
                channelPref.force_disabled_ids.push(id)
            },
            channelAllowedNeutralDisabledIcon(id){
                if (this.isChannelForceAllowed(id)){
                    return this.$options.freeSet.cilCheckCircle
                }
                if (this.isChannelForceDisabled(id)){
                    return this.$options.freeSet.cilXCircle
                }
                return this.$options.freeSet.cilCircle
            },
            isChannelForceAllowed(id){
                return this.value.force_enabled_ids.includes(id)
            },
            isChannelForceDisabled(id){
                return this.value.force_disabled_ids.includes(id)
            },
            addNewSlackConnection(evt) {
                evt.preventDefault();

                // The following trick let's me open an new window without popup blocker.
                // todo: make the window contain information about loading
                let slackAuthWindow = window.open("about:blank",'slackAuthWindow', 'height=750,width=550');
                callGetSlackAddURL()
                    .then(function (response) {
                        slackAuthWindow.open(response.data,'slackAuthWindow');
                    })

                // https://stackoverflow.com/a/38165968
                let popupTick = setInterval(function() {
                    if (slackAuthWindow.closed) {
                        clearInterval(popupTick);
                        EventBus.$emit('connections-modified')
                    }
                }, 500);

            },
            deleteChannelConnection(row){
                this.$store.dispatch('removeChannelConnection', {'channel_name': this.channel_name, 'channel_id': row.id})
            },
            requestEmailValidation(row){
                callPostRequestEmailValidation(row.email)
            }
        },
    }
</script>

<style scoped>

</style>