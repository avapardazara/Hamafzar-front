<template>
  <div class="flex items-center justify-between gap-3 text-sm">
    <div class="opacity-70">
      صفحه {{ page }} از {{ pageCount }} — کل: {{ total }}
    </div>
    <div class="flex items-center gap-1">
      <button class="px-3 h-9 rounded-lg border border-border/60 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
              :disabled="!canPrev" @click="$emit('prev')">قبلی</button>
      <button class="px-3 h-9 rounded-lg border border-border/60 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
              :disabled="!canNext" @click="$emit('next')">بعدی</button>
      <select class="h-9 rounded-lg border border-border/60 dark:border-white/15 bg-white dark:bg-[#0f172a] px-2"
              :value="pageSize" @change="$emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  page: number
  pageCount: number
  total: number
  canPrev: boolean
  canNext: boolean
  pageSize: number
}>()
defineEmits<{ (e:'prev'):void; (e:'next'):void; (e:'update:pageSize', v:number):void }>()
</script>
