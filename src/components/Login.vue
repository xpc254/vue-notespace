<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '../api'
import { setToken, setRefreshToken, setUserInfo } from '../utils/auth'

const router = useRouter()
const route = useRoute()

// 表单数据
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

// 加载和错误状态
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async (e: Event) => {
  e.preventDefault()

  // 简单验证
  if (!email.value || !password.value) {
    errorMessage.value = '请输入邮箱和密码'
    return
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = '请输入有效的邮箱地址'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    // 调用登录接口
    const response = await authApi.login(email.value, password.value)

    // 存储 Token 和用户信息
    setToken(response.token)
    setRefreshToken(response.refreshToken)
    setUserInfo({
      userId: response.userId,
      username: response.username,
      email: response.email,
      avatar: response.avatar
    })

    // 跳转到原来想访问的页面，或者首页
    const redirect = (route.query.redirect as string) || '/app'
    router.push(redirect)
  } catch (error: any) {
    console.error('登录失败:', error)
    errorMessage.value = error.response?.data?.message || error.message || '登录失败，请检查邮箱和密码'
  } finally {
    isLoading.value = false
  }
}

const switchToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative p-4 bg-slate-50">
    <!-- Background decoration -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e2e8f0" stroke-width="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="80%" cy="20%" r="300" fill="rgba(37, 99, 235, 0.05)" />
        <circle cx="20%" cy="80%" r="400" fill="rgba(30, 41, 59, 0.05)" />
      </svg>
    </div>

    <div class="relative z-10 w-full max-w-[480px]">
      <div class="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] p-8 md:p-12">
        <!-- Logo Area -->
        <div class="flex flex-col items-center mb-10">
          <div class="size-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl mb-4">
            <span class="material-symbols-outlined text-2xl">edit_note</span>
          </div>
          <h1 class="text-3xl font-black tracking-tight text-slate-800">NoteSpace</h1>
          <p class="mt-4 text-slate-500 font-medium">记录、思考、整理，一切都在此处。</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <p class="text-sm text-red-600 text-center">{{ errorMessage }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 ml-1">邮箱 / 手机号</label>
            <div class="relative group">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">alternate_email</span>
              <input
                v-model="email"
                required
                :disabled="isLoading"
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all placeholder:text-slate-300 border focus:bg-white disabled:opacity-50"
                placeholder="example@notespace.com"
                type="text"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 ml-1">密码</label>
            <div class="relative group">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">lock</span>
              <input
                v-model="password"
                required
                :disabled="isLoading"
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all placeholder:text-slate-300 border focus:bg-white disabled:opacity-50"
                placeholder="请输入您的密码"
                type="password"
              />
            </div>
          </div>

          <div class="flex items-center justify-between px-1">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input v-model="rememberMe" :disabled="isLoading" class="size-4 rounded border-slate-300 text-accent focus:ring-accent/20" type="checkbox" />
              <span class="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">记住我</span>
            </label>
            <a class="text-sm font-semibold text-accent hover:text-blue-700 transition-colors" href="#">忘记密码？</a>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="isLoading" class="material-symbols-outlined animate-spin">refresh</span>
            {{ isLoading ? '登录中...' : '立即登录' }}
          </button>
        </form>

        <!-- Social Logins -->
        <div class="mt-10">
          <div class="flex items-center gap-4 mb-8">
            <div class="h-px bg-slate-100 flex-1"></div>
            <span class="text-xs text-slate-400 font-bold uppercase tracking-widest">第三方登录</span>
            <div class="h-px bg-slate-100 flex-1"></div>
          </div>
          <div class="flex justify-center gap-6">
            <button class="size-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:border-slate-200 transition-all group">
              <svg class="size-6 text-slate-400 group-hover:text-[#07C160] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.5,12A1.5,1.5 0 0,1 7,10.5A1.5,1.5 0 0,1 8.5,9A1.5,1.5 0 0,1 10,10.5A1.5,1.5 0 0,1 8.5,12M15.5,12A1.5,1.5 0 0,1 14,10.5A1.5,1.5 0 0,1 15.5,9A1.5,1.5 0 0,1 17,10.5A1.5,1.5 0 0,1 15.5,12M12,2A10,10 0 0,0 2,12C2,14.42 2.85,16.64 4.25,18.39L3,22L6.8,20.67C8.36,21.5 10.13,22 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"></path>
              </svg>
            </button>
            <button class="size-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:border-slate-200 transition-all group">
              <svg class="size-6 text-slate-400 group-hover:text-[#181717] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.49,20.14 9.49,19.31C6.71,19.91 6.13,17.97 6.13,17.97C5.67,16.81 5.01,16.5 5.01,16.5C4.1,15.88 5.08,15.9 5.08,15.9C6.08,15.97 6.61,16.93 6.61,16.93C7.5,18.45 8.94,18 9.5,17.77C9.59,17.13 9.85,16.69 10.13,16.44C7.91,16.19 5.58,15.33 5.58,11.5C5.58,10.41 5.97,9.51 6.61,8.8C6.51,8.55 6.17,7.53 6.71,6.17C6.71,6.17 7.55,5.91 9.46,7.2C10.26,6.98 11.12,6.87 11.97,6.87C12.83,6.87 13.68,6.98 14.48,7.2C16.39,5.91 17.23,6.17 17.23,6.17C17.77,7.53 17.43,8.55 17.33,8.8C17.97,9.51 18.36,10.41 18.36,11.5C18.36,15.34 16.03,16.19 13.8,16.44C14.16,16.75 14.48,17.36 14.48,18.3C14.48,19.64 14.47,20.72 14.47,21.05C14.47,21.32 14.63,21.64 15.13,21.54C19.1,20.2 22,16.43 22,12A10,10 0 0,0 12,2Z"></path>
              </svg>
            </button>
          </div>
          <p class="mt-10 text-center text-sm text-slate-400 font-medium">
            还没有账号？ <a @click="switchToRegister" class="text-accent font-bold hover:underline cursor-pointer">立即注册</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
