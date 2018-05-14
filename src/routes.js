import info from './components/info/info.vue'
import auth from './components/auth/auth.vue'
import account from './components/account/account.vue'
import accountInfo from './components/account/info/info.vue'
import entityView from './components/account/entity/entity.vue'

export default {
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
}