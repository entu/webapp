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
  render: h => h(app),
  i18n: new VueI18n({ locale: store.getters.locale })
})
