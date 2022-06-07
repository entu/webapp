import { createRouter, createWebHistory } from 'vue-router'

// import store from '@/store'

const routes = [
  {
    name: 'home',
    path: '/',
    component: () => import('@/views/HomePage.vue')
  },
  {
    name: 'auth',
    path: '/auth/:id?',
    component: () => import('@/views/AuthPage.vue')
  },
  {
    name: 'account',
    path: '/:account',
    component: () => import('@/views/AccountLayout.vue'),
    children: [
      {
        name: 'stats',
        path: '',
        component: () => import('@/views/AccountStats.vue')
      },
      {
        name: 'entity',
        path: ':entity',
        component: () => import('@/views/AccountEntity.vue')
      }
    ]
  }
  // {
  //   name: 'rights',
  //   path: '/:account/:entity/rights',
  //   components: {
  //     default: entityRights,
  //     menu: accountMenu,
  //     list: accountList
  //   }
  // },
  // {
  //   name: 'edit',
  //   path: '/:account/:entity/edit',
  //   components: {
  //     default: entityEdit,
  //     menu: accountMenu,
  //     list: accountList
  //   }
  // },
  // {
  //   name: 'add',
  //   path: '/:account/:parent/add/:type',
  //   components: {
  //     default: entityEdit,
  //     menu: accountMenu,
  //     list: accountList
  //   }
  // },
  // {
  //   name: 'file',
  //   path: '/:account/file/:id',
  //   component: file
  // }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// router.beforeEach((to, from, next) => {
//   if (to.name !== 'Login' && !store.getters.isAuthenticated) {
//     next({ name: 'Login' })
//   } else {
//     next()
//   }
// })

export default router
