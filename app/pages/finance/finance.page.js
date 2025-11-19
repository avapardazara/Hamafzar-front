// app/pages/finance/finance.page.js
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from '#app'
import { useCookie } from '#app'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5000'

function getAuthHeaders (extra = {}) {
  const token = useCookie('ha_token', { path: '/' })

  const headers = {
    Accept: 'application/json',
    ...extra,
  }

  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`
  } else {
    console.warn('[finance] no ha_token cookie, request will probably be 401')
  }

  return headers
}

export function useFinancePage () {
  const router = useRouter()

  const loading = ref(false)
  const error = ref('')

  // تب فعال
  const activeTab = ref('overview')

  const tabs = [
    { key: 'overview', label: 'نمای کلی', icon: '📊' },
    { key: 'receivables', label: 'مطالبات دانشجو', icon: '📥' },
    { key: 'courses', label: 'صورت‌حساب دوره‌ها', icon: '📚' },
    { key: 'mentors', label: 'تسویه منتورها', icon: '🧑‍🏫' },
    { key: 'installments', label: 'اقساط', icon: '📅' },
    { key: 'assets', label: 'دارایی‌ها', icon: '🏦' },
    { key: 'expenses', label: 'هزینه‌ها', icon: '🧾' },
  ]

  // ساختار داده‌ها شبیه تمپلیت Jinja
  const state = reactive({
    kpis: {},
    monthly: [],
    aging: null,
    upcoming_7: [],
    top_courses_mtd: [],
    expense_mtd_by_cat: {},

    receivables: [],
    courses: [],
    mentors: [],
    installments: [],
    assets: [],
    assets_total: 0,
    AssetModelPresent: false,

    expenses: [],
    expenses_mtd: null,
    expenses_total: null,
  })

  // ========= فرمت‌ها =========

  function formatNumber (n) {
    const num = Number(n || 0)
    return num.toLocaleString('fa-IR')
  }

  function formatMoney (n) {
    const num = Number(n || 0)
    return num.toLocaleString('fa-IR')
  }

  // ========= کمکی‌های دیتای نمای کلی =========

  const kpis = computed(() => state.kpis || {})

  const aging = computed(() => {
    const a = (state.kpis && state.kpis.aging) || state.aging || {}
    return {
      '0-30': a['0-30'] || 0,
      '31-60': a['31-60'] || 0,
      '61-90': a['61-90'] || 0,
      '90+': a['90+'] || 0,
    }
  })

  const monthlyChart = computed(() => {
    const rows = Array.isArray(state.monthly) ? state.monthly : []
    if (!rows.length) return { rows: [], max: 0 }

    const normalized = rows.map(r => ({
      ym: r.ym || r.label || '',
      amount: Number(r.amount || 0),
    }))
    const max = normalized.reduce((m, r) => Math.max(m, r.amount), 0) || 1

    return {
      max,
      rows: normalized.map(r => ({
        ...r,
        percent: Math.round((r.amount / max) * 100),
      })),
    }
  })

  const upcoming7 = computed(() => Array.isArray(state.upcoming_7) ? state.upcoming_7 : [])

  const topCoursesMTD = computed(() =>
    Array.isArray(state.top_courses_mtd) ? state.top_courses_mtd : []
  )

  const expenseByCat = computed(() => state.expense_mtd_by_cat || {})

  // ========= تب‌های دیگر =========

  const receivables = computed(() =>
    Array.isArray(state.receivables) ? state.receivables : []
  )

  const coursesSummary = computed(() =>
    Array.isArray(state.courses) ? state.courses : []
  )

  const mentorsSummary = computed(() =>
    Array.isArray(state.mentors) ? state.mentors : []
  )

  const installments = computed(() =>
    Array.isArray(state.installments) ? state.installments : []
  )

  const assets = computed(() =>
    Array.isArray(state.assets) ? state.assets : []
  )

  const assetsTotal = computed(() => Number(state.assets_total || 0))

  const assetModelPresent = computed(() => !!state.AssetModelPresent)

  const expenses = computed(() =>
    Array.isArray(state.expenses) ? state.expenses : []
  )

  const expenseKpis = computed(() => ({
    mtd: Number(
      (state.kpis && (state.kpis.mtd_expense || state.kpis.expense_mtd)) ||
      0
    ),
    total: Number(
      (state.kpis && (state.kpis.total_expense || state.kpis.expenses_total)) ||
      0
    ),
  }))

  // ========= محاسبات ردیفی =========

  function computeBalance (it) {
    const fee = Number(it.fee ?? it.face ?? 0)
    const rcv = Number(it.received ?? it.paid ?? 0)

    if (it.balance != null && Number(it.balance) > 0) {
      return Number(it.balance)
    }
    if (it.remain != null && Number(it.remain) > 0) {
      return Number(it.remain)
    }
    return fee - rcv
  }

  function assetTotalValue (a) {
    const price = Number(a.purchase_price || 0)
    const qty = Number(a.quantity || 0)
    if (!price || !qty) return 0
    return price * qty
  }

  // ========= مسیردهی =========

  function goToStudentFinance (studentId) {
    if (!studentId) return
    router.push(`/students/${studentId}?tab=finance`)
  }

  function goToMentor (mentorId) {
    if (!mentorId) return
    router.push(`/mentors/${mentorId}?tab=finance`)
  }

  function goToCourse (courseId) {
    if (!courseId) return
    router.push(`/courses/${courseId}`)
  }

  // ========= API Call =========
  // این رو شبیه view فعلی مالی ساختیم:
  // پیشنهاد: یک endpoint مثل /api/finance/dashboard
  // که تمام context‌های تمپلیت Jinja رو برمی‌گردونه:
  // { kpis, monthly, upcoming_7, top_courses_mtd, expense_mtd_by_cat,
  //   receivables, courses, mentors, installments, assets, assets_total, AssetModelPresent, expenses }

  async function fetchSummary () {
    loading.value = true
    error.value = ''

    try {
      const res = await fetch(`${API_BASE}/api/finance/dashboard`, {
  method: 'GET',
  headers: getAuthHeaders(),
  // دیگه نیازی به credentials نداریم
})

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 401) {
          console.warn('[finance] 401 in dashboard summary', data)
          error.value =
            data?.error ||
            'دسترسی به داشبورد مالی برای شما مجاز نیست (کد 401).'
          return
        }
        console.error('[finance] fetch error', res.status, data)
        throw new Error(data?.error || 'خطا در دریافت داده‌های مالی')
      }

      state.kpis = data.kpis || {}
      state.monthly = data.monthly || []
      state.aging = data.aging || null
      state.upcoming_7 = data.upcoming_7 || []
      state.top_courses_mtd = data.top_courses_mtd || []
      state.expense_mtd_by_cat = data.expense_mtd_by_cat || {}

      state.receivables = data.receivables || []
      state.courses = data.courses || []
      state.mentors = data.mentors || []
      state.installments = data.installments || []
      state.assets = data.assets || []
      state.assets_total = data.assets_total || 0
      state.AssetModelPresent = !!data.AssetModelPresent

      state.expenses = data.expenses || []
      state.expenses_mtd = data.expenses_mtd || null
      state.expenses_total = data.expenses_total || null
    } catch (err) {
      console.error('[finance] fetch exception', err)
      error.value = err?.message || 'خطای ناشناخته در داشبورد مالی'
    } finally {
      loading.value = false
    }
  }

  function setActiveTab (key) {
    activeTab.value = key
  }

  onMounted(() => {
    fetchSummary()
  })

  return {
    loading,
    error,
    activeTab,
    tabs,
    setActiveTab,

    kpis,
    monthlyChart,
    aging,
    upcoming7,
    topCoursesMTD,
    expenseByCat,

    receivables,
    coursesSummary,
    mentorsSummary,
    installments,
    assets,
    assetsTotal,
    assetModelPresent,

    expenses,
    expenseKpis,

    formatNumber,
    formatMoney,
    computeBalance,
    assetTotalValue,
    goToStudentFinance,
    goToMentor,
    goToCourse,
  }
}
