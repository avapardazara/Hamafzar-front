import { ref, computed } from 'vue'

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const canPrev = computed(() => page.value > 1)
  const canNext = computed(() => page.value < pageCount.value)

  function go(p: number) {
    page.value = Math.min(Math.max(1, p), pageCount.value)
  }
  function next() {
    if (canNext.value) page.value++
  }
  function prev() {
    if (canPrev.value) page.value--
  }

  return { page, pageSize, total, pageCount, canPrev, canNext, go, next, prev }
}
