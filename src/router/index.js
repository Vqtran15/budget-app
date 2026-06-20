import { createRouter, createWebHashHistory } from 'vue-router'
import UploadPage       from '../pages/UploadPage.vue'
import DashboardPage    from '../pages/DashboardPage.vue'
import TransactionsPage from '../pages/TransactionsPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',              redirect: '/upload' },
    { path: '/upload',        component: UploadPage },
    { path: '/dashboard',     component: DashboardPage },
    { path: '/transactions',  component: TransactionsPage },
  ],
})

export default router
