import axios from 'axios'
import store from '../store'

import Vue from 'vue'
import createAuthRefreshInterceptor from 'axios-auth-refresh';

const API_URL = 'http://bakalarka3.borysek:5000'
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
            store.dispatch("refreshAccessTokenIfNeeded");
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

export function callGetResultForTarget(target_id){
    return getFromAPI('/api/v1/get_result_for_target/' + target_id);
}

export function callGetNotificationSettings(user_id, target_id){
    return getFromAPI(`/api/v1/notification_settings/${user_id}/${target_id}`);
}

export function callPostNotificationSettings(user_id, target_id, data){
    return postToAPI(`/api/v1/notification_settings/${user_id}/${target_id}`, data);
}

export function callGetScanResultHistory(){
    return getFromAPI(`/api/v1/scan_result_history`);
}
