import Vue from 'vue'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'

// Import app, mixins and routes
import app from './components/app.vue'
import mixins from './mixins'
import routes from './routes'

// Load mixin, router and i18n
Vue.mixin(mixins)
Vue.use(VueRouter)
Vue.use(VueI18n)

// Set default locale
if (!localStorage.getItem('locale')) { localStorage.setItem('locale' ,'et') }

// Start Vue app
new Vue({
  el: '#app',
  data () {
    return {
      openRequests: 0,
      background: 'bg-' + Math.ceil(Math.random() * 12),
      menu: true
    }
  },
  render: (h) => h(app),
  router: new VueRouter(routes),
  i18n: new VueI18n({ locale: localStorage.getItem('locale') })
})
