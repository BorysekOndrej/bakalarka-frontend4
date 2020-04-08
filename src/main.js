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
const isProduction = false; // || process.env.NODE_ENV === 'production'; // todo: fix env
const options = {
  isEnabled: true,
  logLevel: isProduction ? 'error' : 'debug',
  stringifyArguments: false,
  showLogLevel: true,
  showMethodName: true,
  separator: '|',
  showConsoleColors: true
};
Vue.use(VueLogger, options);

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
