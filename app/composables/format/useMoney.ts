export function useMoney() {
  function format(amount?: number | string, currency: 'IRR'|'TOMAN' = 'TOMAN') {
    if (amount == null || amount === '') return '—'
    const n = typeof amount === 'string' ? Number(amount) : amount
    const value = currency === 'TOMAN' ? Math.round(n) : Math.round(n)
    return new Intl.NumberFormat('fa-IR').format(value) + (currency === 'TOMAN' ? ' تومان' : ' ریال')
  }
  return { format }
}
