<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Note } from '../types'
import { getUserInfo } from '../utils/auth'
import ShareModal from './ShareModal.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

interface EditorProps {
  note: Note
  allTags: string[]
}

const props = defineProps<EditorProps>()

const emit = defineEmits<{
  update: [note: Note]
  togglePin: []
  delete: []
  logout: []
  back: []
  share: []
  unshare: []
}>()

// Quill 编辑器配置
const editorOptions = {
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  },
  placeholder: '开始记录你的奇思妙想...',
  theme: 'snow'
}

// 本地状态管理编辑内容
const title = ref(props.note.title)
const content = ref(props.note.content)
const tags = ref<string[]>(props.note.tags || [])
const newTag = ref('')
const showUserMenu = ref(false)
const showTagMenu = ref(false)
const showShareModal = ref(false)
const highlightedIndex = ref(0)
const isSaving = ref(false)
const shareUrl = ref('')

const tagInputRef = ref<HTMLInputElement | null>(null)
const tagMenuRef = ref<HTMLDivElement | null>(null)

// 防抖相关
let updateTimer: number | null = null
const DEBOUNCE_DELAY = 2000 // 2秒防抖延迟

// 切换笔记时，重置所有本地状态
watch(() => props.note.id, () => {
  title.value = props.note.title
  content.value = props.note.content
  tags.value = props.note.tags || []
  newTag.value = ''
  showTagMenu.value = false
})

// 同步外部标签更新
watch(() => props.note.tags, (newTags) => {
  tags.value = newTags || []
})

// 同步外部分享URL更新
watch(() => props.note.shareUrl, (newShareUrl) => {
  if (newShareUrl) {
    shareUrl.value = newShareUrl
  } else {
    shareUrl.value = ''
  }
})

// 防抖的更新函数
const debouncedUpdate = (updatedFields: Partial<Note>) => {
  // 清除之前的定时器
  if (updateTimer !== null) {
    clearTimeout(updateTimer)
  }

  // 标签更改立即保存，不使用防抖
  if (updatedFields.tags !== undefined) {
    emit('update', {
      ...props.note,
      title: updatedFields.title ?? title.value,
      content: updatedFields.content ?? content.value,
      tags: updatedFields.tags,
      updatedAt: '刚刚'
    })
    isSaving.value = false
    return
  }

  // 标题和内容使用防抖
  isSaving.value = true

  // 设置新的定时器
  updateTimer = window.setTimeout(() => {
    emit('update', {
      ...props.note,
      title: updatedFields.title ?? title.value,
      content: updatedFields.content ?? content.value,
      tags: updatedFields.tags ?? tags.value,
      updatedAt: '刚刚'
    })
    isSaving.value = false
    updateTimer = null
  }, DEBOUNCE_DELAY)
}

// 立即保存的函数（用于组件卸载等场景）
const immediateUpdate = () => {
  if (updateTimer !== null) {
    clearTimeout(updateTimer)
    updateTimer = null
  }
  emit('update', {
    ...props.note,
    title: title.value,
    content: content.value,
    tags: tags.value,
    updatedAt: '刚刚'
  })
  isSaving.value = false
}

// 处理编辑器内容变化
const handleContentChange = (html: string) => {
  content.value = html
  debouncedUpdate({ content: html })
}

const syncWithParent = (updatedFields: Partial<Note>) => {
  debouncedUpdate(updatedFields)
}

const filteredSuggestions = computed(() => {
  return props.allTags
    .filter(tag => !tags.value.includes(tag))
    .filter(tag => tag.toLowerCase().includes(newTag.value.toLowerCase()))
})

