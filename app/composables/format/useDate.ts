export function useDate() {
  function format(date?: string | Date, locale = 'fa-IR') {
    if (!date) return '—'
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' }).format(d)
  }
  return { format }
}
