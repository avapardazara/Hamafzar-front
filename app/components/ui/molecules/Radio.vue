<template>
  <label class="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="radio"
      class="h-4 w-4 border border-border/60 dark:border-white/15 text-primary focus:ring-primary/60 focus:outline-none"
      :name="name"
      :value="value"
      :checked="model === value"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="text-sm" :class="{ 'opacity-60': disabled }"><slot /></span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  value: string | number
  modelValue?: string | number
  disabled?: boolean
}>()
const emit = defineEmits<{ (e:'update:modelValue', v:string|number): void }>()
const model = computed(() => props.modelValue)
function onChange () {
  emit('update:modelValue', props.value)
}
</script>
