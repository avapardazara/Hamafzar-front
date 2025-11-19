<template>
  <div class="relative w-full max-w-md">
    <input
      v-model="model"
      type="search"
      :placeholder="placeholder"
      class="w-full h-10 rounded-xl border border-border/60 dark:border-white/15 bg-white dark:bg-[#0f172a] px-10 text-sm
             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    />
    <span class="absolute inset-y-0 right-3 grid place-items-center text-gray-400">🔎</span>
    <button
      v-if="model"
      class="absolute inset-y-0 left-2 grid place-items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      @click="model = ''"
      aria-label="clear"
    >✕</button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue?: string; placeholder?: string }>(), { placeholder: 'جستجو...' })
const emit = defineEmits<{ (e:'update:modelValue', v:string):void }>()
const model = computed({
  get: () => props.modelValue ?? '',
  set: v => emit('update:modelValue', v)
})
</script>
