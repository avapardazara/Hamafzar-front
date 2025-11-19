// app/pages/students/students.page.js
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCookie } from '#app'

const API_BASE = 'http://localhost:5000'

// هدر احراز هویت برای درخواست‌ها
function getAuthHeaders () {
  const token = useCookie('ha_token', { path: '/' })
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }

  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`
  } else {
    console.warn('[students] no ha_token cookie, request will probably be 401')
  }

  return headers
}

// فرمت عدد (مثلا موبایل / کدملی در آینده)
function formatNumber (value) {
  if (value == null) return ''
  return String(value)
}

// فرمت تاریخ (فقط پاس‌ترو ساده برای الان)
function formatDate (value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('fa-IR')
  } catch {
    return String(value)
  }
}

// حروف اول نام دانشجو
function getInitials (student) {
  const f = (student?.first_name || '').trim()
  const l = (student?.last_name || '').trim()
  const first = f[0] || ''
  const last = l[0] || ''
  const combo = `${first}${last}`.trim()
  return combo || (student?.full_name || '؟')[0] || '؟'
}

// ساخت آواتار بر اساس نام (اگر avatar_url واقعی نداشتیم)
function buildAvatarFromName (s) {
  const name =
    (s && (s.full_name || `${s.first_name || ''} ${s.last_name || ''}`.trim())) ||
    ''
  if (!name) return null

  const encoded = encodeURIComponent(name)
  return `https://ui-avatars.com/api/?name=${encoded}&background=0F172A&color=FFFFFF`
}

/**
 * ✅ کامپوزبل اصلی لیست دانشجوها
 * این همون چیزیه که تو index.vue با:
 *   import useStudents from './students.page.js'
 *   const {...} = useStudents()
 * صدا می‌زنی.
 */
