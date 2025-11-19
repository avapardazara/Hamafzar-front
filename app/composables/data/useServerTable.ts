import { ref, computed, watch } from 'vue'
import { useApi } from '../useApi'  // ⬅️ به‌جای #imports
import { usePagination } from './usePagination'

type SortDir = 'asc' | 'desc' | ''
type ServerTableOpts<TFilter extends Record<string, any> = Record<string, any>> = {
  endpoint: string
  initialSort?: { key: string, dir: SortDir }
  initialFilter?: TFilter
  mapResponse?: (raw: any) => { items: any[]; total: number }
}

export function useServerTable<T = any, TFilter extends Record<string, any> = Record<string, any>>(opts: ServerTableOpts<TFilter>) {
  const { get } = useApi()
  const { page, pageSize, total, pageCount, canPrev, canNext, go, next, prev } = usePagination(1, 10)

  const rows = ref<T[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const search = ref<string>('')
  const sortKey = ref(opts.initialSort?.key || '')
  const sortDir = ref<SortDir>(opts.initialSort?.dir || '')
  const filters = ref<TFilter>(opts.initialFilter || {} as TFilter)

  const query = computed(() => {
    const q: Record<string, any> = {
      page: page.value,
      page_size: pageSize.value,
    }
    if (search.value) q.search = search.value
    if (sortKey.value && sortDir.value) q.sort = `${sortDir.value === 'desc' ? '-' : ''}${sortKey.value}`
    for (const k of Object.keys(filters.value || {})) {
      const v = (filters.value as any)[k]
      if (v !== '' && v !== undefined && v !== null) q[k] = v
    }
    return q
  })

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const res = await get<any>(opts.endpoint, { query: query.value })
      const mapped = opts.mapResponse ? opts.mapResponse(res) : defaultMap(res)
      rows.value = mapped.items as T[]
      total.value = mapped.total
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'خطا در دریافت داده'
    } finally {
      loading.value = false
    }
  }

  function setSort(key: string) {
    if (sortKey.value !== key) {
      sortKey.value = key
      sortDir.value = 'asc'
    } else {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : (sortDir.value === 'desc' ? '' : 'asc')
      if (!sortDir.value) sortKey.value = ''
    }
    go(1)
  }

  watch([query], () => { fetch() }, { immediate: true })

  return {
    rows, loading, error,
    page, pageSize, total, pageCount, canPrev, canNext, go, next, prev,
    search, sortKey, sortDir, filters, setSort, fetch
  }
}

function defaultMap(res: any): { items: any[]; total: number } {
  if (Array.isArray(res?.items) && typeof res?.total === 'number') return { items: res.items, total: res.total }
  if (Array.isArray(res?.data) && typeof res?.total === 'number') return { items: res.data, total: res.total }
  if (Array.isArray(res?.results) && typeof res?.count === 'number') return { items: res.results, total: res.count }
  return { items: Array.isArray(res) ? res : [], total: Array.isArray(res) ? res.length : 0 }
}
