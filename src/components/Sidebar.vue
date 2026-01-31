<script setup lang="ts">
import { ref } from 'vue'
import type { Notebook } from '../types'

interface SidebarProps {
  notebooks: Notebook[]
  activeId: number | null
  tags: string[]
  activeTag: string | null
}

const props = defineProps<SidebarProps>()

const emit = defineEmits<{
  selectTag: [tag: string | null]
  deleteTag: [tag: string]
  select: [id: number | null]
  addClick: []
  editClick: [notebook: Notebook]
  deleteClick: [id: number]
  allNotes: []
  newNote: []
}>()

const openMenuId = ref<number | null>(null)

const handleMenuClick = (e: Event, id: number) => {
  e.stopPropagation()
  openMenuId.value = openMenuId.value === id ? null : id
}

const handleEditClick = (e: Event, notebook: Notebook) => {
  e.stopPropagation()
  emit('editClick', notebook)
  openMenuId.value = null
}

const handleDeleteClick = (e: Event, id: number) => {
  e.stopPropagation()
  emit('deleteClick', id)
  openMenuId.value = null
}

const handleDeleteTag = (e: Event, tag: string) => {
  e.stopPropagation()
  emit('deleteTag', tag)
}

const closeMenu = () => {
  openMenuId.value = null
}
</script>

<template>
  <aside class="w-full h-full border-r border-slate-100 bg-[#f9fafb] flex flex-col">
    <div class="p-8 flex items-center gap-3 shrink-0">
      <div class="size-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
        <span class="material-symbols-outlined text-xl">edit_note</span>
      </div>
      <h1 class="text-xl font-black tracking-tight text-slate-800">NoteSpace</h1>
    </div>

    <nav class="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-8">
      <div class="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">工作区</div>

      <button @click="emit('allNotes')" :class="[
        'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all',
        !activeId
          ? 'bg-white text-blue-600 font-semibold shadow-sm border border-slate-100'
          : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'
      ]">
        <span class="material-symbols-outlined text-[22px]">description</span>
        <span>所有笔记</span>
      </button>

      <!-- Notebooks Section -->
      <div class="pt-8 px-4 py-3 flex items-center justify-between">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">笔记本</span>
        <button @click="emit('addClick')"
          class="size-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
          <span class="material-symbols-outlined text-lg">add</span>
        </button>
      </div>

      <div class="space-y-0.5">
        <div v-for="nb in notebooks" :key="nb.id" class="relative group">
          <button @click="emit('select', nb.id)" :class="[
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all',
            activeId === nb.id
              ? 'bg-white text-blue-600 font-semibold shadow-sm border border-slate-100'
              : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'
          ]">
            <span class="material-symbols-outlined text-[22px]" :style="{ color: nb.color }">{{ nb.icon }}</span>
            <span class="flex-1 text-left truncate">{{ nb.name }}</span>
            <div @click="handleMenuClick($event, nb.id)"
              class="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
              <span class="material-symbols-outlined text-lg">more_horiz</span>
            </div>
          </button>

          <template v-if="openMenuId === nb.id">
            <div class="fixed inset-0 z-40" @click="closeMenu" />
            <div class="absolute right-4 top-10 w-32 bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-50">
              <button @click="handleEditClick($event, nb)"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <span class="material-symbols-outlined text-lg">edit</span>
                修改
              </button>
              <button @click="handleDeleteClick($event, nb.id)"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <span class="material-symbols-outlined text-lg">delete</span>
                删除
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- Tags Section -->
      <template v-if="tags.length > 0">
        <div class="pt-8 px-4 py-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">标签</span>
        </div>
        <div class="px-2 flex flex-wrap gap-2">
          <div v-for="tag in tags" :key="tag" class="group relative flex items-center gap-1">
            <button @click="emit('selectTag', activeTag === tag ? null : tag)" :class="[
              'px-3 py-1 rounded-full text-xs font-semibold transition-all',
              activeTag === tag
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200'
            ]">
              # {{ tag }}
            </button>
            <button @click="handleDeleteTag($event, tag)"
              class="size-4 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              title="删除标签">
              <span class="material-symbols-outlined text-[12px]">close</span>
            </button>
          </div>
        </div>
      </template>
    </nav>

    <div class="p-6 shrink-0">
      <button @click="emit('newNote')"
        class="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98]">
        <span class="material-symbols-outlined text-xl">add</span>
        新建笔记
      </button>
    </div>
  </aside>
</template>
<style lang="css" scoped>
.shadow-sm-n {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 transparent;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.border-transparent {
  border-color: transparent;
}
</style>
