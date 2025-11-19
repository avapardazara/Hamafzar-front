import { ref, watch, type Ref } from 'vue'

export function useDebounce<T = string>(source: Ref<T>, delay = 250) {
  const debounced = ref(source.value) as Ref<T>
  let t: any
  watch(source, (val) => {
    clearTimeout(t)
    t = setTimeout(() => (debounced.value = val), delay)
  }, { immediate: true })
  return debounced
}
