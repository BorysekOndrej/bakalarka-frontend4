// based on https://github.com/amcquistan/flask-vuejs-survey/
// MIT

import Vue from 'vue'

export const EventBus = new Vue()
const target_properties = ['hostname', 'port', 'ip_address', 'protocol']

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