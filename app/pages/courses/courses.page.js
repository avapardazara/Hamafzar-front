// app/pages/courses/courses.page.js
import { ref, reactive, computed, onMounted, watch } from 'vue'
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
    headers.Authorization = `Bearer ${token.value}`
  }
  return headers
}

function handleUnauthorized (res, data, router) {
  if (!res) return
  if (res.status === 401 || data?.error === 'unauthorized') {
    const token = useCookie('ha_token', { path: '/' })
    token.value = null
    if (process.client && router) {
      // مسیر لاگین ما /auth/login است
      router.push('/auth/login')
    }
    throw new Error('unauthorized')
  }
}

// ----------------------------
// Course normalizer
// ----------------------------
function normalizeCourse (raw) {
  if (!raw) return null

  const id = raw.id ?? raw.course_id ?? raw.pk ?? null
  const title = (raw.title || '').trim()

  // Mentor name (from related object or flat fields)
  let mentor_name =
    raw.mentor_name ||
    raw.mentor_full_name ||
    (raw.mentor &&
      (raw.mentor.full_name ||
        `${raw.mentor.first_name || ''} ${raw.mentor.last_name || ''}`.trim())) ||
    ''

  mentor_name = (mentor_name || '').trim() || null

  const status = (raw.status || '').toUpperCase() || 'ACTIVE'

  const cover_path = raw.cover_image || raw.cover_path || null
  let cover_url = raw.cover_url || null
  if (!cover_url && cover_path) {
    // بک‌اند معمولاً فایل‌ها را در /uploads قرار می‌دهد
    cover_url = `/uploads/${cover_path}`
  }

  return {
    ...raw,
    id,
    title,
    mentor_name,
    status,
    cover_path,
    cover_url
  }
}

// ----------------------------
// 1) لیست دوره‌ها
// ----------------------------
export function useCourses () {
  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const error = ref(null)
  const courses = ref([])
  const total = ref(0)

  const filters = reactive({
    q: (route.query.q || '').toString(),
    status: (route.query.status || '').toString()
  })

  const pagination = reactive({
    page: Number(route.query.page || 1),
    pageSize: 20
  })

  const hasRows = computed(() => courses.value.length > 0)

  function formatStatusLabel (s) {
    const v = (s || '').toUpperCase()
    if (v === 'ARCHIVED') return 'آرشیو'
    if (v === 'DRAFT') return 'پیش‌نویس'
    return 'فعال'
  }

  async function fetchCourses () {
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
        ? `${API_BASE}/api/courses?${query}`
        : `${API_BASE}/api/courses`

      console.log('[courses] fetch URL:', url)

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[courses] fetch error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در دریافت لیست دوره‌ها')
      }

      const items = data?.items || data?.courses || data?.results || []
      const normalized = (Array.isArray(items) ? items : [])
        .map(normalizeCourse)
        .filter(Boolean)

      courses.value = normalized
      total.value = data?.total ?? normalized.length
    } catch (err) {
      console.error('[courses] fetch exception', err)
      if (err.message !== 'unauthorized') {
        error.value = err?.message || 'خطا در دریافت لیست دوره‌ها'
      }
    } finally {
      loading.value = false
    }
  }

  function syncQueryToRoute () {
    const query = { ...route.query }

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
    fetchCourses()
  }

  function resetFilters () {
    filters.q = ''
    filters.status = ''
    pagination.page = 1
    syncQueryToRoute()
    fetchCourses()
  }

  function goToCreate () {
    router.push('/courses/create')
  }

  function goToEdit (course) {
    if (!course?.id) return
    // مثل دانشجو: صفحه create با id
    router.push(`/courses/create?id=${course.id}`)
  }

  function goToProfile (course) {
    if (!course?.id) return
    router.push(`/courses/${course.id}`)
  }

  async function archiveCourse (course) {
    if (!course?.id) return
    const ok = window.confirm(`آیا از بایگانی دوره «${course.title || course.id}» مطمئن هستید؟`)
    if (!ok) return

    try {
      const url = `${API_BASE}/api/courses/${course.id}`
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'ARCHIVED'
        })
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[courses] archive error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در بایگانی دوره')
      }

      // optimistic update
      courses.value = courses.value.map(c =>
        c.id === course.id ? { ...c, status: 'ARCHIVED' } : c
      )
    } catch (err) {
      console.error('[courses] archive exception', err)
      if (err.message !== 'unauthorized') {
        window.alert(err?.message || 'خطا در بایگانی دوره')
      }
    }
  }

  onMounted(() => {
    fetchCourses()
  })

  return {
    loading,
    error,
    courses,
    total,
    filters,
    pagination,
    hasRows,
    formatStatusLabel,
    fetchCourses,
    applyFilters,
    resetFilters,
    goToCreate,
    goToEdit,
    goToProfile,
    archiveCourse
  }
}

