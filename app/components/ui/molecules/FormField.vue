<template>
  <div class="grid gap-1.5">
    <label
      v-if="label"
      :for="forId"
      class="text-sm font-medium"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <!-- کنترل اصلی -->
      <slot />

      <!-- prefix / suffix اختیاری -->
      <div v-if="$slots.prefix" class="absolute inset-y-0 right-2 flex items-center text-gray-400">
        <slot name="prefix" />
      </div>
      <div v-if="$slots.suffix" class="absolute inset-y-0 left-2 flex items-center text-gray-400">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="help" class="text-xs text-gray-500">{{ help }}</p>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  forId?: string
  help?: string
  error?: string
  required?: boolean
}>()
</script>
