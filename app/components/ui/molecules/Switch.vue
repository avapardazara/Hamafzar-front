<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :disabled="disabled"
    @click="emit('update:modelValue', !model)"
    class="relative inline-flex h-6 w-11 items-center rounded-full transition
           border border-border/60 dark:border-white/15
           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
           disabled:opacity-60"
    :class="model ? 'bg-primary' : 'bg-white dark:bg-[#0f172a]'"
  >
    <span
      class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
      :class="model ? 'translate-x-5' : 'translate-x-1'"
    />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ (e:'update:modelValue', v:boolean): void }>()
const model = computed(() => !!props.modelValue)
</script>
