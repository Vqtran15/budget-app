import { createRouter, createWebHashHistory } from 'vue-router'
import UploadPage from '../pages/UploadPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/upload' },
    { path: '/upload', component: UploadPage },
    { path: '/dashboard', component: DashboardPage },
  ],
})

export default router
