import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './routing.js' // ✅ adjust this if it's not exactly named "routing.js"

const app = createApp(App)

app.use(createPinia()) // ✅ for global Pinia store
app.use(router)        // ✅ attach Vue Router

app.mount('#app')      // ✅ mount to DOM
