'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'

// Import app, mixins and routes
import app from './components/app.vue'
import mixins from './mixins'
import routes from './routes'
import store from './store'

// Disable production message
Vue.config.productionTip = false

// Load mixin, router and i18n
Vue.mixin(mixins)
Vue.use(VueRouter)
Vue.use(VueI18n)

// Start Vue app
new Vue({
  el: '#app',
  store,
  data () {
    return {
      openRequests: 0,
      background: 'bg-' + Math.ceil(Math.random() * 12),
      menu: document.body.clientWidth > 768,
      list: true
     }
  },
  render: (h) => h(app),
  router: new VueRouter(routes),
  i18n: new VueI18n({ locale: localStorage.getItem('locale') })
})
