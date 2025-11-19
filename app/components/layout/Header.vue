<template>
  <header class="sticky top-0 z-40 border-b border-border/60 dark:border-white/10 backdrop-blur-md"
    :class="glass ? 'bg-white/55 dark:bg-[#111928]/35' : 'bg-white dark:bg-[#0f172a]'">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="md:hidden p-2 rounded hover:bg-black/5 dark:hover:bg-white/5" @click="$emit('toggleSidebar')" aria-label="Toggle Sidebar">☰</button>
        <div class="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center"><span class="text-primary font-bold">هم</span></div>
        <span class="font-bold">پلتفرم هم‌افزار</span>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ glass?: boolean }>()
defineEmits<{(e:'toggleSidebar'): void}>()
</script>
