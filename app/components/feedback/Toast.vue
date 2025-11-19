<template>
  <div class="fixed z-[70] bottom-4 right-4 left-4 md:left-auto space-y-2">
    <transition-group name="toast" tag="div">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="rounded-xl px-4 py-3 border shadow-soft backdrop-blur-md"
        :class="toastClass(t.type)"
        role="status"
      >
        <div class="font-medium mb-0.5">{{ t.title }}</div>
        <div v-if="t.message" class="text-sm opacity-90">{{ t.message }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
type ToastType = 'success'|'info'|'warning'|'danger'
type ToastItem = { id:number, type:ToastType, title:string, message?:string }

const toasts = useState<ToastItem[]>('__toasts__', () => [])

function toastClass (type: ToastType) {
  const base = 'border-white/20 dark:border-white/10'
  switch (type) {
    case 'success': return `bg-emerald-500/85 text-white ${base}`
    case 'info':    return `bg-blue-500/85 text-white ${base}`
    case 'warning': return `bg-amber-500/85 text-white ${base}`
    case 'danger':  return `bg-red-500/85 text-white ${base}`
  }
}
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all .15s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }
</style>
