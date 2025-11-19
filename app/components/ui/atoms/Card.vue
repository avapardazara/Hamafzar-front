<template>
  <div
    class="rounded-2xl border p-6 transition"
    :class="[
      variant === 'glass'
        ? 'backdrop-blur-md bg-white/55 dark:bg-[#111928]/35 border-white/25 dark:border-white/10'
        : 'bg-white dark:bg-[#0f172a] border-border/60 dark:border-white/10 shadow-soft',
      dense ? 'p-4' : 'p-6'
    ]"
  >
    <header v-if="$slots.header" class="mb-4 flex items-center justify-between">
      <slot name="header" />
    </header>
    <div>
      <slot />
    </div>
    <footer v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'solid' | 'glass'
  dense?: boolean
}>()
</script>
