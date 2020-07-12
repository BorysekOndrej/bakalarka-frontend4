// based on https://github.com/amcquistan/flask-vuejs-survey/
// MIT

import Vue from 'vue'
import moment from "moment";
import _ from "lodash"

export const EventBus = new Vue()
const target_properties = ['id', 'hostname', 'port', 'ip_address', 'protocol']
const requiredPasswordLen = 6;


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
    if (exp === false){
        return false
    }
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


export function defaultTargetDefinition(){
    return {
        id: null,
        hostname: '',
        port: null,
        ip_address: null,
        protocol: 'HTTPS',
    }
}

export function filterObjToTargetDefinition(obj, merge_with_default=false){
    // https://stackoverflow.com/a/38750895/5769940
    let defaultDef = defaultTargetDefinition()

    const filtered = Object.keys(obj)
        .filter(key => target_properties.includes(key))
        .reduce((answer, key) => {
            answer[key] = obj[key];
            return answer;
        }, {});

    let res = filtered
    if (merge_with_default){
        res = _.extend({}, defaultDef, filtered)
    }
    return res
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
        i++;
    }
    return 5
}


export function testCertificate(){
    return {
        "as_pem": "-----BEGIN CERTIFICATE-----\nMIIE4zCCBImgAwIBAgIQCHfsVTf9BrUvH8uVnuIv8TAKBggqhkjOPQQDAjBvMQsw\nCQYDVQQGEwJVUzELMAkGA1UECBMCQ0ExFjAUBgNVBAcTDVNhbiBGcmFuY2lzY28x\nGTAXBgNVBAoTEENsb3VkRmxhcmUsIEluYy4xIDAeBgNVBAMTF0Nsb3VkRmxhcmUg\nSW5jIEVDQyBDQS0yMB4XDTIwMDEzMDAwMDAwMFoXDTIwMTAwOTEyMDAwMFowbTEL\nMAkGA1UEBhMCVVMxCzAJBgNVBAgTAkNBMRYwFAYDVQQHEw1TYW4gRnJhbmNpc2Nv\nMRkwFwYDVQQKExBDbG91ZGZsYXJlLCBJbmMuMR4wHAYDVQQDExVzbmkuY2xvdWRm\nbGFyZXNzbC5jb20wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASe8WZxKR+W4Rng\nSdm9YK+P21ARfqFz8pdW2kx90f5CWPNIBgjhepWj86YvLFaZnpskqMTGzOKb533R\n1IMTYmtbo4IDBzCCAwMwHwYDVR0jBBgwFoAUPnQtH89FdQR+P8Cihz5MQ4NRE8Yw\nHQYDVR0OBBYEFE0Olba6PZvLYPk7SQ6oAy+FTGirMDoGA1UdEQQzMDGCDCouYm9y\neXNlay5ldYIVc25pLmNsb3VkZmxhcmVzc2wuY29tggpib3J5c2VrLmV1MA4GA1Ud\nDwEB/wQEAwIHgDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIweQYDVR0f\nBHIwcDA2oDSgMoYwaHR0cDovL2NybDMuZGlnaWNlcnQuY29tL0Nsb3VkRmxhcmVJ\nbmNFQ0NDQTIuY3JsMDagNKAyhjBodHRwOi8vY3JsNC5kaWdpY2VydC5jb20vQ2xv\ndWRGbGFyZUluY0VDQ0NBMi5jcmwwTAYDVR0gBEUwQzA3BglghkgBhv1sAQEwKjAo\nBggrBgEFBQcCARYcaHR0cHM6Ly93d3cuZGlnaWNlcnQuY29tL0NQUzAIBgZngQwB\nAgIwdgYIKwYBBQUHAQEEajBoMCQGCCsGAQUFBzABhhhodHRwOi8vb2NzcC5kaWdp\nY2VydC5jb20wQAYIKwYBBQUHMAKGNGh0dHA6Ly9jYWNlcnRzLmRpZ2ljZXJ0LmNv\nbS9DbG91ZEZsYXJlSW5jRUNDQ0EtMi5jcnQwDAYDVR0TAQH/BAIwADCCAQUGCisG\nAQQB1nkCBAIEgfYEgfMA8QB3ALvZ37wfinG1k5Qjl6qSe0c4V5UKq1LoGpCWZDaO\nHtGFAAABb/R9TPQAAAQDAEgwRgIhANeUGX2fm+4zDRgKDyDYLEy948PjPDtXMBA3\nZKGPSUU9AiEAqptnsbnM5KZ2bYBxALjnR3k2hazRDVaM06eUiRetK5AAdgBep3P5\n31bA57U2SH3QSeAyepGaDIShEhKEGHWWgXFFWAAAAW/0fUyZAAAEAwBHMEUCIQCW\nuL4l8MMsaNO9o3kl+lxlNakLReJErx1/3aKNLwP/ZQIgWHbqHI+ZcKBAUukz0FEy\nYGS69lB2B/X0A5gQ+bbmQdMwCgYIKoZIzj0EAwIDSAAwRQIhANJhswKqbY1FSsIy\nWcLAvH3c+j18s92/QukBahyMHaBtAiAdbVfUDrIOoXd6j1NaFXK2jGabwjOl2+Km\nwISZkAe6kA==\n-----END CERTIFICATE-----\n",
        "hpkp_pin": "w3CFyTvRgyoBFemN2XIkI+6fE/dJXG7Rj2YOWpeSv9M=",
        "issuer": "countryName=US, stateOrProvinceName=CA, localityName=San Francisco, organizationName=CloudFlare, Inc., commonName=CloudFlare Inc ECC CA-2",
        "notAfter": "2020-10-09T12:00:00",
        "notBefore": "2020-01-30T00:00:00",
        "publicKey_algorithm": "EllipticCurve",
        "publicKey_curve": "secp256r1",
        "publicKey_exponent": null,
        "publicKey_size": 256,
        "serialNumber": "11256500692832812426706043555859804145",
        "signatureAlgorithm": "sha256",
        "subject": "countryName=US, stateOrProvinceName=CA, localityName=San Francisco, organizationName=Cloudflare, Inc., commonName=sni.cloudflaressl.com",
        "subject_alternative_name_list": "*.borysek.eu,sni.cloudflaressl.com,borysek.eu",
        "thumbprint_sha1": "C6:7E:B7:4B:1D:E4:D3:DB:06:BE:9D:D8:39:51:4F:F1:A4:E8:18:F9",
        "thumbprint_sha256": "19:E6:87:BE:C8:BA:5E:AE:A0:F1:EB:AD:66:98:69:18:AC:8A:BA:6E:DB:86:90:C8:30:74:41:B5:44:F3:0C:09"
    }
}

export function generalLevelColors(){
    return [
        '#639B4B', // A
        '#8AC271', // B
        '#F6B26B', // C
        '#E4834C', // D
        '#DD624E', // E
        '#CC0000', // F
        '#CED2D8', // Not scanned yet
    ]
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function default_notifications_settings(){
    return {
        email: {
            add_new_emails: "",
                force_disable: false,
                force_enabled_ids: [],
                force_disabled_ids: []
        },
        slack: {
            force_disable: false,
                force_enabled_ids: [],
                force_disabled_ids: []
        }
    }
}

export function password_validator_util(password){
    return password ? password.length >= requiredPasswordLen : undefined;
}
