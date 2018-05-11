import Vue from 'vue'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'

// Import bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'

// Import app and components
import app from './components/app.vue'
import info from './components/info/info.vue'
import auth from './components/auth/auth.vue'
import account from './components/account/account.vue'
import accountInfo from './components/account/info/info.vue'
import entityView from './components/account/entity/entity.vue'

// Mixins
import mixins from './mixins'
Vue.mixin(mixins)

// Use packages
Vue.use(VueRouter)
Vue.use(VueI18n)

// Register routes
const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: info
    },
    {
      name: 'auth',
      path: '/auth/:id?',
      component: auth
    },
    {
      path: '/:account',
      component: account,
      children: [
        {
          name: 'account',
          path: '',
          component: accountInfo
        },
        {
          name: 'view',
          path: ':entity',
          component: entityView
        }
      ]
    }
  ]
})

// Set default locale
if (!localStorage.getItem('locale')) {
  localStorage.setItem('locale' ,'et')
}
const i18n = new VueI18n({
  locale: localStorage.getItem('locale')
})

new Vue({
  el: '#app',
  render: (h) => h(app),
  router: router,
  i18n: i18n
})