const handleAddTag = (tag: string) => {
  const cleanTag = tag.trim().replace(/^#/, '')
  if (cleanTag && !tags.value.includes(cleanTag)) {
    const updatedTags = [...tags.value, cleanTag]
    tags.value = updatedTags
    syncWithParent({ tags: updatedTags })
  }
  newTag.value = ''
  showTagMenu.value = false
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const removeTag = (tagToRemove: string) => {
  const updatedTags = tags.value.filter(t => t !== tagToRemove)
  tags.value = updatedTags
  syncWithParent({ tags: updatedTags })
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (showTagMenu.value && filteredSuggestions.value.length > 0 && highlightedIndex.value < filteredSuggestions.value.length) {
      handleAddTag(filteredSuggestions.value[highlightedIndex.value])
    } else if (newTag.value.trim()) {
      handleAddTag(newTag.value.trim())
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = (highlightedIndex.value + 1) % (filteredSuggestions.value.length || 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = (highlightedIndex.value - 1 + (filteredSuggestions.value.length || 1)) % (filteredSuggestions.value.length || 1)
  } else if (e.key === 'Escape') {
    showTagMenu.value = false
  }
}

// 点击外部关闭标签菜单
const handleClickOutside = (e: MouseEvent) => {
  if (
    tagMenuRef.value &&
    !tagMenuRef.value.contains(e.target as Node) &&
    !tagInputRef.value?.contains(e.target as Node)
  ) {
    showTagMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (updateTimer !== null) {
    clearTimeout(updateTimer)
  }
  if (isSaving.value) {
    immediateUpdate()
  }
})

const togglePin = () => {
  emit('togglePin')
}

// 分享相关
const handleShareClick = () => {
  showShareModal.value = true
}

const handleShare = async () => {
  emit('share')
}

const handleUnshare = async () => {
  emit('unshare')
}

const handleCopyLink = (url: string) => {
  console.log('链接已复制:', url)
}

const handleCloseShareModal = () => {
  showShareModal.value = false
}

const handleTitleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = target.scrollHeight + 'px'
}

const canCreateNewTag = computed(() => {
  return newTag.value.trim() &&
    !props.allTags.some(t => t.toLowerCase() === newTag.value.trim().toLowerCase()) &&
    !tags.value.some(t => t.toLowerCase() === newTag.value.trim().toLowerCase())
})

// 获取当前用户信息
const currentUser = computed(() => {
  return getUserInfo()
})
</script>

<template>
  <div class="flex-1 flex flex-col h-full bg-white relative">
    <header
      class="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-12 border-b border-slate-100 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
      <div class="flex items-center gap-4 text-slate-400">
        <button @click="emit('back')" class="md:hidden p-2 -ml-2 hover:text-slate-600 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="hidden sm:flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">schedule</span>
          <span class="text-[12px] font-medium tracking-wide">更新于 {{ note.updatedAt }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <div v-if="isSaving" class="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
          <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>
          <span>保存中...</span>
        </div>

        <button
          @click="handleShareClick"
          :class="[
            'hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium',
            note.isShared
              ? 'text-green-600 bg-green-50 hover:bg-green-100'
              : 'text-slate-600 hover:bg-slate-100'
          ]">
          <span class="material-symbols-outlined text-[20px]">ios_share</span>
          分享
        </button>
        <div class="hidden sm:block h-6 w-px bg-slate-100 mx-2"></div>

        <div class="flex items-center gap-1">
          <button @click="togglePin" :class="[
            'p-2.5 rounded-xl transition-all',
            note.isPinned
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
          ]" :title="note.isPinned ? '取消固定' : '固定笔记'">
            <span class="material-symbols-outlined text-[20px]" :class="{ 'fill-1': note.isPinned }">
              push_pin
            </span>
          </button>

          <button @click="emit('delete')"
            class="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="删除笔记">
            <span class="material-symbols-outlined text-[22px]">delete</span>
          </button>
        </div>

        <div class="relative">
          <button @click="showUserMenu = !showUserMenu"
            class="size-8 ml-3 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[12px] font-bold text-slate-500 hover:border-blue-600 transition-all overflow-hidden">
            <span class="material-symbols-outlined text-lg">person</span>
          </button>

          <div v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50">
            <div class="px-4 py-3 border-b border-slate-50">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">账户设置</p>
              <p class="text-sm font-semibold text-slate-700 truncate">{{ currentUser?.email || 'user@example.com' }}</p>
            </div>
            <button @click="emit('logout')"
              class="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">logout</span>
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto custom-scrollbar py-2 md:py-2">
      <div class="mx-auto px-4 md:px-6">

        <!-- 标签栏 -->
        <div class="flex flex-wrap items-center gap-2 mb-4 min-h-[40px] relative">
          <div class="flex items-center gap-1.5 text-slate-300">
            <span class="material-symbols-outlined text-[20px]">label</span>
          </div>

          <div v-for="tag in tags" :key="tag"
            class="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 hover:bg-slate-200 transition-colors group">
            #{{ tag }}
            <button @click="removeTag(tag)"
              class="material-symbols-outlined text-[14px] text-slate-400 hover:text-red-500 transition-colors">
              close
            </button>
          </div>

          <div class="relative">
            <input ref="tagInputRef" v-model="newTag" type="text" @focus="showTagMenu = true; highlightedIndex = 0"
              @input="showTagMenu = true; highlightedIndex = 0" @keydown="handleKeyDown" placeholder="添加标签..."
              class="border-none focus:ring-0 text-sm font-medium text-slate-600 p-2 bg-transparent w-40 placeholder:text-slate-300" />

            <div v-if="showTagMenu" ref="tagMenuRef"
              class="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div
                class="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                {{ newTag.trim() ? '搜索结果' : '常用已有标签' }}
              </div>

              <div class="max-h-60 overflow-y-auto custom-scrollbar">
                <template v-if="filteredSuggestions.length > 0">
                  <button v-for="(suggestion, index) in filteredSuggestions" :key="suggestion"
                    @click="handleAddTag(suggestion)" @mouseenter="highlightedIndex = index" :class="[
                      'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors text-left',
                      index === highlightedIndex
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    ]">
                    <span class="material-symbols-outlined text-lg opacity-40">tag</span>
                    <span class="flex-1 truncate font-medium">{{ suggestion }}</span>
                  </button>
                </template>
                <div v-else-if="!newTag.trim()" class="px-3 py-4 text-center text-slate-400 text-xs italic">
                  没有更多已有标签
                </div>

                <button v-if="canCreateNewTag" @click="handleAddTag(newTag)" :class="[
                  'w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-colors text-left mt-1 border-t border-slate-50',
                  highlightedIndex === filteredSuggestions.length
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-blue-600 hover:bg-blue-50/50'
                ]" @mouseenter="highlightedIndex = filteredSuggestions.length">
                  <span class="material-symbols-outlined text-lg">add_circle</span>
                  <span class="flex-1 font-semibold">创建新标签 "<span class="underline decoration-2 underline-offset-2">{{
                    newTag
                      }}</span>"</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 标题输入 -->
        <div class="mb-2">
          <textarea :value="title" @input="(e: Event) => {
            const val = (e.target as HTMLTextAreaElement).value
            title = val
            syncWithParent({ title: val })
            handleTitleInput(e)
          }"
            class="w-full bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-bold p-0 placeholder:text-slate-200 resize-none h-auto overflow-hidden leading-tight text-slate-900"
            placeholder="笔记标题" :rows="1" spellcheck="false" />
        </div>

        <!-- 富文本编辑器 -->
        <div class="editor-wrapper">
          <QuillEditor
            :key="note.id"
            :content="content"
            :options="editorOptions"
            contentType="html"
            @update:content="handleContentChange"
            theme="snow"
          />
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareModal
      v-if="showShareModal"
      :note-id="note.id"
      :note-title="note.title"
      :is-shared="note.isShared"
      :share-url="shareUrl"
      @close="handleCloseShareModal"
      @share="handleShare"
      @unshare="handleUnshare"
      @copy-link="handleCopyLink"
    />
  </div>
