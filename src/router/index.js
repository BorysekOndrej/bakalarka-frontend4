import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainer = () => import('@/containers/TheContainer')

// Views - Pages
const Page404 = () => import('@/views/pages/Page404')
const Page500 = () => import('@/views/pages/Page500')
const Login = () => import('@/views/pages/Login')
const Register = () => import('@/views/pages/Register')


// Custom
import AddTargetTestModal from "../views/custom/AddTargetTestModal";
import AddTargetPage from "../views/custom/AddTargetPage";
import TargetsTablePage from "../views/custom/TargetsTablePage";
import RegisterCustom from "../views/custom/RegisterCustom";
import LoginCustom from "../views/custom/LoginCustom";
import NotificationSettingsStandalone from "../views/custom/NotificationSettingsStandalone";
import UserSettings from "../views/custom/UserSettings";
import DashboardCustom from "../views/custom/DashboardCustom";
import CertificateViewComponent from "../views/custom/CertificateViewComponent";
import store from "../store";
import SearchCertificateTransparency from "../views/custom/SearchCertificateTransparency";
import CertificatesTable from "../views/custom/CertificatesTable";
import {EventBus} from "../utils";
import AddTargetPageSuperEasyModePage from "../views/custom/AddTargetPageSuperEasyModePage";


Vue.use(Router)



const router = new Router(
{
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
})

router.beforeEach((to, from, next) => {
  store.dispatch("refreshAccessTokenIfNeeded")
      .then(function () {
        let isAuthenticated = store.getters.isAuthenticated();
        if (to.name !== 'Login' && to.name !== 'Register' && !isAuthenticated){
          next({ name: 'Login' })
        }else{
          next()
        }
      })
      .catch(function () {
        next({ name: 'Login' })
      })
})

export default router;

function configRoutes () {
  return [
    {
      path: '/',
      redirect: '/dashboard',
      name: 'Home',
      component: TheContainer,
      children: [
        {
          path: 'addTarget/:hostnames?',
          name: 'Add Target',
          component: AddTargetPage
        },
        {
          path: 'addTargetSuperEasyMode/:hostnames?',
          name: 'Add Target - Super Easy Mode',
          component: AddTargetPageSuperEasyModePage
        },
        {
          path: 'addTargetTestModal',
          name: 'Add Target Test Modal',
          component: AddTargetTestModal
        },
        {
          path: 'listTargets/:target_id?',
          name: 'List of targets',
          component: TargetsTablePage
        },
        {
          path: 'login',
          name: 'Login',
          component: LoginCustom
        },
        {
          path: 'register',
          name: 'Register',
          component: RegisterCustom
        },
        {
          path: 'profile',
          name: 'Profile',
          component: UserSettings
        },
        {
          path: 'notificationSettingsStandalone',
          name: 'NotificationSettingsStandalone',
          component: NotificationSettingsStandalone
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: DashboardCustom
        },
        {
          path: 'singlecertificate',
          name: 'Single Certificate',
          component: CertificateViewComponent
        },
        {
          path: 'certificateTransparency',
          name: 'Certificate Transparency',
          component: SearchCertificateTransparency
        },
        {
          path: 'certificatesTable',
          name: 'Certificates Table',
          component: CertificatesTable
        },
      ]
    },
    {
      path: '/pages',
      redirect: '/pages/404',
      name: 'Pages',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        {
          path: '404',
          name: 'Page404',
          component: Page404
        },
        {
          path: '500',
          name: 'Page500',
          component: Page500
        },
      ]
    }
  ]
}

