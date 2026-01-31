<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { clearAuth } from './utils/auth'

const router = useRouter()

const showTokenExpiredModal = ref(false)

// Check authentication status on mount
onMounted(() => {
  // 监听token过期事件
  const handleTokenExpired = () => {
    showTokenExpiredModal.value = true
  }

  window.addEventListener('token-expired', handleTokenExpired)
})

onUnmounted(() => {
  window.removeEventListener('token-expired', () => {})
})

const handleTokenExpiredConfirm = () => {
  showTokenExpiredModal.value = false
  clearAuth()
  router.push('/login')
}

const handleLogout = () => {
  clearAuth()
  router.push('/login')
}

// Provide logout function to child components via provide/inject
// For simplicity, we'll use a global event approach or the router
</script>

<template>
  <div class="h-screen w-screen overflow-hidden font-sans">
    <!-- Token Expired Modal -->
    <div v-if="showTokenExpiredModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div class="text-center">
          <div class="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl text-red-600">warning</span>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">登录已过期</h3>
          <p class="text-slate-600 mb-6">您的登录已过期，请重新登录以继续使用</p>
          <button
            @click="handleTokenExpiredConfirm"
            class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            重新登录
          </button>
        </div>
      </div>
    </div>

    <!-- Router View -->
    <router-view @logout="handleLogout" />
  </div>
</template>
