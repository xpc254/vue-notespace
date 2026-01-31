<script setup lang="ts">
import type { Note, ViewState } from '../types'

interface NoteListProps {
  notes: Note[]
  activeNoteId: number | null
  viewState: ViewState
  searchQuery: string
}

defineProps<NoteListProps>()

const emit = defineEmits<{
  select: [id: number]
  deleteNote: [id: number]
  viewStateChange: [state: ViewState]
  searchChange: [query: string]
  toggleSidebar: []
}>()

const viewStates: ViewState[] = ['all', 'pinned', 'shared']

const viewStateLabels: Record<ViewState, string> = {
  all: '全部',
  pinned: '已固定',
  shared: '已共享'
}

// 去除HTML标签并获取纯文本预览
const stripHtml = (content: string): string => {
  if (!content) return ''

  // 创建临时DOM元素来解析HTML
  const temp = document.createElement('div')
  temp.innerHTML = content

  // 获取纯文本，并处理连续空白
  let text = temp.textContent || temp.innerText || ''

  // 替换多个连续空白为单个空格
  text = text.replace(/\s+/g, ' ').trim()

  // 限制预览长度
  return text.slice(0, 100)
}
</script>

<template>
  <div class="w-full h-full flex flex-col bg-white">
    <div class="p-6 border-b border-slate-100">
      <div class="flex items-center gap-3 mb-4 md:hidden">
        <button @click="emit('toggleSidebar')" class="p-2 -ml-2 text-slate-400 hover:text-slate-600">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <h2 class="font-bold text-lg">NoteSpace</h2>
      </div>

      <div class="relative group">
        <span
          class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-blue-600 transition-colors">search</span>
        <input :value="searchQuery" @input="(e: Event) => emit('searchChange', (e.target as HTMLInputElement).value)"
          class="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-slate-400"
          placeholder="搜索笔记..." type="text" />
      </div>

      <div class="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
        <button v-for="state in viewStates" :key="state" @click="emit('viewStateChange', state)" :class="[
          'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
          viewState === state
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        ]">
          {{ viewStateLabels[state] }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div v-if="notes.length === 0" class="p-10 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-4xl opacity-20">search_off</span>
        没有找到相关笔记
      </div>
      <div v-else class="flex flex-col">
        <div v-for="note in notes" :key="note.id" @click="emit('select', note.id)" :class="[
          'relative group px-6 py-5 border-b border-slate-100 cursor-pointer transition-all border-l-[3px]',
          activeNoteId === note.id
            ? 'bg-blue-50/40 border-l-blue-600'
            : 'hover:bg-slate-50 border-transparent'
        ]">
          <div class="flex justify-between items-start mb-1">
            <div class="flex items-center gap-1.5 flex-1 min-w-0">
              <span v-if="note.isPinned"
                class="material-symbols-outlined text-[16px] text-blue-600 shrink-0">push_pin</span>
              <h3 :class="[
                'text-sm font-bold text-slate-900 truncate',
                activeNoteId === note.id ? 'text-blue-600' : ''
              ]">
                {{ note.title || '无标题笔记' }}
              </h3>
            </div>
            <span
              class="text-[10px] text-slate-400 uppercase font-black tracking-tighter shrink-0 ml-2 group-hover:opacity-0 transition-opacity">
              {{ note.updatedAt }}
            </span>
          </div>
          <p class="text-[13px] text-slate-500 line-clamp-2 leading-relaxed pr-6">
            {{ stripHtml(note.content) || '还没有内容...' }}
          </p>

          <!-- Delete button visible on hover -->
          <button @click.stop="emit('deleteNote', note.id)"
            class="absolute top-5 right-4 size-7 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
            title="删除笔记">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.border-transparent {
  border-left-color: transparent;
}
</style>
