import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

// Import bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'


// Import app and components
import app from './components/app.vue'
import info from './components/info/info.vue'
import auth from './components/auth/auth.vue'
import entity from './components/entity/entity.vue'


// Use packages
Vue.use(VueResource)
Vue.use(VueRouter)


// Register routes
const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', component: info },
        { path: '/auth/:id', component: auth },
        { path: '/entity', component: entity }
    ]
})


new Vue({
    el: '#app',
    render: h => h(app),
    router: router
})
