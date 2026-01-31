<script setup lang="ts">
interface ConfirmModalProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isDanger?: boolean
}

withDefaults(defineProps<ConfirmModalProps>(), {
  confirmLabel: '确认',
  cancelLabel: '取消',
  isDanger: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="emit('cancel')" />

    <div class="relative bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-8 border border-white animate-in fade-in zoom-in duration-200">
      <div
        :class="[
          'size-12 rounded-2xl flex items-center justify-center mb-6',
          isDanger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
        ]"
      >
        <span class="material-symbols-outlined text-2xl">
          {{ isDanger ? 'report_problem' : 'info' }}
        </span>
      </div>

      <h3 class="text-xl font-black text-slate-800 mb-2">{{ title }}</h3>
      <p class="text-slate-500 text-sm leading-relaxed mb-8">{{ description }}</p>

      <div class="flex gap-3">
        <button
          @click="emit('cancel')"
          class="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-sm"
        >
          {{ cancelLabel }}
        </button>
        <button
          @click="emit('confirm')"
          :class="[
            'flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 text-sm',
            isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          ]"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