export default function useStudents () {
  const router = useRouter()
  const students = ref([])
  const loading = ref(false)
  const total = ref(0)

  const filters = reactive({
    q: '',
  })

  const fromDateInput = ref('')
  const toDateInput = ref('')

async function fetchStudents () {
  loading.value = true

  try {
    const params = new URLSearchParams()

    if (filters.q) params.set('q', filters.q)
    if (fromDateInput.value) params.set('from', fromDateInput.value)
    if (toDateInput.value) params.set('to', toDateInput.value)

    const query = params.toString()
    const url = query
      ? `${API_BASE}/api/students?${query}`
      : `${API_BASE}/api/students`

const res = await fetch(url, {
  method: 'GET',
  headers: getAuthHeaders(),
  credentials: 'include'
})

    const data = await res.json().catch(() => ({}))

if (!res.ok) {
  console.error('[students] fetch error', res.status, data)
  handleUnauthorized(res, data, router)   // 👈 این خط
  throw new Error(data?.error || 'خطا در دریافت لیست دانشجوها')
}

const items = data?.items || data?.students || []

const normalized = (Array.isArray(items) ? items : []).map(raw => {
  const id = raw.id ?? raw.student_id ?? raw.pk ?? null

  const first_name = (raw.first_name || '').trim()
  const last_name = (raw.last_name || '').trim()

  let full_name = (raw.full_name || '').trim()
  if (!full_name) {
    full_name = `${first_name} ${last_name}`.trim()
  }

  // 👇 اینجا trim خیلی مهمه
  const avatar_path_raw = raw.avatar_path || raw.avatar || ''
  const avatar_path = avatar_path_raw ? avatar_path_raw.trim() : null

  let avatar_url = raw.avatar_url || null
  if (!avatar_url && avatar_path) {
    avatar_url = `/uploads/${avatar_path}`
    // اگر خواستی کامل:
    // avatar_url = `http://localhost:5000/uploads/${avatar_path}`
  }

  const base = {
    ...raw,
    id,
    first_name,
    last_name,
    full_name,
    avatar_path,
  }

  return {
    ...base,
    avatar_url: avatar_url || buildAvatarFromName(base),
  }
})

students.value = normalized
total.value = data?.total ?? normalized.length
  } catch (err) {
    console.error('[students] fetch exception', err)
  } finally {
    loading.value = false
  }
}

  function resetFilters () {
    filters.q = ''
    fromDateInput.value = ''
    toDateInput.value = ''
    fetchStudents()
  }

  function onCreate () {
    router.push('/students/create')
  }

  function onRefresh () {
    fetchStudents()
  }

function goToProfile (studentOrId) {
  const id = typeof studentOrId === 'object'
    ? studentOrId?.id
    : studentOrId

  if (!id) return

  console.log('[students] goToProfile', id)
  router.push(`/students/${id}`)
}

  function goToEdit (student) {
    if (!student?.id) return
    // صفحه فرم، در حالت ویرایش
    router.push(`/students/create?id=${student.id}`)
  }

  async function onDelete (student) {
    if (!student?.id) return

    // فقط سمت کلاینت اجرا می‌شود
    if (typeof window !== 'undefined') {
      const yes = window.confirm(`دانشجو با شناسه ${student.id} حذف شود؟`)
      if (!yes) return
    }

    try {
      const res = await fetch(`${API_BASE}/api/students/${student.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[students] delete error', res.status, data)
        handleUnauthorized(res, data, router)
        if (typeof window !== 'undefined') {
          window.alert(data?.error || 'خطا در حذف دانشجو')
        }
        return
      }

      students.value = students.value.filter(s => s.id !== student.id)
      total.value = students.value.length
    } catch (err) {
      console.error('[students] delete exception', err)
      if (typeof window !== 'undefined') {
        window.alert('خطای نامشخصی در حذف دانشجو')
      }
    }
  }

  onMounted(() => {
    fetchStudents()
  })

  return {
    students,
    loading,
    total,
    filters,
    fromDateInput,
    toDateInput,
    fetchStudents,
    resetFilters,
    onCreate,
    onRefresh,
    goToProfile,
    goToEdit,
    onDelete,
    getInitials,
    formatNumber,
    formatDate,
  }
}

/**
 * ✅ فرم ساخت/ویرایش دانشجو
 * در create.vue با:
 *   const { form, ..., onSubmit } = useStudentForm()
 * استفاده می‌شود.
 */
export function useStudentForm () {
  const router = useRouter()
  const route = useRoute()

  const form = reactive({
    id: null,
    first_name: '',
    last_name: '',
    full_name: '',
    phone: '',
    national_code: '',
    email: '',
    note: '',
  })

  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  const isEdit = computed(() => {
    return !!(form.id || route.query.id || route.params.id)
  })

  function autoFullName () {
    const first = form.first_name || ''
    const last = form.last_name || ''
    form.full_name = `${first} ${last}`.trim()
  }

  async function loadForEdit () {
    const rawId = route.query.id || route.params.id
    const id = rawId ? Number(rawId) : null
    if (!id) return

    loading.value = true
    error.value = null

    try {
      const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[student-form] loadForEdit error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در خواندن اطلاعات دانشجو')
      }

      form.id = data.id
      form.first_name = data.first_name || ''
      form.last_name = data.last_name || ''
      form.full_name =
        data.full_name ||
        `${data.first_name || ''} ${data.last_name || ''}`.trim()
      form.phone = data.phone || ''
      form.national_code = data.national_code || ''
      form.email = data.email || ''
      form.note = data.note || data.notes || ''
    } catch (err) {
      console.error('[student-form] loadForEdit exception', err)
      error.value = err.message || 'خطا در خواندن اطلاعات دانشجو'
    } finally {
      loading.value = false
    }
  }

  async function onSubmit () {
    error.value = null
    saving.value = true

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        full_name: form.full_name,
        phone: form.phone,
        national_code: form.national_code,
        email: form.email,
        note: form.note,
      }

      const id = form.id || route.query.id || route.params.id
      const isUpdate = !!id

      const url = isUpdate
        ? `${API_BASE}/api/students/${id}`
        : `${API_BASE}/api/students`

      const res = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[student-form] save error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در ذخیره دانشجو')
      }

      await router.push('/students')
    } catch (err) {
      console.error('[student-form] onSubmit exception', err)
      error.value = err.message || 'خطای نامشخصی رخ داد'
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    if (route.query.id || route.params.id) {
      loadForEdit()
    }
  })

  return {
    form,
    loading,
    saving,
    error,
    isEdit,
    loadForEdit,
    onSubmit,
    autoFullName,
  }
}
// ✅ پروفایل دانشجو (برای صفحه [id].vue)
export function useStudentProfile () {
  const route = useRoute()

  const student = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const activeTab = ref('info') // اگر در پروفایل تب داری

  const id = computed(() => {
    const raw = route.params.id || route.query.id
    const num = Number(raw)
    return Number.isNaN(num) ? null : num
  })

  async function fetchStudent () {
    if (!id.value) return

    loading.value = true
    error.value = null

    try {
      const res = await fetch(`${API_BASE}/api/students/${id.value}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[student-profile] fetch error', res.status, data)
        throw new Error(data?.error || 'خطا در دریافت اطلاعات دانشجو')
      }

      // نرمال‌سازی داده
const first_name = (data.first_name || '').trim()
const last_name = (data.last_name || '').trim()

let full_name = (data.full_name || '').trim()
if (!full_name) {
  full_name = `${first_name} ${last_name}`.trim()
}

const avatar_path_raw = data.avatar_path || data.avatar || ''
const avatar_path = avatar_path_raw ? avatar_path_raw.trim() : null

let avatar_url = data.avatar_url || null
if (!avatar_url && avatar_path) {
  avatar_url = `/uploads/${avatar_path}`
}

const base = {
  ...data,
  id: data.id,
  first_name,
  last_name,
  full_name,
  avatar_path,
}

const withAvatar = {
  ...base,
  avatar_url: avatar_url || buildAvatarFromName(base),
}

student.value = withAvatar
    } catch (err) {
      console.error('[student-profile] fetch exception', err)
      error.value = err.message || 'خطای نامشخصی رخ داد'
    } finally {
      loading.value = false
    }
  }

  function setActiveTab (tab) {
    activeTab.value = tab
  }

  onMounted(() => {
    fetchStudent()
  })

  return {
    id,
    student,
    loading,
    error,
    activeTab,
    setActiveTab,
    reload: fetchStudent,
    getInitials,  // اگر تو پروفایل لازم داشته باشی
    formatDate,
    formatNumber,
  }
}
function handleUnauthorized (res, data, router) {
  if (res.status === 401 || data?.error === 'unauthorized') {
    const token = useCookie('ha_token', { path: '/' })
    token.value = null
    if (process.client) {
      router.push('/login')
    }
    throw new Error('unauthorized')
  }
}