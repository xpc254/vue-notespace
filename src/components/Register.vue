<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api'
import { setToken, setRefreshToken, setUserInfo } from '../utils/auth'

const router = useRouter()

// 表单数据
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// 加载和错误状态
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async (e: Event) => {
  e.preventDefault()

  // 简单验证
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = '请填写所有字段'
    return
  }

  // 用户名验证
  if (username.value.length < 2) {
    errorMessage.value = '用户名至少需要2个字符'
    return
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = '请输入有效的邮箱地址'
    return
  }

  // 密码验证
  if (password.value.length < 6) {
    errorMessage.value = '密码至少需要6个字符'
    return
  }

  // 确认密码验证
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    // 调用注册接口
    const response = await authApi.register(username.value, email.value, password.value)

    // 存储 Token 和用户信息
    setToken(response.token)
    setRefreshToken(response.refreshToken)
    setUserInfo({
      userId: response.userId,
      username: response.username,
      email: response.email,
      avatar: response.avatar
    })

    // 跳转到首页
    router.push('/app')
  } catch (error: any) {
    console.error('注册失败:', error)
    errorMessage.value = error.response?.data?.message || error.message || '注册失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const switchToLogin = () => {
  router.push('/login')
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
          <h1 class="text-3xl font-black tracking-tight text-slate-800">创建账号</h1>
          <p class="mt-4 text-slate-500 font-medium">加入 NoteSpace，开始您的笔记之旅。</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <p class="text-sm text-red-600 text-center">{{ errorMessage }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 ml-1">用户名</label>
            <div class="relative group">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">person</span>
              <input
                v-model="username"
                required
                :disabled="isLoading"
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all placeholder:text-slate-300 border focus:bg-white disabled:opacity-50"
                placeholder="请输入用户名"
                type="text"
                minlength="2"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 ml-1">邮箱</label>
            <div class="relative group">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">alternate_email</span>
              <input
                v-model="email"
                required
                :disabled="isLoading"
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all placeholder:text-slate-300 border focus:bg-white disabled:opacity-50"
                placeholder="example@notespace.com"
                type="email"
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
                placeholder="至少6个字符"
                type="password"
                minlength="6"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 ml-1">确认密码</label>
            <div class="relative group">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">lock</span>
              <input
                v-model="confirmPassword"
                required
                :disabled="isLoading"
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all placeholder:text-slate-300 border focus:bg-white disabled:opacity-50"
                placeholder="再次输入密码"
                type="password"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="isLoading" class="material-symbols-outlined animate-spin">refresh</span>
            {{ isLoading ? '注册中...' : '立即注册' }}
          </button>
        </form>

        <!-- Switch to Login -->
        <div class="mt-10">
          <p class="text-center text-sm text-slate-400 font-medium">
            已有账号？ <a @click="switchToLogin" class="text-accent font-bold hover:underline cursor-pointer">立即登录</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
