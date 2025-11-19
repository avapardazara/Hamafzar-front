<template>
  <input
    :id="id"
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="!!error"
    class="w-full rounded-xl h-10 px-3 text-sm
           bg-white dark:bg-[#0f172a]
           border border-border/60 dark:border-white/15
           placeholder:text-gray-400
           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
           disabled:opacity-60"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  id?: string
  modelValue?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}>(), {
  type: 'text',
  disabled: false
})
const emit = defineEmits<{(e:'update:modelValue', v:string): void}>()
const model = computed({
  get: () => props.modelValue ?? '',
  set: v => emit('update:modelValue', v)
})
</script>
