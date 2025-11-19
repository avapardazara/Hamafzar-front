import { useState } from "nuxt/app"

type ToastType = 'success'|'info'|'warning'|'danger'
type ToastItem = { id:number, type:ToastType, title:string, message?:string, timeout?:number }

export function useToast() {
  const toasts = useState<ToastItem[]>('__toasts__', () => [])
  function show (t: Omit<ToastItem, 'id'>) {
    const id = Date.now() + Math.random()
    const item = { id, timeout: 3000, ...t }
    toasts.value.push(item)
    if (item.timeout) {
      setTimeout(() => dismiss(id), item.timeout)
    }
  }
  function dismiss (id:number) {
    const i = toasts.value.findIndex(t => t.id === id)
    if (i >= 0) toasts.value.splice(i, 1)
  }
  return { show, dismiss }
}