</template>

<style scoped>
/* 编辑器容器样式 */
.editor-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 0;
  overflow: hidden;
  background: white;
}

.editor-wrapper :deep(.ql-container) {
  font-size: 16px;
  line-height: 1.8;
  min-height: 500px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.editor-wrapper :deep(.ql-editor) {
  padding: 20px;
  color: #334155;
}

.editor-wrapper :deep(.ql-editor.ql-blank::before) {
  color: #94a3b8;
  font-style: normal;
}

/* 工具栏样式 */
.editor-wrapper :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 0;
}

.editor-wrapper :deep(.ql-toolbar button) {
  border-radius: 4px;
  width: 28px;
  height: 28px;
  margin: 0 1px;
}

.editor-wrapper :deep(.ql-toolbar button:hover) {
  background: #e2e8f0;
}

.editor-wrapper :deep(.ql-toolbar button.ql-active) {
  background: #dbeafe;
  color: #3b82f6;
}

.editor-wrapper :deep(.ql-toolbar .ql-picker) {
  font-size: 13px;
}

/* 编辑器内容样式 */
.editor-wrapper :deep(.ql-editor h1) {
  font-size: 2em;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 16px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.editor-wrapper :deep(.ql-editor h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 16px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.editor-wrapper :deep(.ql-editor h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 12px;
  color: #1e293b;
}

.editor-wrapper :deep(.ql-editor p) {
  margin-bottom: 12px;
  line-height: 1.8;
}

.editor-wrapper :deep(.ql-editor ul),
.editor-wrapper :deep(.ql-editor ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.editor-wrapper :deep(.ql-editor li) {
  margin: 6px 0;
}

.editor-wrapper :deep(.ql-editor blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 16px;
  margin: 16px 0;
  color: #64748b;
  font-style: italic;
}

.editor-wrapper :deep(.ql-editor pre) {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
}

.editor-wrapper :deep(.ql-editor code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  color: #e11d48;
}

.editor-wrapper :deep(.ql-editor a) {
  color: #3b82f6;
  text-decoration: none;
}

.editor-wrapper :deep(.ql-editor a:hover) {
  text-decoration: underline;
}

.editor-wrapper :deep(.ql-editor strong) {
  font-weight: 700;
  color: #0f172a;
}

.editor-wrapper :deep(.ql-editor em) {
  font-style: italic;
}

/* 自定义滚动条 */
:deep(.ql-container.ql-snow) {
  border: none;
}
</style>
