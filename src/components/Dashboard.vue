<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Notebook, Note, ViewState, MobileView } from '../types'
import { notebookApi, noteApi, tagApi } from '../api'
import { clearAuth } from '../utils/auth'
import Sidebar from './Sidebar.vue'
import NoteList from './NoteList.vue'
import Editor from './Editor.vue'
import Modal from './Modal.vue'
import ConfirmModal from './ConfirmModal.vue'

const router = useRouter()

// 数据状态
const notebooks = ref<Notebook[]>([])
const notes = ref<Note[]>([])
const allTags = ref<string[]>([])
const activeNotebookId = ref<number | null>(null)
const activeTag = ref<string | null>(null)
const activeNoteId = ref<number | null>(null)

// UI 状态
const showAddModal = ref(false)
const editingNotebook = ref<Notebook | null>(null)
const deletingNotebookId = ref<number | null>(null)
const deletingNoteId = ref<number | null>(null)
const deletingTag = ref<string | null>(null)
const errorModalMessage = ref<string | null>(null)
const isLoading = ref(false)

const viewState = ref<ViewState>('all')
const searchQuery = ref('')
const mobileActiveView = ref<MobileView>('list')

// 初始化加载数据
onMounted(() => {
  loadData()
})

const loadData = async () => {
  try {
    isLoading.value = true
    await Promise.all([loadNotebooks(), loadNotes(), loadTags()])
  } catch (error) {
    console.error('加载数据失败:', error)
    errorModalMessage.value = '加载数据失败，请刷新重试'
  } finally {
    isLoading.value = false
  }
}

// 加载笔记本列表
const loadNotebooks = async () => {
  try {
    const data = await notebookApi.getList()
    notebooks.value = data.map(nb => ({
      id: nb.id,
      name: nb.name,
      icon: nb.icon,
      color: nb.color
    }))
  } catch (error) {
    console.error('加载笔记本失败:', error)
    throw error
  }
}

// 加载笔记列表
const loadNotes = async () => {
  try {
    const notebookId = activeNotebookId.value ?? undefined
    const data = await noteApi.getList(notebookId, 1, 100)

    notes.value = data.records.map((note: any) => ({
      id: note.id,
      title: note.title || '无标题',
      content: note.content || '',
      updatedAt: formatTime(note.updateTime),
      tags: note.tags || [],
      notebookId: note.notebookId,
      isPinned: note.isPinned === 1,
      isShared: note.isShared === 1
    }))
  } catch (error) {
    console.error('加载笔记失败:', error)
    throw error
  }
}

// 加载标签列表
const loadTags = async () => {
  try {
    const data = await tagApi.getList()
    allTags.value = data.map(tag => tag.name)
  } catch (error) {
    console.error('加载标签失败:', error)
    throw error
  }
}

// 时间格式化
const formatTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}

// Extract unique tags from all notes
const uniqueTags = computed(() => allTags.value)

const filteredNotes = computed(() => {
  let result = [...notes.value]

  // Filter by notebook
  if (activeNotebookId.value) {
    result = result.filter(n => n.notebookId === activeNotebookId.value)
  }

  // Filter by active tag
  if (activeTag.value) {
    const tag = activeTag.value
    result = result.filter(n => n.tags.includes(tag))
  }

  // Filter by search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    )
  }

  // Filter by predefined view states
  if (viewState.value === 'pinned') {
    result = result.filter(n => n.isPinned)
  } else if (viewState.value === 'shared') {
    result = result.filter(n => n.isShared)
  }

  return result.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })
})

const activeNote = computed(() => {
  return notes.value.find(n => n.id === activeNoteId.value) || null
})

const isMobile = () => {
  return window.innerWidth < 768
}

// 笔记本操作
const handleSaveNotebook = async (name: string, icon: string, color: string) => {
  try {
    if (editingNotebook.value) {
      await notebookApi.update(editingNotebook.value.id, name, icon, color)
    } else {
      await notebookApi.create(name, icon, color)
    }
    await loadNotebooks()
    editingNotebook.value = null
    showAddModal.value = false
  } catch (error: any) {
    errorModalMessage.value = error.message || '操作失败'
  }
}

const initiateDeleteNotebook = async (id: number) => {
  const hasNotes = notes.value.some(n => n.notebookId === id)
  if (hasNotes) {
    errorModalMessage.value = '该笔记本内尚有笔记，无法删除。请先删除或移动其中的笔记。'
    return
  }
  deletingNotebookId.value = id
}

const confirmDeleteNotebook = async () => {
  if (deletingNotebookId.value) {
    try {
      await notebookApi.delete(deletingNotebookId.value)
      if (activeNotebookId.value === deletingNotebookId.value) {
        activeNotebookId.value = null
      }
      await loadNotebooks()
      await loadNotes()
      deletingNotebookId.value = null
    } catch (error: any) {
      errorModalMessage.value = error.message || '删除失败'
    }
  }
}