// ----------------------------
// 2) فرم ساخت / ویرایش دوره
// ----------------------------
export function useCourseForm () {
  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const submitting = ref(false)
  const error = ref(null)

  // 👇 لیست منتورها برای سلکت
  const mentors = ref([])

  const courseId = computed(() => {
    const raw = route.query.id
    return raw ? Number(raw) : null
  })
  const isEdit = computed(() => !!courseId.value)

  const form = reactive({
    title: '',
    mentor_id: '',
    capacity: '',
    status: 'ACTIVE',
    category: '',
    level: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    description: '',
    fee_per_student: '',
    mentor_share_percent: '',
    // اگر بعداً چیزی مثل schedule_type / weekly_days_json داشتی، اینجا اضافه کن
  })

  const coverFile = ref(null)
  const coverPreview = ref(null)

  function onCoverChange (evt) {
    const file = evt?.target?.files?.[0]
    coverFile.value = file || null
    if (file) {
      coverPreview.value = URL.createObjectURL(file)
    } else {
      coverPreview.value = null
    }
  }

  // -------- لیست منتورها از API --------
  async function loadMentors () {
    try {
      const res = await fetch(`${API_BASE}/api/mentors?status=ACTIVE`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[course-form] loadMentors error', res.status, data)
        handleUnauthorized(res, data, router)
        return
      }

      const items = data.items || data.mentors || []
      mentors.value = Array.isArray(items) ? items : []
    } catch (err) {
      console.error('[course-form] loadMentors exception', err)
    }
  }

  // -------- لود دوره برای ویرایش --------
  async function loadCourse () {
    if (!isEdit.value || !courseId.value) return

    loading.value = true
    error.value = null

    try {
      const url = `${API_BASE}/api/courses/${courseId.value}`
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[course-form] load error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در دریافت اطلاعات دوره')
      }

      const raw = data?.course || data
      const c = normalizeCourse(raw)

      form.title = c.title || ''
      // 👇 برای سلکت، mentor_id را به string نگه می‌داریم
      const mid = c.mentor_id || c.mentor?.id
      form.mentor_id = mid ? String(mid) : ''

      form.capacity = c.capacity ?? ''
      form.status = c.status || 'ACTIVE'
      form.category = c.category || ''
      form.level = c.level || ''
      form.start_date = c.start_date || c.start_date_gregorian || ''
      form.end_date = c.end_date || c.end_date_gregorian || ''
      form.start_time = c.start_time || ''
      form.end_time = c.end_time || ''
      form.description = c.description || ''
      form.fee_per_student = c.fee_per_student ?? ''
      form.mentor_share_percent = c.mentor_share_percent ?? ''

      coverPreview.value = c.cover_url || null
    } catch (err) {
      console.error('[course-form] load exception', err)
      if (err.message !== 'unauthorized') {
        error.value = err?.message || 'خطا در دریافت اطلاعات دوره'
      }
    } finally {
      loading.value = false
    }
  }

  // -------- ارسال فرم (ساخت/ویرایش) --------
  async function onSubmit () {
    submitting.value = true
    error.value = null

    try {
      const isUpdate = isEdit.value && courseId.value
      const url = isUpdate
        ? `${API_BASE}/api/courses/${courseId.value}`
        : `${API_BASE}/api/courses`
      const method = isUpdate ? 'PUT' : 'POST'

      const fd = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          fd.append(key, value)
        }
      })

      if (coverFile.value) {
        fd.append('cover_image', coverFile.value)
      }

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(), // برای FormData Content-Type رو ست نمی‌کنیم
        },
        credentials: 'include',
        body: fd,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[course-form] submit error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در ذخیره اطلاعات دوره')
      }

      const id = data?.id || data?.course?.id || courseId.value
      if (id) {
        router.push(`/courses/${id}`)
      } else {
        router.push('/courses')
      }
    } catch (err) {
      console.error('[course-form] submit exception', err)
      if (err.message !== 'unauthorized') {
        error.value = err?.message || 'خطا در ذخیره اطلاعات دوره'
      }
    } finally {
      submitting.value = false
    }
  }

  function goBack () {
    router.push('/courses')
  }

  onMounted(() => {
    // اول لیست منتورها
    loadMentors()
    // اگر در حالت ویرایش هستیم، اطلاعات دوره رو هم بگیر
    if (isEdit.value) {
      loadCourse()
    }
  })

  return {
    loading,
    submitting,
    error,
    form,
    isEdit,
    coverPreview,
    onCoverChange,
    onSubmit,
    goBack,
    mentors,   // 👈 خروجی برای فرم
  }
}

