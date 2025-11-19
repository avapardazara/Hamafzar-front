<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/30 dark:bg-black/60" @click="$emit('close')" />
      <aside
        class="absolute top-0 bottom-0 w-80 max-w-[85%] border transition"
        :class="[ side === 'right' ? 'right-0' : 'left-0', contentClass ]"
        role="dialog"
        aria-modal="true"
      >
        <header class="p-4 border-b border-white/15 flex items-center justify-between">
          <h3 class="font-semibold">{{ title }}</h3>
          <button class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5" @click="$emit('close')" aria-label="Close">✕</button>
        </header>
        <div class="p-4 overflow-auto h-full">
          <slot />
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  side?: 'left' | 'right'
  variant?: 'solid' | 'glass'
}>(), {
  side: 'right',
  variant: 'glass'
})
defineEmits<{(e:'close'):void}>()

const contentClass = computed(() => props.variant === 'glass'
  ? 'backdrop-blur-md bg-white/55 dark:bg-[#111928]/35 border-white/20 dark:border-white/10'
  : 'bg-white dark:bg-[#0f172a] border-border/60 dark:border-white/10 shadow-soft'
)
</script>
