import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

console.log(`%cX-Entu-Version:%c ${import.meta.env.VITE_APP_GIT_SHA}`, 'font-weight:bold;color:green;font-family:monospace', 'color:green;font-family:monospace')
