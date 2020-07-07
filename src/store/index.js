import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {
    authenticate,
    register,
    callAddTarget,
    jwtRefreshAccessToken,
    callDeleteTarget,
    callGetUserTargets,
    callGetScanResultHistory,
    callGetLogout,
    callGetNotificationSettings,
    callDeleteChannelConnection,
} from '../api'
import {isValidJwt, EventBus, sleep} from '../utils'
import moment from "moment";
// import router from '../router'

var JwtStatus = {
    Valid: 1,
    RefreshInProgress: 2,
    LastRefreshFailed: 3,
}

function initialState() {
    return {
        sidebarShow: 'responsive',
        sidebarMinimize: false,
        user: {},
        jwt: '',
        jwtLastRefreshStatus: JwtStatus.Valid,
        jwtLastRefreshRequestTimestamp: null,
        userTargets: [],
        userTargetsLoading: false,
        userTargetsHistory: [],
        userTargetsHistoryLoading: false,
        messageForMainBar: "",
        emailConnections: [],
        slackConnections: [],
        notificationConnectionsLoading: false,
    }
}

const actions = {
    // asynchronous operations
    login(context, userData) {
        return authenticate(userData)
            .then(function (response) {
                console.log("Setting jwt from login, response data ", response.data.access_token)
                context.commit('setJwt', response.data.access_token)
                if (store.getters.isAuthenticated()) {
                    context.commit('set', ["jwtLastRefreshStatus", JwtStatus.Valid])
                } else {
                    context.commit('set', ["jwtLastRefreshStatus", JwtStatus.LastRefreshFailed])
                }
            })
            .catch(function (error) {
                Vue.$log.warn('Error Authenticating: ', error)
                console.log("jwt test3")
                EventBus.$emit('failedAuthentication', error)
                context.commit('set', ["jwtLastRefreshStatus", JwtStatus.LastRefreshFailed])
                return Promise.reject(error);
            })
    },
    register(context, userData) {
        return register(userData)
            .then(function (response) {
                console.warn("Register: dispatching load after response: ", response)
                context.dispatch('login', userData) // todo: this doesn't work partially. Not sure why.
            })
            .catch(error => {
                Vue.$log.warn('Error Registering: ', error)
                EventBus.$emit('failedRegistering: ', error)
                return Promise.reject(error);
            })
    },
    logout(context) {
        callGetLogout()
            .finally(function () {
                context.commit('setJwt', "logout") // This is needed. It also erases the localStorage

                // https://github.com/vuejs/vuex/issues/1118#issuecomment-356286218
                context.commit("reset")

                // https://github.com/vuejs/vuex/issues/1118#issuecomment-472640928
                // The following would clear Vuex even more thoroughly, but forces refresh. Not ideal, current solution is sufficient.
                // router.go()
            })
    },
    removeTarget(context, userData) {
        Vue.$log.debug("Remove scan order triggered")
        return callDeleteTarget(userData)
            .then(() => EventBus.$emit('users-targets-modified'))
            .catch(error => {
                Vue.$log.warn('Error removing scan order: ', error)
                return Promise.reject(error);
            })
    },
    removeChannelConnection(context, payload) {
        Vue.$log.debug("Remove channel connection triggered")
        return callDeleteChannelConnection(payload["channel_name"], payload["channel_id"])
            .then(() => EventBus.$emit('connections-modified'))
            .catch(error => {
                Vue.$log.warn('Error removing channel connection: ', error)
                return Promise.reject(error);
            })
    },
    addTarget(context, userData) {
        Vue.$log.debug("Add target triggered")
        return callAddTarget(userData)
            .then(userData => {
                context.commit('targetAdded', userData)
                EventBus.$emit('users-targets-modified')
            })
            .catch(error => {
                Vue.$log.warn('Error adding new target: ', error)
                EventBus.$emit('failedAddTarget: ', error)
                return Promise.reject(error);
            })
    },
    async refreshAccessTokenIfNeeded(context) {
        // Vue.$log.debug(`refreshAccessTokenIfNeeded called. currently isAuthenticated=${context.getters.isAuthenticated}`)
        if (store.getters.isAuthenticated()) {
            console.debug("Current jwt access token is still valid")
            context.commit('set', ["jwtLastRefreshStatus", JwtStatus.Valid])
            return;
        }

        let tokenFromLocalStorage = localStorage.getItem("jwt_access_token");
        if (tokenFromLocalStorage === "logout" || tokenFromLocalStorage === null) {
            console.debug("Skiping JWT refresh, because LocalStorage has no value or saved logout.")
            // todo: It's possible that the localStorage could get wiped, but the cookie survived.
            //  Currently (Q2 2020) I consider it unlikely scenario and favor including the check for null to save on the request on first visit.
            context.commit('set', ["jwtLastRefreshStatus", JwtStatus.LastRefreshFailed])
            return;
        }

        if (isValidJwt(tokenFromLocalStorage)) {
            context.commit('setJwt', tokenFromLocalStorage)
            console.debug("Valid jwt access token loaded from localStorage")
            context.commit('set', ["jwtLastRefreshStatus", JwtStatus.Valid])
            return;
        }

        if (store.state.jwtLastRefreshStatus === JwtStatus.LastRefreshFailed) {
            console.log("JWT refresh canceled, because last previous JWT refresh failed")
            // todo: or retry after 1 minute?
            return
        }

        while (store.state.jwtLastRefreshStatus === JwtStatus.RefreshInProgress) {
            await sleep(50);
        }
        if (store.getters.isAuthenticated()) {
            console.debug("Valid jwt loaded as part of different request.")
            return;
        }

        context.commit('set', ["jwtLastRefreshStatus", JwtStatus.RefreshInProgress])
        context.commit('set', ["jwtLastRefreshRequestTimestamp", moment()])
        return jwtRefreshAccessToken()
            .then(function (response) {
                console.log("Setting jwt from jwtRefreshAccessToken, response data ", response.data)
                context.commit('setJwt', response.data.access_token)
                if (store.getters.isAuthenticated()) {
                    context.commit('set', ["jwtLastRefreshStatus", JwtStatus.Valid])
                } else {
                    context.commit('set', ["jwtLastRefreshStatus", JwtStatus.LastRefreshFailed])
                }
            })
            .catch(function (error) {
                Vue.$log.warn('Error refreshing jwt access token: ', error)
                context.commit('set', ["jwtLastRefreshStatus", JwtStatus.LastRefreshFailed])
                return Promise.reject(error);
            })
    },
    syncUserTargetsWithBasicResults(context) {
        context.commit('set', ["userTargetsLoading", true])

        callGetUserTargets()
            .then(function (response) {
                console.log("callGetUserTargets result received", response.data)
                let original_data = store.getters.getUserTargets
                if (original_data === response.data) {
                    console.log("callGetUserTargets refresh returned the same result as was already saved")
                    return;
                }
                context.commit('set', ["userTargets", response.data])
            })
            .catch(function (error) {
                Vue.$log.warn('callGetUserTargets error', error)
                return Promise.reject(error);
            })
            .finally(function () {
                context.commit('set', ["userTargetsLoading", false])
            })
    },
    syncUserTargetsHistory(context) {
        context.commit('set', ["userTargetsHistoryLoading", true])

        callGetScanResultHistory()
            .then(function (response) {
                context.commit('set', ["userTargetsHistory", response.data])
            })
            .catch(function (error) {
                Vue.$log.warn('syncUserTargetsHistory error', error)
                return Promise.reject(error);
            })
            .finally(function () {
                context.commit('set', ["userTargetsHistoryLoading", false])
            })
    },
    syncNotificationConnections(context, target_id) {
        context.commit('set', ["notificationConnectionsLoading", true])

        callGetNotificationSettings(target_id)
            .then(function (response) {
                context.commit('set', ["slackConnections", response.data.slack])
                context.commit('set', ["emailConnections", response.data.email])
            })
            .catch(function (error) {
                Vue.$log.warn('syncNotificationConnections error', error)
                return Promise.reject(error);
            })
            .finally(function () {
                context.commit('set', ["notificationConnectionsLoading", false])
            })
    },

}

