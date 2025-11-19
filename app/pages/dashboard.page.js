// app/pages/dashboard.page.js
import { ref } from 'vue'

export default function useDashboard () {
  // آمار کارت‌ها
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

  // جلسات امروز
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

  const refresh = () => {
    console.log('Refreshing dashboard data...')
  }

  return {
    stats,
    todaySessions,
    recentPayments,
    refresh
  }
}
