<template>
  <select
    :id="id"
    v-model="model"
    :disabled="disabled"
    :aria-invalid="!!error"
    class="w-full rounded-xl h-10 px-3 text-sm
           bg-white dark:bg-[#0f172a]
           border border-border/60 dark:border-white/15
           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
           disabled:opacity-60"
  >
    <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
type Option = { value: string | number; label: string }

const props = withDefaults(defineProps<{
  id?: string
  modelValue?: string | number
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: string
}>(), {
  disabled: false
})

const emit = defineEmits<{(e:'update:modelValue', v:string|number): void}>()
const model = computed({
  get: () => props.modelValue as (string|number|undefined),
  set: v => emit('update:modelValue', v as (string|number))
})
</script>