const mutations = {
    toggleSidebarDesktop(state) {
        const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow)
        state.sidebarShow = sidebarOpened ? false : 'responsive'
    },
    toggleSidebarMobile(state) {
        const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow)
        state.sidebarShow = sidebarClosed ? true : 'responsive'
    },
    set(state, [variable, value]) {
        console.debug('Set: ', variable, ' = ', value)
        state[variable] = value
    },
    setJwt(state, access_token) {
        console.debug("setJwt", access_token)
        if (access_token === undefined) {
            console.warn("Tried to setJwt with access_token === undefined")
            return;
        }
        localStorage.jwt_access_token = access_token
        state.jwt = access_token
    },
    targetAdded(state, payload) {
        console.log(state, payload)
        //Vue.$log.debug('New target added = ', payload)
    },
    setMainBarMessage(state, payload) {
        state.messageForMainBar = payload
    },

    // https://github.com/vuejs/vuex/issues/1118#issuecomment-356286218
    reset(state) {
        // acquire initial state
        const s = initialState()
        Object.keys(s).forEach(key => {
            state[key] = s[key]
        })
    },

}

const getters = {
    isAuthenticated(state) {
        // this can't be computed or simple getter, because it would get cached and never update base on time.
        // https://forum.vuejs.org/t/vuex-getter-not-re-evaluating-return-cached-data/55697/5
        return function () {
            return state.jwt !== undefined && isValidJwt(state.jwt)
        }
    },
    getJwt(state) {
        return state.jwt;
    },
    getJwtData(state) {
        return getters.getJwt(state) ? JSON.parse(atob(getters.getJwt(state).split('.')[1])) : null
    },
    getUserIdentity(state) {
        return getters.getJwt(state) ? getters.getJwtData(state).identity : null
    },
    getUserID(state) {
        return getters.getJwt(state) ? getters.getUserIdentity(state).id : null
    },
    getUserTargets(state) {
        return state.userTargets;
    },
    getMainBarMessage(state) {
        let res_arr = []
        res_arr.push(state.messageForMainBar)
        if (state.jwtLastRefreshStatus === JwtStatus.LastRefreshFailed) {
            res_arr.push("Jwt last refresh failed. Not retrying, new login will be needed")
        }
        if (state.jwtLastRefreshStatus === JwtStatus.RefreshInProgress) {
            res_arr.push("Jwt refresh in progress")
        }
        if (state.userTargetsLoading) {
            res_arr.push("Refreshing local copy of targets")
        }
        if (state.userTargetsHistoryLoading) {
            res_arr.push("Refreshing local copy of history")
        }
        return res_arr.filter(x => x).join("  |  ")
    },
    getMainBarColor(state){
        if (state.jwtLastRefreshStatus === JwtStatus.LastRefreshFailed) {
            return 'danger';
        }
        if (state.jwtLastRefreshStatus === JwtStatus.RefreshInProgress) {
            return 'warning'
        }
        return 'light'
    }

}

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production', // todo: check that i set this variable
    state: initialState,
    actions,
    mutations,
    getters
})

export default store;
