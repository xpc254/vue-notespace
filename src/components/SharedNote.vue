<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()

// 获取 shareId from URL
const shareId = computed(() => route.params.shareId as string || route.query.shareId as string)

// 状态
const note = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const API_BASE = 'http://localhost:8080'

// 加载分享的笔记
const loadSharedNote = async () => {
  if (!shareId.value) {
    error.value = '无效的分享链接'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const response = await axios.get(`${API_BASE}/api/note/shared/${shareId.value}`, {
      // 公开访问不需要token
    })

    if (response.data.code === 200) {
      note.value = response.data.data
    } else {
      error.value = response.data.message || '加载失败'
    }
  } catch (err: any) {
    console.error('Failed to load shared note:', err)
    if (err.response?.status === 404) {
      error.value = '分享链接不存在或已失效'
    } else if (err.response?.status === 403) {
      error.value = '此笔记已停止分享'
    } else {
      error.value = '加载失败，请稍后重试'
    }
  } finally {
    isLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadSharedNote()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="size-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <span class="material-symbols-outlined text-xl">edit_note</span>
          </div>
          <h1 class="text-xl font-black tracking-tight text-slate-800">NoteSpace</h1>
        </div>
        <a
          href="/"
          class="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-lg">home</span>
          返回首页
        </a>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-6 py-12">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="size-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-500">加载中...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="size-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="material-symbols-outlined text-4xl text-red-600">error</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">无法加载笔记</h2>
        <p class="text-slate-500 mb-6">{{ error }}</p>
        <a
          href="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <span class="material-symbols-outlined">home</span>
          返回首页
        </a>
      </div>

      <!-- Note Content -->
      <article v-else-if="note" class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <!-- Note Header -->
        <div class="p-8 border-b border-slate-100">
          <div class="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <span class="material-symbols-outlined text-base">calendar_today</span>
            <span>{{ formatDate(note.updateTime || note.createTime) }}</span>
          </div>

          <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {{ note.title || '无标题笔记' }}
          </h1>

          <!-- Tags -->
          <div v-if="note.tags && note.tags.length > 0" class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="tag in note.tags"
              :key="tag"
              class="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Note Body - Render HTML directly -->
        <div class="p-8">
          <div
            class="note-content"
            v-html="note.content"
          ></div>

          <!-- Empty State -->
          <div v-if="!note.content" class="text-center py-12">
            <div class="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-3xl text-slate-300">description</span>
            </div>
            <p class="text-slate-400">这篇笔记还没有内容</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-100">
          <div class="flex items-center justify-between text-sm text-slate-500">
            <p>通过 NoteSpace 分享</p>
            <p>分享于 {{ formatDate(new Date().toISOString()) }}</p>
          </div>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="text-center py-8 text-sm text-slate-400">
      <p>Powered by NoteSpace - 让笔记记录更简单</p>
    </footer>
  </div>
</template>

<style scoped>
/* Note content styles for HTML rendering */
.note-content {
  font-size: 16px;
  line-height: 1.8;
  color: #334155;
}

.note-content :deep(h1),
.note-content :deep(h2),
.note-content :deep(h3),
.note-content :deep(h4),
.note-content :deep(h5),
.note-content :deep(h6) {
  color: #1e293b;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 16px;
}

.note-content :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.note-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.note-content :deep(h3) {
  font-size: 1.25em;
}

.note-content :deep(p) {
  margin-bottom: 12px;
  line-height: 1.8;
}

/* Quill 对齐样式支持 */
.note-content :deep(.ql-align-left) {
  text-align: left;
}

.note-content :deep(.ql-align-center) {
  text-align: center;
}

.note-content :deep(.ql-align-right) {
  text-align: right;
}

.note-content :deep(.ql-align-justify) {
  text-align: justify;
}

/* 确保继承文本对齐方式（内联样式） */
.note-content :deep(p[style*="text-align"]) {
  text-align: inherit !important;
}

.note-content :deep(h1[style*="text-align"]),
.note-content :deep(h2[style*="text-align"]),
.note-content :deep(h3[style*="text-align"]),
.note-content :deep(h4[style*="text-align"]),
.note-content :deep(h5[style*="text-align"]),
.note-content :deep(h6[style*="text-align"]) {
  text-align: inherit !important;
}

.note-content :deep(code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  color: #e11d48;
}

.note-content :deep(pre) {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.note-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #334155;
}

.note-content :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 16px;
  color: #64748b;
  margin: 16px 0;
  font-style: italic;
}

.note-content :deep(ul),
.note-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.note-content :deep(li) {
  margin: 6px 0;
}

.note-content :deep(a) {
  color: #3b82f6;
  text-decoration: none;
}

.note-content :deep(a:hover) {
  text-decoration: underline;
}

.note-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.note-content :deep(th),
.note-content :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
}

.note-content :deep(th) {
  background: #f8fafc;
  font-weight: 600;
}

.note-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.note-content :deep(strong) {
  font-weight: 700;
  color: #0f172a;
}

.note-content :deep(em) {
  font-style: italic;
}
</style>
