import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {authenticate, register, callAddTarget, jwtRefreshAccessToken, callDeleteTarget} from '../api'
import {isValidJwt, EventBus} from '../utils'


const state = {
    sidebarShow: 'responsive',
    sidebarMinimize: false,
    user: {},
    jwt: '',
}

const actions = {
    // asynchronous operations
    login(context, userData) {
        context.commit('setUserData', {userData})
        return authenticate(userData)
            .then(function (response) {
                console.log("Setting jwt from login, response data ", response.data.access_token)
                context.commit('setJwt', response.data.access_token)
            })
            .catch(function (error) {
                Vue.$log.warn('Error Authenticating: ', error)
                console.log("jwt test3")
                EventBus.$emit('failedAuthentication', error)
                return Promise.reject(error);
            })
    },
    register(context, userData) {
        context.commit('setUserData', {userData})
        return register(userData)
            .then(function(response) {
                console.warn("Register: dispatching load after response: ", response)
                context.dispatch('login', userData) // todo: this doesn't work partially. Not sure why.
            })
            .catch(error => {
                Vue.$log.warn('Error Registering: ', error)
                EventBus.$emit('failedRegistering: ', error)
                return Promise.reject(error);
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
    addTarget(context, userData) {
        Vue.$log.debug("Add target triggered")
        return callAddTarget(userData)
            .then(userData => {
                context.commit('targetAdded', userData)
                EventBus.$emit('users-targets-modified')
            })
            .catch(error => {
                Vue.$log.warn('Error adding new target: ', error)
                EventBus.emit('failedAddTarget: ', error)
                return Promise.reject(error);
            })
    },
    refreshAccessTokenIfNeeded(context) {
        // Vue.$log.debug(`refreshAccessTokenIfNeeded called. currently isAuthenticated=${context.getters.isAuthenticated}`)
        if (store.getters.isAuthenticated) {
            console.debug("Current jwt access token is still valid")
            return;
        }
        let tokenFromLocalStorage = localStorage.getItem("jwt_access_token");
        if (isValidJwt(tokenFromLocalStorage)) {
            context.commit('setJwt', tokenFromLocalStorage)
            console.debug("Valid jwt access token loaded from localStorage")
            return;
        }
        return jwtRefreshAccessToken()
            .then(function (response) {
                console.log("Setting jwt from jwtRefreshAccessToken, response data ", response.data)
                context.commit('setJwt', response.data.access_token)
            })
            .catch(function (error) {
                Vue.$log.warn('Error refreshing jwt access token: ', error)
                return Promise.reject(error);
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
        console.debug(`Set: ${variable} = ${value}`)
        state[variable] = value
    },
    setUserData(state, payload) {
        // Vue.$log.debug('setUserData payload = ', payload)
        state.userData = payload.userData
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
    }
}

const getters = {
    isAuthenticated(state) { // this can't be computed, because it would get cached and never update base on time.
        return state.jwt !== undefined && isValidJwt(state.jwt)
    },
    getJwt(state) {
        return state.jwt;
    }
}

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production', // todo: check that i set this variable
    state,
    actions,
    mutations,
    getters
})

export default store;
