<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] grid place-items-center p-4"
      @keydown.esc="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/30 dark:bg-black/60" @click="$emit('close')" />
      <div
        class="relative w-full max-w-lg rounded-2xl border transition"
        :class="contentClass"
        role="dialog"
        aria-modal="true"
      >
        <header class="p-4 border-b border-white/15 flex items-center justify-between">
          <h3 class="font-semibold">{{ title }}</h3>
          <button class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5" @click="$emit('close')" aria-label="Close">✕</button>
        </header>
        <div class="p-4">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="p-4 border-t border-white/15 flex items-center gap-2">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  variant?: 'solid' | 'glass'
}>(), {
  variant: 'glass'
})
defineEmits<{(e:'close'):void}>()

const contentClass = computed(() => props.variant === 'glass'
  ? 'backdrop-blur-md bg-white/55 dark:bg-[#111928]/35 border-white/20 dark:border-white/10'
  : 'bg-white dark:bg-[#0f172a] border-border/60 dark:border-white/10 shadow-soft'
)
</script>
