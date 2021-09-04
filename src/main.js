import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import axios from "axios";

axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true

const app = createApp(App).use(router).use(ElementPlus)
app.config.globalProperties.$http = axios
app.mount('#app')
