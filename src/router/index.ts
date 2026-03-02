import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { isAuthenticated } from '../utils/auth'
import Dashboard from '../components/Dashboard.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import SharedNote from '../components/SharedNote.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/app'
  },
  {
    path: '/app',
    name: 'app',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    // 公开分享页面 - 不需要认证
    path: '/share/:shareId',
    name: 'shared-note',
    component: SharedNote,
    props: true,
    meta: { public: true }
  }
]

const router = createRouter({
  // 使用 history 模式，根据环境自动判断 base URL
  // 开发环境：/，生产环境：/notespace/
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()

  // 需要认证的页面
  if (to.meta.requiresAuth && !authenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // 已登录用户访问登录/注册页面，重定向到首页
  else if (to.meta.requiresGuest && authenticated) {
    next({ name: 'app' })
  }
  // 公开页面或其他情况
  else {
    next()
  }
})

export default router
