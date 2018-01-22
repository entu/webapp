import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

// Import bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'


// Import app and components
import app from './components/app.vue'
import info from './components/info.vue'
import auth from './components/auth.vue'
import entity from './components/entity.vue'
import entityInfo from './components/entity-info.vue'
import entityList from './components/entity-list.vue'


// Use packages
Vue.use(VueResource)
Vue.use(VueRouter)


// Register routes
const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', component: info },
        { name: 'auth', path: '/auth', component: auth },
        { path: '/auth/:id', component: auth },
        { path: '/:account', component: entity, children: [
            { name: 'menu', path: '', component: entityInfo },
            { name: 'list', path: ':query', component: entityList }
        ] }
    ]
})


new Vue({
    el: '#app',
    render: h => h(app),
    router: router
})
