<template>
  <button
    class="p-2 rounded-lg border border-border/60 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
    @click="toggle"
    :aria-label="`Switch theme to ${nextLabel}`"
  >
    <span v-if="mode==='light'">🌞</span>
    <span v-else-if="mode==='dark'">🌙</span>
    <span v-else>🖥️</span>
  </button>
</template>

<script setup lang="ts">
const mode = useState<'light'|'dark'|'system'>('__theme__', () => 'light')

onMounted(() => apply(mode.value))
watch(mode, v => apply(v))

const nextLabel = computed(() => mode.value === 'light' ? 'dark' : mode.value === 'dark' ? 'system' : 'light')

function toggle() {
  mode.value = mode.value === 'light' ? 'dark' : mode.value === 'dark' ? 'system' : 'light'
}

function apply(v: 'light'|'dark'|'system') {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = v === 'system' ? prefersDark : v === 'dark'
  root.classList.toggle('dark', isDark)
  localStorage.setItem('theme', v)
}

onMounted(() => {
  const saved = localStorage.getItem('theme') as 'light'|'dark'|'system'|null
  if (saved) mode.value = saved
})
</script>
