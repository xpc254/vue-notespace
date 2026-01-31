<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface ShareModalProps {
  noteId: number
  noteTitle: string
  isShared: boolean
  shareUrl?: string
}

const props = defineProps<ShareModalProps>()

const emit = defineEmits<{
  close: []
  share: []
  unshare: []
}>()

const isLoading = ref(false)
const copied = ref(false)
const currentShareUrl = ref(props.shareUrl || '')

// 监听 props 变化 - 当父组件更新状态后重置加载
watch([() => props.isShared, () => props.shareUrl], ([isShared, shareUrl]) => {
  currentShareUrl.value = shareUrl || ''
  // 当状态变化时重置加载状态
  isLoading.value = false
}, { deep: true })

// 超时保护：如果 5 秒后状态还没变化，重置加载状态
let loadingTimeout: ReturnType<typeof setTimeout> | null = null

watch(isLoading, (loading) => {
  if (loading) {
    loadingTimeout = setTimeout(() => {
      isLoading.value = false
    }, 5000)
  } else if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
})

const shareBaseUrl = computed(() => {
  if (import.meta.env.DEV) {
    return 'http://localhost:5173'
  }
  return window.location.origin
})

const fullShareUrl = computed(() => {
  if (!currentShareUrl.value) return ''
  // 如果已经是完整URL，直接返回
  if (currentShareUrl.value.startsWith('http')) {
    return currentShareUrl.value
  }
  // 否则拼接基础URL
  return `${shareBaseUrl.value}${currentShareUrl.value}`
})

const handleToggleShare = async () => {
  if (isLoading.value) return

  isLoading.value = true

  if (props.isShared) {
    // 取消分享 - 由父组件处理 API 调用
    emit('unshare')
  } else {
    // 开启分享 - 由父组件处理 API 调用
    emit('share')
  }
}

const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(fullShareUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const handleClose = () => {
  if (!isLoading.value) {
    emit('close')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-slate-100">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-slate-800">分享笔记</h3>
            <p class="text-sm text-slate-500 mt-1 line-clamp-1">{{ noteTitle || '无标题笔记' }}</p>
          </div>
          <button
            @click="handleClose"
            :disabled="isLoading"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
          >
            <span class="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Share Toggle -->
        <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div class="flex items-center gap-3">
            <div :class="[
              'size-10 rounded-full flex items-center justify-center',
              props.isShared ? 'bg-green-100' : 'bg-slate-200'
            ]">
              <span class="material-symbols-outlined" :class="props.isShared ? 'text-green-600' : 'text-slate-400'">
                {{ props.isShared ? 'check' : 'link' }}
              </span>
            </div>
            <div>
              <p class="font-semibold text-slate-800">{{ props.isShared ? '已开启分享' : '开启分享' }}</p>
              <p class="text-sm text-slate-500">{{ props.isShared ? '任何人都可以通过链接查看' : '生成公开链接供他人查看' }}</p>
            </div>
          </div>
          <button
            @click="handleToggleShare"
            :disabled="isLoading"
            :class="[
              'relative h-8 w-15 rounded-full transition-all duration-300 flex-shrink-0 shadow-inner',
              props.isShared ? 'bg-green-500' : 'bg-slate-300',
              isLoading && 'opacity-50 cursor-wait'
            ]"
            style="width: 60px;"
          >
            <span
              :class="[
                'absolute top-1 left-1 size-6 bg-white rounded-full shadow-md transition-all duration-300',
                props.isShared ? 'translate-x-7' : 'translate-x-0'
              ]"
            ></span>
          </button>
        </div>

        <!-- Share URL (when shared) -->
        <div v-if="props.isShared && currentShareUrl" class="space-y-3">
          <p class="text-sm font-medium text-slate-700">分享链接</p>
          <div class="flex gap-2">
            <div class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 truncate font-mono">
              {{ fullShareUrl }}
            </div>
            <button
              @click="handleCopyLink"
              :class="[
                'px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2',
                copied ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-lg">
                {{ copied ? 'check' : 'content_copy' }}
              </span>
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>
          <p class="text-xs text-slate-400 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">info</span>
            分享后，任何拥有此链接的人都可以查看此笔记
          </p>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading && !props.isShared" class="flex items-center justify-center py-4">
          <span class="material-symbols-outlined animate-spin text-slate-400 text-2xl">sync</span>
          <span class="ml-2 text-sm text-slate-500">正在生成分享链接...</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-slate-100 bg-slate-50">
        <button
          @click="handleClose"
          :disabled="isLoading"
          class="w-full py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? '处理中...' : '关闭' }}
        </button>
      </div>
    </div>
  </div>
</template>
