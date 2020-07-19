import 'core-js/stable'
import Vue from 'vue'
import App from './App'
import router from './router'
import CoreuiVue from '@coreui/vue'
import { iconsSet as icons } from './assets/icons/icons.js'
import store from './store'
import VueLogger from 'vuejs-logger';
import Vuelidate from 'vuelidate'

Vue.config.performance = true
Vue.use(CoreuiVue)
Vue.use(Vuelidate)
Vue.prototype.$log = console.log.bind(console)

// logging
const isProduction = process.env.NODE_ENV === 'production';
const options = {
  isEnabled: true,
  logLevel: 'debug', //isProduction ? 'error' : 'debug',
  stringifyArguments: false,
  showLogLevel: true,
  showMethodName: true,
  separator: '|',
  showConsoleColors: true
};
Vue.use(VueLogger, options);

Vue.mixin({
  data: function() {
    return {
      get displayDebugInUI() {
        if (isProduction){
          return false;
        }
        return true; // this line is changed manually when debugging UI. However it should never affect Production.
      }
    }
  }
})


// https://vuejs.org/v2/guide/filters.html
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

new Vue({
  el: '#app',
  router,
  store,
  icons,
  template: '<App/>',
  components: {
    App
  },
  mode:'history'
})
