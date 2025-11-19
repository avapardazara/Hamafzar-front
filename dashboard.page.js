// app/pages/dashboard.page.js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './app/composables/useAuth' // یک پله بالاتر نسبت به pages

export default function useDashboard () {
  const router = useRouter()
  const { user, clearUser } = useAuth()

  // سایدبار
  const sidebarOpen = ref(true)

  const navItems = [
    { key: 'dashboard', label: 'داشبورد', icon: '📊', badge: null },
    { key: 'courses', label: 'دوره‌ها', icon: '📚', badge: '۴' },
    { key: 'students', label: 'دانشجویان', icon: '👨‍🎓', badge: '۱۲' },
    { key: 'mentors', label: 'منتورها', icon: '👨‍🏫', badge: '۳' },
    { key: 'finance', label: 'مالی و اقساط', icon: '💳', badge: null }
  ]

  const activeItem = ref('dashboard')

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const selectNav = (key) => {
    activeItem.value = key
    // اینجا بعداً می‌تونی روت‌های واقعی رو وصل کنی
    // مثلا:
    // if (key === 'courses') router.push('/courses')
  }

  // آمار کارت‌ها (فعلاً داده‌های فیک برای UI)
  const stats = ref([
    {
      key: 'students',
      label: 'دانشجویان فعال',
      value: '۴۲',
      delta: '+۵ نفر نسبت به هفته قبل',
      trend: 'up',
      icon: '👨‍🎓'
    },
    {
      key: 'courses',
      label: 'دوره‌های در حال برگزاری',
      value: '۶',
      delta: '۲ دوره به‌زودی شروع می‌شود',
      trend: 'up',
      icon: '📚'
    },
    {
      key: 'sessions',
      label: 'جلسات امروز',
      value: '۹',
      delta: '۳ جلسه کنسل شده',
      trend: 'down',
      icon: '📅'
    },
    {
      key: 'finance',
      label: 'وضعیت پرداخت‌ها',
      value: '۸۷٪',
      delta: '۱۲ قسط عقب‌افتاده',
      trend: 'down',
      icon: '💰'
    }
  ])

  // جلسات امروز (داده‌ی نمونه)
  const todaySessions = ref([
    {
      id: 1,
      title: 'جلسه تحلیل نیازمندی‌های دوره Vue.js',
      time: '۱۰:۳۰ - ۱۲:۰۰',
      mentor: 'مهندس رضایی',
      type: 'online'
    },
    {
      id: 2,
      title: 'کارگاه Scrum و مدیریت پروژه',
      time: '۱۳:۰۰ - ۱۵:۰۰',
      mentor: 'خانم احمدی',
      type: 'offline'
    },
    {
      id: 3,
      title: 'کلاس معماری بک‌اند Flask',
      time: '۱۶:۰۰ - ۱۸:۰۰',
      mentor: 'مهندس کریمی',
      type: 'online'
    }
  ])

  // پرداخت‌های اخیر
  const recentPayments = ref([
    {
      id: 1,
      student: 'علی اکبری',
      course: 'Python پیشرفته',
      amount: '۳,۲۰۰,۰۰۰ تومان',
      status: 'paid',
      statusLabel: 'پرداخت‌شده'
    },
    {
      id: 2,
      student: 'سارا محمدی',
      course: 'Vue.js + Nuxt',
      amount: '۲,۸۵۰,۰۰۰ تومان',
      status: 'pending',
      statusLabel: 'در انتظار پرداخت'
    },
    {
      id: 3,
      student: 'مهدی جوادی',
      course: 'الگوریتم و ساختمان داده',
      amount: '۲,۵۰۰,۰۰۰ تومان',
      status: 'overdue',
      statusLabel: 'عقب‌افتاده'
    }
  ])

  // نام کاربر از state لاگین
  const userName = computed(() => {
    const u = user.value || {}
    // بسته به مدل User ات می‌تونی این رو عوض کنی
    return u.full_name || u.username || u.phone_number || 'کاربر هم‌افزار'
  })

  const userInitials = computed(() => {
    const name = userName.value.trim()
    if (!name) return 'هـ'
    const parts = name.split(' ')
    if (parts.length === 1) {
      return parts[0].charAt(0)
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  })

  // بروزرسانی (فعلاً فقط انیمیشن/احساس)
  const refresh = () => {
    // اینجا بعداً می‌تونی ریکوئست واقعی بزنی
    console.log('Refreshing dashboard data...')
  }

  const logout = async () => {
    try {
      // اگر بعداً API logout ساختیم:
      // await fetch('http://localhost:5000/auth/api/logout', {
      //   method: 'POST',
      //   credentials: 'include'
      // })
    } catch (e) {
      console.error(e)
    } finally {
      clearUser()
      router.push('/auth/login')
    }
  }

  return {
    sidebarOpen,
    navItems,
    activeItem,
    stats,
    todaySessions,
    recentPayments,
    userName,
    userInitials,
    toggleSidebar,
    selectNav,
    refresh,
    logout
  }
}
