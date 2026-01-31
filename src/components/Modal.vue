<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Notebook } from '../types'

const ICONS = ['folder', 'work', 'home', 'person', 'school', 'favorite', 'rocket', 'lightbulb'] as const
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#0f172a'] as const

interface ModalProps {
  initialData?: Notebook
}

const props = defineProps<ModalProps>()

const emit = defineEmits<{
  close: []
  save: [name: string, icon: string, color: string]
}>()

const name = ref(props.initialData?.name || '')
const selectedIcon = ref(props.initialData?.icon || 'folder')
const selectedColor = ref(props.initialData?.color || '#3b82f6')

// Watch for changes in initialData (when switching between editing different notebooks)
watch(() => props.initialData, (newData) => {
  if (newData) {
    name.value = newData.name
    selectedIcon.value = newData.icon
    selectedColor.value = newData.color
  }
}, { deep: true })
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="emit('close')" />

    <div class="relative bg-white w-full max-w-md rounded-[24px] shadow-2xl p-8 border border-white overflow-hidden">
      <h2 class="text-xl font-black text-slate-800 mb-6">{{ initialData ? '修改笔记本' : '新增笔记本' }}</h2>

      <div class="space-y-6">
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">笔记本名称</label>
          <input
            v-model="name"
            autofocus
            class="w-full px-4 py-3 bg-slate-50 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 border transition-all"
            placeholder="例如：产品设计"
          />
        </div>

        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">选择图标</label>
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="icon in ICONS"
              :key="icon"
              @click="selectedIcon = icon"
              :class="[
                'size-12 rounded-xl border flex items-center justify-center transition-all',
                selectedIcon === icon
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
              ]"
            >
              <span class="material-symbols-outlined text-2xl">{{ icon }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">选择颜色</label>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="color in COLORS"
              :key="color"
              @click="selectedColor = color"
              :class="[
                'size-8 rounded-full border-2 transition-all',
                selectedColor === color ? 'border-slate-900 scale-110' : 'border-white'
              ]"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            @click="emit('close')"
            class="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="name && emit('save', name, selectedIcon, selectedColor)"
            :disabled="!name"
            :class="[
              'flex-1 px-4 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95',
              name ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
            ]"
          >
            {{ initialData ? '保存修改' : '确定创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
