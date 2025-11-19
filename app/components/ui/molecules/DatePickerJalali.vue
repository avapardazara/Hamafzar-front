<template>
  <div class="relative w-full max-w-xs">
    <PersianDatePicker
      v-model="inner"
      :format="format"
      :display-format="displayFormat"
      :min="min"
      :max="max"
      :disabled="disabled"
      :placeholder="placeholder"
      input-class="w-full h-10 rounded-xl px-3 text-sm
                   bg-white dark:bg-[#0f172a]
                   border border-border/60 dark:border-white/15
                   placeholder:text-gray-400
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
                   disabled:opacity-60"
      color="#02AD82"
      :auto-submit="true"
      :editable="true"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string | null
  placeholder?: string
  disabled?: boolean
  min?: string | null
  max?: string | null
  format?: string
  displayFormat?: string
}>(), {
  placeholder: 'تاریخ را انتخاب کنید...',
  format: 'jYYYY/jMM/jDD',
  displayFormat: 'jYYYY/jMM/jDD',
})
const emit = defineEmits<{ (e:'update:modelValue', v:string|null): void }>()
const inner = computed({
  get: () => props.modelValue ?? null,
  set: (v) => emit('update:modelValue', (v as string) || null)
})
</script>
