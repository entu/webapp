'use strict'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueMeta from 'vue-meta'

// Import app, mixins and routes
import app from './components/app.vue'
import mixins from './mixins'
import router from './router'
import store from './store'

// Disable production message
Vue.config.productionTip = false

// Load mixin and i18n
Vue.mixin(mixins)
Vue.use(VueI18n)
Vue.use(VueMeta)

// Start Vue app
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(app),
  i18n: new VueI18n({ locale: store.getters.locale })
})
