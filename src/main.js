'use strict'

import Vue from 'vue'
import VueI18n from 'vue-i18n'

// Import app, mixins and routes
import app from './components/app.vue'
import mixins from './mixins'
import router from './router'
import store from './store'

// Disable production message
Vue.config.productionTip = false

// Load mixin, router and i18n
Vue.mixin(mixins)
Vue.use(VueI18n)

// Start Vue app
new Vue({
  el: '#app',
  router,
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
  i18n: new VueI18n({ locale: localStorage.getItem('locale') })
})
