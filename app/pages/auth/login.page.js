// app/pages/auth/login.page.js
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCookie } from '#app'

export default function useLogin () {
  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const showPass = ref(false)

  const form = reactive({
    username: '',
    password: ''
  })

  function togglePass () {
    showPass.value = !showPass.value
  }

  async function onSubmit () {
    if (!form.username || !form.password) {
      alert('نام‌کاربری و رمز عبور را وارد کنید')
      return
    }

    loading.value = true

    try {
      const res = await fetch('http://localhost:5000/auth/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',              // 👈 خیلی مهم: کوکی سشن رو ست کن
  body: JSON.stringify({
    username: form.username,
    password: form.password
  })
})

      let data = {}
try {
  data = await res.json()
} catch {
  data = {}
}

if (!res.ok || data.error || data.ok === false) {
  const msg =
    data.message ||
    data.error ||
    `ورود ناموفق بود (کد ${res.status})`
  throw new Error(msg)
}

      // ✅ اگر توکن تو body برگشته، بریز تو کوکی ha_token
if (data.access_token) {
  const token = useCookie('ha_token', { path: '/' })
  token.value = data.access_token
}

console.log('[LOGIN SUCCESS]', data)

      // مسیر redirect از query یا پیش‌فرض /dashboard
      const redirect =
        typeof route.query.redirect === 'string'
          ? route.query.redirect
          : '/dashboard'

      await router.push(redirect)
    } catch (err) {
      console.error('[LOGIN ERROR]', err)
      alert(err.message || 'خطا در ارتباط با سرور')
    } finally {
      loading.value = false
    }
  }

  return {
    form,
    loading,
    showPass,
    togglePass,
    onSubmit
  }
}
