<template>
  <span
    class="inline-block animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em]"
    :class="sizeClass"
    aria-label="loading"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-4 w-4'
    case 'lg': return 'h-6 w-6'
    default: return 'h-5 w-5'
  }
})
</script>