// 笔记操作
const initiateDeleteNote = (id: number) => {
  deletingNoteId.value = id
}

const confirmDeleteNote = async () => {
  if (deletingNoteId.value) {
    try {
      await noteApi.delete(deletingNoteId.value)
      const remainingNotes = notes.value.filter(n => n.id !== deletingNoteId.value)

      if (activeNoteId.value === deletingNoteId.value) {
        activeNoteId.value = remainingNotes.length > 0 ? remainingNotes[0].id : null
      }

      notes.value = remainingNotes
      deletingNoteId.value = null
      if (isMobile()) mobileActiveView.value = 'list'
    } catch (error: any) {
      errorModalMessage.value = error.message || '删除失败'
    }
  }
}

const handleAddNote = async () => {
  try {
    const notebookId = activeNotebookId.value || notebooks.value[0]?.id
    if (!notebookId) {
      errorModalMessage.value = '请先创建笔记本'
      return
    }

    const data = await noteApi.create(notebookId, '', '', [])
    const newNote: Note = {
      id: data.id,
      title: '无标题',
      content: '',
      updatedAt: '刚刚',
      tags: [],
      notebookId: data.notebookId,
      isPinned: false,
      isShared: false
    }
    notes.value = [newNote, ...notes.value]
    activeNoteId.value = newNote.id
    if (isMobile()) mobileActiveView.value = 'editor'
  } catch (error: any) {
    errorModalMessage.value = error.message || '创建失败'
  }
}

const handleUpdateNote = async (updated: Note) => {
  try {
    await noteApi.update(updated.id, updated.title, updated.content, updated.tags)
    const index = notes.value.findIndex(n => n.id === updated.id)
    if (index !== -1) {
      notes.value[index] = { ...updated, updatedAt: '刚刚' }
    }
  } catch (error) {
    console.error('更新笔记失败:', error)
  }
}

const handleTogglePin = async () => {
  if (!activeNote.value) return
  try {
    const result = await noteApi.togglePin(activeNote.value.id)
    const index = notes.value.findIndex(n => n.id === activeNote.value!.id)
    if (index !== -1) {
      notes.value[index].isPinned = result.isPinned
    }
  } catch (error) {
    console.error('切换固定状态失败:', error)
  }
}

// 分享相关
const handleShare = async () => {
  if (!activeNote.value) return
  try {
    const result = await noteApi.share(activeNote.value.id)
    const index = notes.value.findIndex(n => n.id === activeNote.value!.id)
    if (index !== -1) {
      notes.value[index].isShared = true
      notes.value[index].shareUrl = result.shareUrl
    }
  } catch (error) {
    console.error('分享失败:', error)
    errorModalMessage.value = '分享失败，请稍后重试'
  }
}

const handleUnshare = async () => {
  if (!activeNote.value) return
  try {
    await noteApi.unshare(activeNote.value.id)
    const index = notes.value.findIndex(n => n.id === activeNote.value!.id)
    if (index !== -1) {
      notes.value[index].isShared = false
      notes.value[index].shareUrl = undefined
    }
  } catch (error) {
    console.error('取消分享失败:', error)
    errorModalMessage.value = '取消分享失败，请稍后重试'
  }
}

const handleSelectNote = (id: number) => {
  activeNoteId.value = id
  if (isMobile()) mobileActiveView.value = 'editor'
}

const handleSelectTag = (tag: string | null) => {
  activeTag.value = tag
  if (isMobile()) mobileActiveView.value = 'list'
}

const handleSelectNotebook = (id: number | null) => {
  activeNotebookId.value = id
  activeTag.value = null
  // 重新加载笔记列表
  loadNotes().catch(console.error)
  if (isMobile()) mobileActiveView.value = 'list'
}

const handleAllNotes = () => {
  activeNotebookId.value = null
  activeTag.value = null
  loadNotes().catch(console.error)
  if (isMobile()) mobileActiveView.value = 'list'
}

const handleLogout = () => {
  clearAuth()
  router.push('/login')
}

const setEditingNotebook = (nb: Notebook) => {
  editingNotebook.value = nb
}

const closeNotebookModal = () => {
  showAddModal.value = false
  editingNotebook.value = null
}

const setViewState = (state: ViewState) => {
  viewState.value = state
}

const setSearchQuery = (q: string) => {
  searchQuery.value = q
}

const toggleSidebar = () => {
  mobileActiveView.value = 'sidebar'
}

const handleEditorDelete = () => {
  if (activeNote.value) {
    initiateDeleteNote(activeNote.value.id)
  }
}

const cancelDeleteNotebook = () => {
  deletingNotebookId.value = null
}

const cancelDeleteNote = () => {
  deletingNoteId.value = null
}

const handleDeleteTag = (tag: string) => {
  deletingTag.value = tag
}

