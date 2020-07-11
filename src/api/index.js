import axios from 'axios'
import store from '../store'

import Vue from 'vue'
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import {EventBus} from "../utils";

const API_URL = process.env.VUE_APP_API_URL ? process.env.VUE_APP_API_URL : '{{ API_URL }}' ;
const options_non_jwt_access_endpoints = {withCredentials: true} // allow cookies
const axios_api_options = {
    headers: {
        // Authorization: `Bearer ${getJwtAccesTokenLocalWrapper()}`, // set by interceptor
        'Content-Type': 'application/json'
    }
}

const apiAxios = axios.create(axios_api_options);
const nonBearerAxios = axios.create(options_non_jwt_access_endpoints);

// This adds bearer token, but it doesn't solve situation when the requests failed
apiAxios.interceptors.request.use( async (request) => {
    await store.dispatch("refreshAccessTokenIfNeeded");
    // console.warn("TESTTEST", getJwtAccesTokenLocalWrapper())
    request.headers['Authorization'] = `Bearer ${getJwtAccesTokenLocalWrapper()}`;
    return request;
}, (error) => {
    return Promise.reject(error);
});


const refreshAuthLogic = failedRequest => store.dispatch("refreshAccessTokenIfNeeded")
    .then(function () {
            // todo: critical: if to many consecutive request failed, even after refresh,
            //  block all further communication to avoid flooding the server
            failedRequest.response.config.headers['Authorization'] = `Bearer ${getJwtAccesTokenLocalWrapper()}`;
            Vue.$log.info(`Resending request with new access_token ${getJwtAccesTokenLocalWrapper()}`);
            return Promise.resolve();
        }
    );

createAuthRefreshInterceptor(apiAxios, refreshAuthLogic, {statusCodes: [401, 422]});

export function authenticate(userData) {
    return nonBearerAxios.post(`${API_URL}/api/v1/login`, userData, options_non_jwt_access_endpoints)
}

export function register(userData) {
    return nonBearerAxios.post(`${API_URL}/api/v1/register`, userData, options_non_jwt_access_endpoints)
}


export function jwtRefreshAccessToken() {
    return nonBearerAxios.get(`${API_URL}/api/v1/refreshToken`, options_non_jwt_access_endpoints)
}

function getJwtAccesTokenLocalWrapper() {
    // console.log(`getJwtAccesTokenLocalWrapper called, store is currently`, store)
    // await store.dispatch("refreshAccessTokenIfNeeded")
    return store.getters.getJwt;
}


function getFromAPI(path) {
    Vue.$log.debug(`getFromAPI sending request to ${path}\n with access_token ${getJwtAccesTokenLocalWrapper()}`);
    return apiAxios.get(`${API_URL}${path}`,
        {...axios_api_options,
            Authorization: `Bearer ${getJwtAccesTokenLocalWrapper()
        }`});
}

function postToAPI(path, data) {
    Vue.$log.debug(`sentToApi sending request to ${path}\n with access_token ${getJwtAccesTokenLocalWrapper()}\n and data: ${data}`);
    return apiAxios.post(`${API_URL}${path}`, data,
        {
            ...axios_api_options,
            Authorization: `Bearer ${getJwtAccesTokenLocalWrapper()}`
        });
}

function deleteToAPI(path) {
    Vue.$log.debug(`sentToApi sending request to ${path}\n with access_token ${getJwtAccesTokenLocalWrapper()}`);
    return apiAxios.delete(`${API_URL}${path}`,
        {
            ...axios_api_options,
            Authorization: `Bearer ${getJwtAccesTokenLocalWrapper()}`
        });
}

export function callAddTarget(data) {
    return postToAPI('/api/v1/add_target', data);
}

export function callGetUserTargets() {
    return getFromAPI('/api/v1/get_user_targets');
}

export function callGetTargetInfoForEditDialog(target_id){
    return getFromAPI('/api/v1/target/' + target_id);
}

export function callDeleteTarget(target_id){
    return deleteToAPI('/api/v1/target/' + target_id);
}

export function callGetReenableTarget(target_id){
    return getFromAPI('/api/v1/enable_target_scan/' + target_id)
        .then(() => EventBus.$emit('users-targets-modified'));
}

export function callGetResultForTarget(target_id){
    return getFromAPI('/api/v1/get_result_for_target/' + target_id);
}

export function callGetNotificationSettings(target_id){
    if (target_id === undefined){ // this slightly beautifies developer tools network tab in browser
        return getFromAPI(`/api/v1/notification_settings`);
    }
    return getFromAPI(`/api/v1/notification_settings/${target_id}`);
}

export function callGetNotificationSettingsRaw(target_id){
    if (target_id === undefined){ // this slightly beautifies developer tools network tab in browser
        return getFromAPI(`/api/v1/notification_settings_raw`);
    }
    return getFromAPI(`/api/v1/notification_settings_raw/${target_id}`);
}

export function callPostNotificationSettingsRaw(target_id, data){
    return postToAPI(`/api/v1/notification_settings_raw/${target_id}`, data);
}

export function callGetScanResultHistory(){
    return getFromAPI(`/api/v1/scan_result_history`);
}

export function callGetCertificateTransparency(hostname){
    return getFromAPI(`/api/v1/ct_get_subdomains/${hostname}`);
}

export function callGetSSLyzeEnqueueNow(target_id){
    return getFromAPI(`/api/v1/sslyze_enqueue_now/${target_id}`);
}

export function callGetLogout(){
    // return getFromAPI(`/api/v1/logout`);
    return nonBearerAxios.get(`${API_URL}/api/v1/logout`, options_non_jwt_access_endpoints)
}

export function callGetSlackAddURL(){
    return getFromAPI(`/api/v1/slack/begin_auth`);
}

export function callDeleteChannelConnection(channel_name, channel_id){
    return deleteToAPI(`/api/v1/channel_connection/${channel_name}/${channel_id}`);
}

export function callPostRequestEmailValidation(email){
    return postToAPI(`/api/v1/send_validation_email`, {"email": email});
}

export function callPostChangePassword(payload){
    return postToAPI(`/api/v1/user/change_password`, payload);
}

export function callGetUserProfile(){
    return getFromAPI(`/api/v1/user`);
}
