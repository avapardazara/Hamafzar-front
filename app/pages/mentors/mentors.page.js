// app/pages/mentors/mentors.page.js
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCookie } from '#app'

const API_BASE = 'http://localhost:5000'

// ----------------------------
// Auth helpers
// ----------------------------
function getAuthHeaders () {
  const token = useCookie('ha_token', { path: '/' })
  const headers = {}
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`
  }
  return headers
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

// ----------------------------
// Avatar helpers
// ----------------------------
function buildAvatarFromName (raw) {
  const fullName = (raw.full_name ||
    `${raw.first_name || ''} ${raw.last_name || ''}` ||
    raw.name ||
    ''
  ).trim()

  if (!fullName) {
    const email = (raw.email || '').trim()
    return {
      type: 'initials',
      initials: email ? email[0].toUpperCase() : 'M',
      bg: '#0f172a',
      color: '#e5e7eb'
    }
  }

  const parts = fullName.split(/\s+/)
  const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
  return {
    type: 'initials',
    initials: initials.toUpperCase(),
    bg: '#4f46e5',
    color: '#e5e7eb'
  }
}

function normalizeMentor (raw) {
  if (!raw) return null

  const id = raw.id ?? raw.mentor_id ?? raw.pk ?? null

  const first_name = (raw.first_name || '').trim()
  const last_name = (raw.last_name || '').trim()

  let full_name = (raw.full_name || '').trim()
  if (!full_name) {
    full_name = `${first_name} ${last_name}`.trim()
  }

  const avatar_path_raw = raw.avatar_path || raw.avatar || ''
  const avatar_path = avatar_path_raw ? avatar_path_raw.trim() : null

  let avatar_url = raw.avatar_url || null
  if (!avatar_url && avatar_path) {
    avatar_url = `/uploads/${avatar_path}`
  }

  const base = {
    ...raw,
    id,
    first_name,
    last_name,
    full_name,
    avatar_path
  }

  if (!avatar_url) {
    const avatarMeta = buildAvatarFromName(base)
    return {
      ...base,
      avatar_url: null,
      avatar_meta: avatarMeta
    }
  }

  return {
    ...base,
    avatar_url
  }
}

// ----------------------------
// 1) لیست منتورها
// ----------------------------
export function useMentors () {
  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const error = ref(null)
  const mentors = ref([])
  const total = ref(0)

  const filters = reactive({
    q: (route.query.q || '').toString(),
    status: (route.query.status || '').toString()
  })

  const pagination = reactive({
    page: Number(route.query.page || 1),
    pageSize: 20
  })

  const hasRows = computed(() => mentors.value.length > 0)
function goToEdit (mentor) {
  if (!mentor?.id) return
  router.push(`/mentors/create?id=${mentor.id}`)
}
  async function fetchMentors () {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()

      if (filters.q) params.set('q', filters.q)
      if (filters.status) params.set('status', filters.status)
      params.set('page', String(pagination.page))
      params.set('per_page', String(pagination.pageSize))

      const query = params.toString()
      const url = query
        ? `${API_BASE}/api/mentors?${query}`
        : `${API_BASE}/api/mentors`

      console.log('[mentors] fetch URL:', url)

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[mentors] fetch error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در دریافت لیست منتورها')
      }

      const items = data?.items || data?.mentors || data?.results || []

      const normalized = (Array.isArray(items) ? items : [])
        .map(normalizeMentor)
        .filter(Boolean)

      mentors.value = normalized
      total.value = data?.total ?? normalized.length
    } catch (err) {
      console.error('[mentors] fetch exception', err)
      if (err.message !== 'unauthorized') {
        error.value = err?.message || 'خطا در دریافت لیست منتورها'
      }
    } finally {
      loading.value = false
    }
  }

  function syncQueryToRoute () {
    const query = {
      ...route.query
    }

    if (filters.q) query.q = filters.q
    else delete query.q

    if (filters.status) query.status = filters.status
    else delete query.status

    query.page = String(pagination.page)

    router.replace({ query }).catch(() => {})
  }

  function applyFilters () {
    pagination.page = 1
    syncQueryToRoute()
    fetchMentors()
  }

  function resetFilters () {
    filters.q = ''
    filters.status = ''
    pagination.page = 1
    syncQueryToRoute()
    fetchMentors()
  }

  function goToCreate () {
    router.push('/mentors/create')
  }

  function goToProfile (mentor) {
    if (!mentor?.id) return
    console.log('[mentors] goToProfile', mentor.id)
    router.push(`/mentors/${mentor.id}`)
  }

  async function softDeleteMentor (mentor) {
    if (!mentor?.id) return
    const ok = window.confirm(`آیا از غیرفعال کردن منتور «${mentor.full_name || mentor.id}» مطمئن هستید؟`)
    if (!ok) return

    try {
      const url = `${API_BASE}/api/mentors/${mentor.id}`
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          is_deleted: true,
          status: mentor.status || 'inactive'
        })
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[mentors] soft delete error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در غیرفعال کردن منتور')
      }

      mentors.value = mentors.value.filter(m => m.id !== mentor.id)
      total.value = Math.max(0, total.value - 1)
    } catch (err) {
      console.error('[mentors] softDelete exception', err)
      if (err.message !== 'unauthorized') {
        window.alert(err?.message || 'خطا در غیرفعال کردن منتور')
      }
    }
  }

  onMounted(() => {
    fetchMentors()
  })

  return {
    loading,
    error,
    mentors,
    total,
    filters,
    pagination,
    hasRows,
    fetchMentors,
    applyFilters,
    resetFilters,
    goToCreate,
    goToProfile,
    softDeleteMentor,
    goToEdit, 
  }
}

// ----------------------------
// 2) فرم ساخت / ویرایش منتور
//    (create.vue + ?id برای ویرایش)
// ----------------------------
export function useMentorForm () {
  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const submitting = ref(false)
  const error = ref(null)

  const mentorId = computed(() => {
    const raw = route.query.id
    return raw ? Number(raw) : null
  })
  const isEdit = computed(() => !!mentorId.value)

  const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    national_code: '',
    address: '',
    bio: '',
    note: '',
    // حساب کاربری (اختیاری)
    acc_create: false,
    acc_username: '',
    acc_email: '',
    acc_password: '',
    acc_password2: ''
  })

  const avatarFile = ref(null)
  const avatarPreview = ref(null)

  function onAvatarChange (evt) {
    const file = evt?.target?.files?.[0]
    avatarFile.value = file || null
    if (file) {
      avatarPreview.value = URL.createObjectURL(file)
    } else {
      avatarPreview.value = null
    }
  }

  async function loadMentor () {
    if (!isEdit.value || !mentorId.value) return

    loading.value = true
    error.value = null

    try {
      const url = `${API_BASE}/api/mentors/${mentorId.value}`
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[mentor-form] load error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در دریافت اطلاعات منتور')
      }

      const raw = data?.mentor || data
      const m = normalizeMentor(raw)

      form.first_name = m.first_name || ''
      form.last_name = m.last_name || ''
      form.email = m.email || ''
      form.phone = m.phone || ''
      form.national_code = m.national_code || ''
      form.address = m.address || ''
      form.bio = m.bio || ''
      form.note = m.note || m.notes || ''

      // اگر بک‌اند فیلدهای حساب را برگرداند (اختیاری)
      form.acc_username = m.username || ''
      form.acc_email = m.login_email || m.email || ''

      avatarPreview.value = m.avatar_url || null
    } catch (err) {
      console.error('[mentor-form] load exception', err)
      if (err.message !== 'unauthorized') {
        error.value = err?.message || 'خطا در دریافت اطلاعات منتور'
      }
    } finally {
      loading.value = false
    }
  }

  async function onSubmit () {
    submitting.value = true
    error.value = null

    try {
      const isUpdate = isEdit.value && mentorId.value
      const url = isUpdate
        ? `${API_BASE}/api/mentors/${mentorId.value}`
        : `${API_BASE}/api/mentors`
      const method = isUpdate ? 'PUT' : 'POST'

      const fd = new FormData()
      const basePayload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        national_code: form.national_code,
        address: form.address,
        bio: form.bio,
        note: form.note
      }

      Object.entries(basePayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value)
        }
      })

      // حساب کاربری – شبیه فرم اصلی
      if (!isUpdate && form.acc_create) {
        fd.append('acc_create', '1')
        fd.append('acc_username', form.acc_username || '')
        fd.append('acc_email', form.acc_email || form.email || '')
        fd.append('acc_password', form.acc_password || '')
        fd.append('acc_password2', form.acc_password2 || '')
      }

      if (avatarFile.value) {
        fd.append('avatar', avatarFile.value)
      }

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders()
          // مهم: Content-Type رو برای FormData ست نکن
        },
        credentials: 'include',
        body: fd
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[mentor-form] submit error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در ذخیره اطلاعات منتور')
      }

      const id = data?.id || data?.mentor?.id || mentorId.value
      if (id) {
        router.push(`/mentors/${id}`)
      } else {
        router.push('/mentors')
      }
    } catch (err) {
      console.error('[mentor-form] submit exception', err)
      if (err.message !== 'unauthorized') {
        error.value = err?.message || 'خطا در ذخیره اطلاعات منتور'
      }
    } finally {
      submitting.value = false
    }
  }

  function goBack () {
    router.push('/mentors')
  }

  onMounted(() => {
    if (isEdit.value) {
      loadMentor()
    }
  })

  return {
    loading,
    submitting,
    error,
    form,
    isEdit,
    mentorId,
    avatarPreview,
    onAvatarChange,
    onSubmit,
    goBack
  }
}

// ----------------------------
// 3) پروفایل منتور + تب‌ها
// ----------------------------
export function useMentorProfile () {
  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const error = ref(null)

  const mentor = ref(null)
  const stats = ref(null)
  const finance = ref(null)
  const courses = ref([])

  const mentorId = computed(() => {
    const raw = route.params.id
    return raw ? Number(raw) : null
  })

  function formatNumber (value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '0'
    }
    return Number(value).toLocaleString('fa-IR')
  }

  function formatDate (value) {
    if (!value) return '—'
    try {
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return '—'
      return d.toLocaleDateString('fa-IR')
    } catch {
      return '—'
    }
  }

  function getInitials (m) {
    if (!m) return 'M'
    const raw = m.full_name ||
      `${m.first_name || ''} ${m.last_name || ''}` ||
      m.name ||
      ''
    const name = raw.trim()
    if (!name) return 'M'
    const parts = name.split(/\s+/)
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  }

  function goBack () {
    router.push('/mentors')
  }

  function goToEdit () {
    if (!mentor.value?.id) return
    router.push(`/mentors/create?id=${mentor.value.id}`)
  }

  async function fetchProfile () {
    if (!mentorId.value) {
      error.value = 'منتور پیدا نشد'
      return
    }

    loading.value = true
    error.value = null

    try {
      const url = `${API_BASE}/api/mentors/${mentorId.value}`
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[mentor-profile] fetch error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در دریافت پروفایل منتور')
      }

      const rawMentor = data?.mentor || data
      mentor.value = normalizeMentor(rawMentor)

      stats.value = data?.stats || null
      finance.value = data?.finance || data?.totals || null
      courses.value = data?.courses || data?.taught || []
    } catch (err) {
      console.error('[mentor-profile] fetch exception', err)
      if (err.message !== 'unauthorized') {
        error.value = err?.message || 'خطا در دریافت پروفایل منتور'
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchProfile()
  })

  return {
    loading,
    error,
    mentor,
    stats,
    finance,
    courses,
    mentorId,
    formatNumber,
    formatDate,
    getInitials,
    goBack,
    goToEdit
  }
}
