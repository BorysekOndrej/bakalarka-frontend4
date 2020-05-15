// based on https://github.com/amcquistan/flask-vuejs-survey/
// MIT

import Vue from 'vue'
import moment from "moment";

export const EventBus = new Vue()
const target_properties = ['id', 'hostname', 'port', 'ip_address', 'protocol']

export function jwtValidUntil(jwt){
    if (!jwt || jwt.split('.').length < 3) {
        return false
    }
    const data = JSON.parse(atob(jwt.split('.')[1]))
    const exp = new Date(data.exp * 1000) // JS deals with dates in milliseconds since epoch
    return exp;
}

export function isValidJwt(jwt) {
    console.log(`Checking validity of jwt ${jwt}`)
    const exp = jwtValidUntil(jwt)
    console.log(`Jwt expires on ${exp}`)
    const now = new Date()
    return now < exp
}


export function makeColumnsSortable(all_column_names, except_column_names){
    return all_column_names.map(x => {
        let obj = {}
        obj["key"] = x
        for (let i = 0; i < all_column_names.length; i++) {
            obj["sortable"] = !except_column_names.includes(x)
        }
        return obj
    })
}


export function filterObjToTargetDefinition(obj){
    // https://stackoverflow.com/a/38750895/5769940
    const filtered = Object.keys(obj)
        .filter(key => target_properties.includes(key))
        .reduce((answer, key) => {
            answer[key] = obj[key];
            return answer;
        }, {});

    return filtered
}


export function expiresToGradeIndex(expires_string, expiration_levels) {
    if (expires_string === "Not scanned yet"){
        return 6;
    }
    console.log(expires_string)
    let expires_moment = moment(expires_string, moment.ISO_8601)
    let today_moment = moment()
    let day_diff = expires_moment.diff(today_moment, 'days')
    // console.log(expires_moment.format(), today_moment.format(), day_diff)
    let i = 0
    for (const cur_level of expiration_levels){
        if (day_diff > cur_level){
            return i
        }
    }
    return 5
}