const confirmDeleteTag = async () => {
  if (deletingTag.value) {
    try {
      // 查找标签ID
      const tagData = await tagApi.getList()
      const tagToDelete = tagData.find(t => t.name === deletingTag.value)
      if (tagToDelete) {
        await tagApi.delete(tagToDelete.id)
        allTags.value = allTags.value.filter(t => t !== deletingTag.value)
        if (activeTag.value === deletingTag.value) {
          activeTag.value = null
        }
        await loadNotes()
      }
      deletingTag.value = null
    } catch (error: any) {
      errorModalMessage.value = error.message || '删除失败'
      deletingTag.value = null
    }
  }
}

const cancelDeleteTag = () => {
  deletingTag.value = null
}

const closeErrorModal = () => {
  errorModalMessage.value = null
}

// 监听 activeNotebookId 变化
watch(activeNotebookId, () => {
  if (activeNotebookId.value !== null) {
    loadNotes().catch(console.error)
  }
})
</script>

<template>
  <div class="flex h-full w-full bg-white relative overflow-hidden">
    <!-- Sidebar -->
    <div :class="[
      'fixed md:relative z-40 h-full w-[280px] flex-shrink-0 transition-transform duration-300',
      mobileActiveView === 'sidebar' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]">
      <Sidebar :notebooks="notebooks" :active-id="activeNotebookId" :tags="uniqueTags" :active-tag="activeTag"
        @select-tag="handleSelectTag" @delete-tag="handleDeleteTag" @select="handleSelectNotebook" @add-click="showAddModal = true"
        @edit-click="setEditingNotebook" @delete-click="initiateDeleteNotebook" @all-notes="handleAllNotes"
        @new-note="handleAddNote" @logout="handleLogout" />
    </div>

    <!-- Mobile sidebar overlay -->
    <div v-if="mobileActiveView === 'sidebar'" class="fixed inset-0 bg-black/20 z-30 md:hidden"
      @click="mobileActiveView = 'list'" />

    <!-- Note List -->
    <div :class="[
      'flex-1 md:flex-none md:w-[280px] border-r border-slate-100 h-full bg-white flex-col',
      mobileActiveView === 'list' ? 'flex' : 'hidden md:flex'
    ]">
      <NoteList :notes="filteredNotes" :active-note-id="activeNoteId" :view-state="viewState"
        :search-query="searchQuery" @select="handleSelectNote" @delete-note="initiateDeleteNote"
        @view-state-change="setViewState" @search-change="setSearchQuery" @toggle-sidebar="toggleSidebar" />
    </div>

    <!-- Editor -->
    <div :class="[
      'flex-1 h-full bg-white flex-col relative',
      mobileActiveView === 'editor' ? 'flex' : 'hidden md:flex'
    ]">
      <template v-if="activeNote">
        <Editor :note="activeNote" :all-tags="uniqueTags" @update="handleUpdateNote" @toggle-pin="handleTogglePin"
          @delete="handleEditorDelete" @back="mobileActiveView = 'list'"
          @share="handleShare" @unshare="handleUnshare" />
      </template>
      <template v-else>
        <div class="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
          <div class="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
            <span class="material-symbols-outlined text-5xl">edit_document</span>
          </div>
          <p class="text-lg font-medium text-slate-400">选择或创建一个笔记开始写作</p>
        </div>
      </template>
    </div>

    <!-- Notebook Modal -->
    <Modal v-if="showAddModal || editingNotebook" :initial-data="editingNotebook || undefined"
      @close="closeNotebookModal" @save="handleSaveNotebook" />

    <!-- Delete Notebook Confirmation -->
    <ConfirmModal v-if="deletingNotebookId" title="删除笔记本" description="确定要删除这个笔记本吗？此操作不可撤销，且笔记本必须为空。"
      confirm-label="确认删除" :is-danger="true" @confirm="confirmDeleteNotebook" @cancel="cancelDeleteNotebook" />

    <!-- Delete Tag Confirmation -->
    <ConfirmModal v-if="deletingTag" title="删除标签" :description="`确定要删除标签「#${deletingTag}」吗？如果该标签正在被笔记使用，则无法删除。`"
      confirm-label="删除标签" :is-danger="true" @confirm="confirmDeleteTag" @cancel="cancelDeleteTag" />

    <!-- Delete Note Confirmation -->
    <ConfirmModal v-if="deletingNoteId" title="删除笔记" description="确定要删除这篇笔记吗？删除后将无法找回。" confirm-label="删除笔记"
      :is-danger="true" @confirm="confirmDeleteNote" @cancel="cancelDeleteNote" />

    <!-- Error Modal -->
    <ConfirmModal v-if="errorModalMessage" title="无法删除" :description="errorModalMessage" confirm-label="我知道了"
      @confirm="closeErrorModal" @cancel="closeErrorModal" />
  </div>
</template>
