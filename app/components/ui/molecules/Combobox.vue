<template>
  <div class="relative w-full max-w-md">
    <!-- input -->
    <div class="relative">
      <input
        ref="inputEl"
        v-model="query"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-expanded="open"
        role="combobox"
        class="w-full h-10 rounded-xl px-10 text-sm
               bg-white dark:bg-[#0f172a]
               border border-border/60 dark:border-white/15
               placeholder:text-gray-400
               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
               disabled:opacity-60"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="selectActive"
        @keydown.esc.prevent="close"
        @focus="open = true"
      />
      <span class="absolute inset-y-0 right-3 grid place-items-center text-gray-400">🔎</span>
      <button
        v-if="model"
        class="absolute inset-y-0 left-2 grid place-items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        @click="clear"
        aria-label="clear"
      >✕</button>
    </div>

    <!-- dropdown -->
    <div
      v-if="open"
      class="absolute z-40 mt-1 w-full rounded-xl border border-border/60 dark:border-white/10
             bg-white dark:bg-[#0f172a] shadow-soft max-h-64 overflow-auto"
    >
      <div v-if="loading" class="px-3 py-2 text-sm text-gray-500">در حال بارگذاری…</div>
      <div v-else-if="!items.length" class="px-3 py-2 text-sm text-gray-500">موردی پیدا نشد</div>
      <ul v-else role="listbox" class="py-1">
        <li
          v-for="(opt, i) in items"
          :key="opt.value"
          :aria-selected="i===activeIndex"
          class="px-3 py-2 cursor-pointer text-sm rounded-lg mx-1"
          :class="i===activeIndex ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'"
          @mouseenter="activeIndex = i"
          @mousedown.prevent="choose(opt)"
        >
          <slot name="option" :option="opt">
            {{ opt.label }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDebounce } from '~/composables/useDebounce'

type Option = { value: string | number; label: string }

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  options?: Option[]               // برای حالت لوکال
  fetcher?: (q: string) => Promise<Option[]> // برای حالت سروری
  placeholder?: string
  disabled?: boolean
}>(), {
  options: () => [],
  placeholder: 'جستجو کنید...'
})
const emit = defineEmits<{ (e:'update:modelValue', v:string|number|null): void }>()

const inputEl = ref<HTMLInputElement | null>(null)
const open = ref(false)
const query = ref('')
const debounced = useDebounce(query, 250)
const loading = ref(false)
const items = ref<Option[]>([])
const activeIndex = ref(-1)
const model = computed(() => props.modelValue ?? null)

function close() { open.value = false; activeIndex.value = -1 }
function clear() { emit('update:modelValue', null); query.value = '' }
function move(dir: 1 | -1) {
  if (!items.value.length) return
  open.value = true
  const next = activeIndex.value + dir
  if (next < 0) activeIndex.value = items.value.length - 1
  else if (next >= items.value.length) activeIndex.value = 0
  else activeIndex.value = next
}
function selectActive() {
  if (activeIndex.value < 0 || activeIndex.value >= items.value.length) return
  choose(items.value[activeIndex.value])
}
function choose(opt: Option) {
  emit('update:modelValue', opt.value)
  query.value = opt.label
  close()
  inputEl.value?.blur()
}

// sync نمایش اولیه بر اساس مدل
watch(() => props.modelValue, (v) => {
  const found = items.value.find(o => o.value === v)
  if (found) query.value = found.label
}, { immediate: true })

// واکشی داده (لوکال/سروری)
watch(debounced, async (q) => {
  open.value = true
  loading.value = !!props.fetcher
  try {
    if (props.fetcher) {
      items.value = await props.fetcher(q || '')
    } else {
      const base = props.options || []
      const text = (q || '').toString().trim()
      items.value = !text ? base : base.filter(o => o.label.includes(text))
    }
  } finally {
    loading.value = false
    // اگر مدل موجود بود و query از روی آن نمایش داده نشد، اینجا ست می‌کنیم
    if (!query.value && props.modelValue != null) {
      const found = items.value.find(o => o.value === props.modelValue)
      if (found) query.value = found.label
    }
  }
}, { immediate: true })

// بستن روی کلیک بیرون
function onClickOutside(e: MouseEvent) {
  if (!inputEl.value) return
  const root = (inputEl.value.closest('.relative') as HTMLElement) || inputEl.value
  if (!root.contains(e.target as Node)) close()
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>