// ----------------------------
// 3) پروفایل دوره + تب‌ها
// ----------------------------
export function useCourseProfile () {
  const route = useRoute()
  const router = useRouter()

  const loading = ref(false)
  const error = ref('')
  const course = ref(null)
  const sessions = ref([])
  const students = ref([])
  const finance = ref(null)

  async function fetchCourse () {
    loading.value = true
    error.value = ''

    const id = route.params.id

    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[course-profile] detail error', res.status, data)
        handleUnauthorized(res, data, router)
        throw new Error(data?.error || 'خطا در دریافت اطلاعات دوره')
      }

      // بک‌اند شما ممکنه { course, sessions, students, finance } بده
      const rawCourse = data.course || data
      course.value = normalizeCourse(rawCourse)
      students.value = data.students || []
      finance.value = data.finance || null
    } catch (err) {
      console.error('[course-profile] fetchCourse exception', err)
      if (err.message !== 'unauthorized') {
        error.value = err.message || 'خطایی رخ داد'
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchSessions () {
    const id = route.params.id
    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}/sessions`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('[course-profile] sessions error', res.status, data)
        handleUnauthorized(res, data, router)
        return
      }

      sessions.value = data.items || data.sessions || []
    } catch (err) {
      console.error('[course-profile] fetchSessions exception', err)
    }
  }

  async function reloadAll () {
    await Promise.all([
      fetchCourse(),
      fetchSessions()
    ])
  }

  onMounted(() => {
    reloadAll()
  })

  watch(
    () => route.params.id,
    () => {
      reloadAll()
    }
  )

  // ---- formatterها برای پروفایل.vue ----
  function formatDate (val) {
    if (!val) return '—'
    try {
      // ISO → فقط تاریخ
      if (typeof val === 'string' && val.includes('T')) {
        return val.split('T')[0]
      }
      return String(val)
    } catch {
      return String(val)
    }
  }

  function formatNumber (n) {
    if (n == null || n === '') return '۰'
    try {
      return Number(n).toLocaleString('fa-IR')
    } catch {
      return String(n)
    }
  }

  function goBack () {
    router.push('/courses')
  }

  function goToEdit () {
    const id = route.params.id || course.value?.id
    if (!id) return
    // مثل بقیه: از صفحه create با id استفاده می‌کنیم
    router.push(`/courses/create?id=${id}`)
  }

  return {
    loading,
    error,
    course,
    sessions,
    students,
    finance,

    formatDate,
    formatNumber,
    goBack,
    goToEdit,
    reloadAll
  }
}
