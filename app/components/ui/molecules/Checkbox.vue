<template>
  <label class="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      class="h-4 w-4 rounded border border-border/60 dark:border-white/15
             text-primary focus:ring-primary/60 focus:outline-none"
      :checked="model"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="text-sm" :class="{ 'opacity-60': disabled }"><slot /></span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ (e:'update:modelValue', v:boolean): void }>()
const model = computed(() => !!props.modelValue)
function onChange (e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>
