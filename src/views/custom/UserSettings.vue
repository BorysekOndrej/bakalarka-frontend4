<template>
    <div style="max-width: 600px; margin: auto;">
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
                <CTabs>
                    <CTab title="Profile" active>
                        Here will be form with main user email and other properties.
                    </CTab>
                    <CTab title="Change password" active>
                        Here will be form for changing password.
                    </CTab>
                    <CTab title="Notification settings" active>
                        <NotificationSettingsStandalone
                                :user_id="user_id"
                        ></NotificationSettingsStandalone>
                    </CTab>
                </CTabs>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
    import NotificationSettingsStandalone from "./NotificationSettingsStandalone";

    export default {
        name: "UserSettings",
        components: {NotificationSettingsStandalone},
        props: {
            msg: String,
            user_id: {
                type: Number,
                default: 42     // todo: make dynamic call here
            },
        },
        data() {
            return {
                show: true,
            }
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
