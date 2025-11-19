<template>
  <div class="grid gap-1.5">
    <label v-if="label" :for="forId" class="text-sm font-medium">{{ label }} <span v-if="required" class="text-red-500">*</span></label>
    <div class="relative">
      <slot />
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
