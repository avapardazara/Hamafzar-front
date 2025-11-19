<template>
  <button
    :disabled="disabled || loading"
    class="btn inline-flex items-center justify-center gap-2 font-medium transition rounded-xl border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60 disabled:cursor-not-allowed"
    :class="[
      sizeClasses[size],
      variantClasses[variant],
      { 'cursor-progress': loading }
    ]"
    v-bind="$attrs"
  >
    <slot name="prefix" />
    <Spinner v-if="loading" size="sm" />
    <slot />
    <slot name="suffix" />
  </button>
</template>

<script setup lang="ts">
import Spinner from './Spinner.vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg',
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  loading?: boolean
  disabled?: boolean
}>(), {
  size: 'md',
  variant: 'primary',
  loading: false,
  disabled: false
})

const sizeClasses: Record<string, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5'
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-white border-primary hover:brightness-110 active:brightness-95',
  secondary: 'bg-white text-text border-border hover:border-primary/70 dark:bg-[#0f172a] dark:text-gray-100 dark:border-white/15 dark:hover:border-primary/60',
  outline: 'bg-transparent text-text border-border hover:border-primary/60 dark:text-gray-100 dark:border-white/15',
  ghost: 'bg-transparent text-text border-transparent hover:bg-black/5 dark:text-gray-100 dark:hover:bg-white/5',
  danger: 'bg-red-500 text-white border-red-500 hover:brightness-110 active:brightness-95'
}
</script>
