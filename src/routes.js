import info from './components/info/info.vue'
import auth from './components/auth/auth.vue'
import accountMenu from './components/account/menu/menu.vue'
import accountList from './components/account/list/list.vue'
import accountInfo from './components/account/info/info.vue'
import entityView from './components/account/entity/entity.vue'
import file from './components/file/file.vue'

let route = {}

if (['entu.app', 'localhost'].includes(window.location.hostname)) {
  route = {
    mode: 'history',
    routes: [
      {
        name: 'info',
        path: '/',
        component: info
      },
      {
        name: 'auth',
        path: '/auth/:id?',
        component: auth
      },
      {
        name: 'account',
        path: '/:account',
        components: {
          default: accountInfo,
          menu: accountMenu,
        }
      },
      {
        name: 'list',
        path: '/:account/_',
        components: {
          default: entityView,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'entity',
        path: '/:account/:entity',
        components: {
          default: entityView,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'file',
        path: '/:account/file/:id',
        component: file
      }
    ]
  }
} else {
  route = {
    mode: 'history',
    routes: [
      {
        name: 'auth',
        path: '/auth/:id?',
        component: auth
      },
      {
        name: 'account',
        path: '/',
        components: {
          default: accountInfo,
          menu: accountMenu,
        }
      },
      {
        name: 'list',
        path: '/_',
        components: {
          default: entityView,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'entity',
        path: '/:entity',
        components: {
          default: entityView,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'file',
        path: '/file/:id',
        component: file
      }
    ]
  }
}

export default route
