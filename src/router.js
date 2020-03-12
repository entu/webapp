'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'

import info from './components/info/info.vue'
import auth from './components/auth/auth.vue'
import accountMenu from './components/account/menu/menu.vue'
import accountList from './components/account/list/list.vue'
import accountInfo from './components/account/info/info.vue'
import entityView from './components/account/entity/view/view.vue'
import entityRights from './components/account/entity/rights/rights.vue'
import entityEdit from './components/account/entity/edit/edit.vue'
import file from './components/file/file.vue'

Vue.use(VueRouter)

let route = {}

if (['entu.app', 'localhost'].includes(window.location.hostname)) {
  route = {
    mode: 'history',
    routes: [
      {
        name: 'info',
        path: '/',
        alias: '/info',
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
        name: 'entity',
        path: '/:account/:entity',
        components: {
          default: entityView,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'rights',
        path: '/:account/:entity/rights',
        components: {
          default: entityRights,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'edit',
        path: '/:account/:entity/edit',
        components: {
          default: entityEdit,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'add',
        path: '/:account/:parent/add/:type',
        components: {
          default: entityEdit,
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
        name: 'entity',
        path: '/:entity',
        components: {
          default: entityView,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'rights',
        path: '/:entity/rights',
        components: {
          default: entityRights,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'edit',
        path: '/:entity/edit',
        components: {
          default: entityEdit,
          menu: accountMenu,
          list: accountList,
        }
      },
      {
        name: 'add',
        path: '/:parent/add/:type',
        components: {
          default: entityEdit,
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

export default new VueRouter(route)
