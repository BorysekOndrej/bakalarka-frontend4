<template>
    <div style="max-width: 85%; margin: auto;">
        <h1>{{ msg }}</h1>
        <CCard>
            <CCardBody>
                <CTabs>
                    <CTab title="Profile" active>
                        <ProfileTab></ProfileTab>
                    </CTab>
                    <CTab title="Change password" active>
                        <ChangePassword></ChangePassword>
                    </CTab>
                    <CTab title="Notification settings" active>
                        <NotificationSettingsStandalone
                        ></NotificationSettingsStandalone>
                    </CTab>
                </CTabs>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
    import NotificationSettingsStandalone from "./NotificationSettingsStandalone";
    import ChangePassword from "./ChangePassword";
    import ProfileTab from "./ProfileTab";

    export default {
        name: "UserSettings",
        components: {NotificationSettingsStandalone, ChangePassword, ProfileTab},
        props: {
            msg: String,
        },
        data() {
            return {
                show: true,
            }
        },
        computed: {
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
