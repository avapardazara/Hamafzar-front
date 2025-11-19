<template>
  <div class="w-full">
    <!-- Toolbar slot -->
    <div v-if="$slots.toolbar" class="mb-3">
      <slot name="toolbar" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid gap-2">
      <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-xl border border-red-500/30 p-4 text-red-700 dark:text-red-300">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="!rows.length" class="rounded-xl border border-border/60 dark:border-white/10 p-8 text-center text-sm text-gray-500">
      داده‌ای یافت نشد.
    </div>

    <!-- Table (desktop) -->
    <div v-else class="hidden md:block overflow-x-auto rounded-xl border border-border/60 dark:border-white/10">
      <table class="min-w-full text-sm">
        <thead class="bg-surface/60 dark:bg-white/[0.03]">
          <tr>
            <th v-for="col in columns" :key="col.key" class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300 border-b border-border/60 dark:border-white/10">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="idx" class="border-b border-border/60 dark:border-white/10">
            <td v-for="col in columns" :key="col.key" class="px-3 py-2">
              <slot :name="`cell:${col.key}`" :row="row">{{ row[col.key] }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards (mobile) -->
    <div class="md:hidden grid gap-3">
      <div
        v-for="(row, idx) in rows"
        :key="idx"
        class="rounded-2xl border border-border/60 dark:border-white/10 p-4 bg-white dark:bg-[#0f172a]"
      >
        <div v-for="col in columns" :key="col.key" class="flex items-center justify-between py-1">
          <div class="text-xs text-gray-500">{{ col.label }}</div>
          <div class="text-sm font-medium text-right">
            <slot :name="`cell:${col.key}`" :row="row">{{ row[col.key] }}</slot>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination slot -->
    <div v-if="$slots.pagination" class="mt-3">
      <slot name="pagination" />
    </div>
  </div>
</template>

<script setup lang="ts">
type Column = { key: string, label: string }
defineProps<{
  columns: Column[]
  rows: Record<string, any>[]
  loading?: boolean
  error?: string | null
}>()
</script>
