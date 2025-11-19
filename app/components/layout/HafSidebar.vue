<template>
  <aside
    class="haf-sidebar"
    :class="[{ 'haf-sidebar--collapsed': collapsed }]"
    dir="rtl"
  >
    <!-- هدر لوگو + دکمه جمع کردن -->
    <header class="haf-sidebar__header">
      <div class="haf-logo" v-if="!collapsed">
        <div class="haf-logo__icon">H</div>
        <div class="haf-logo__text">
          <div class="haf-logo__title">Ham-Afzar</div>
          <div class="haf-logo__subtitle">پنل مدیریتی هم‌افزار</div>
        </div>
      </div>

      <button class="haf-sidebar__toggle" @click="toggleCollapse">
        <span v-if="collapsed">»</span>
        <span v-else>«</span>
      </button>
    </header>

    <!-- ناوبری -->
    <nav class="haf-sidebar__nav">
      <button
        v-for="item in navItems"
        :key="item.to"
        class="haf-nav-item"
        :class="{ 'haf-nav-item--active': route.path === item.to }"
        @click="go(item.to)"
        :title="collapsed ? item.label : ''"
      >
        <span class="haf-nav-item__icon">
          {{ item.icon }}
        </span>

        <!-- در حالت collapsed، متن رو نشون نده -->
        <span v-if="!collapsed" class="haf-nav-item__label">
          {{ item.label }}
        </span>

        <span
          v-if="!collapsed && item.badge"
          class="haf-nav-item__badge"
        >
          {{ item.badge }}
        </span>
      </button>
    </nav>

    <!-- فوتر: اطلاعات کاربر + خروج -->
    <footer class="haf-sidebar__footer">
      <div class="haf-user-mini">
        <div class="haf-user-mini__avatar">
          {{ userInitials }}
        </div>

        <div v-if="!collapsed" class="haf-user-mini__info">
          <div class="haf-user-mini__name">
            {{ userName }}
          </div>
          <div class="haf-user-mini__role">
            {{ userRole }}
          </div>
        </div>
      </div>

      <button
        class="haf-sidebar__logout-btn haf-btn--danger"
        type="button"
        @click="logout"
        :title="collapsed ? 'خروج' : ''"
      >
        خروج
      </button>
    </footer>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useState, useCookie, navigateTo } from '#app'

const router = useRouter()
const route = useRoute()

// وضعیت جمع شدن/باز بودن سایدبار
const collapsed = ref(false)
function toggleCollapse () {
  collapsed.value = !collapsed.value
}

// اطلاعات کاربر از state (همونی که تو لاگین ست کردیم)
const user = useState('ha_user', () => null)

const userName = computed(() =>
  user.value?.full_name ||
  user.value?.username ||
  'کاربر هم‌افزار'
)

const userRole = computed(() =>
  user.value?.role_name || 'کاربر سیستم'
)

const userInitials = computed(() => {
  const n = userName.value.trim()
  if (!n) return 'ح'
  return n[0]
})

// آیتم‌های منوی سایدبار — این‌جا لینک‌ها رو آپدیت کن
const navItems = [
  {
    to: '/dashboard',
    label: 'داشبورد',
    icon: '📊',
  },
  {
    to: '/students',
    label: 'دانشجوها',
    icon: '🎓',
  },
    {
    to: '/mentors',
    label: 'اساتید',
    icon: '👨‍🏫',
  },
  {
    to: '/courses',
    label: 'دوره‌ها',
    icon: '📚',
  },
  {
    to: '/finance',
    label: 'مالی و اقساط',
    icon: '💳',
  },
]

function go (to) {
  if (route.path === to) return
  router.push(to)
}

/**
 * 🔴 خروج: پاک کردن همه‌ی نشانه‌های لاگین
 * - پاک کردن state
 * - پاک کردن localStorage
 * - (در صورت وجود) پاک کردن کوکی ha_token
 * - ریدایرکت به صفحه لاگین
 */
function logout () {
  // پاک کردن state
  user.value = null

  // پاک کردن localStorage
  if (process.client) {
    try {
      window.localStorage.removeItem('ha_user')
    } catch (e) {
      console.warn('Cannot access localStorage', e)
    }
  }

  // اگر کوکی توکن هم داری، این‌جا خالی‌اش کن (اختیاری اما خوبه)
  const token = useCookie('ha_token', { path: '/' })
  token.value = null

  // ریدایرکت به صفحه لاگین
  navigateTo('/auth/login?redirect=/dashboard', { replace: true })
}
</script>

<style scoped>
/* استایل‌هایی که خودت دادی + منطق collapsed */

.haf-sidebar {
  width: 260px;
  background: linear-gradient(180deg, #002228 0%, #041826 45%, #035665 100%);
  color: #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 16px 14px;
  gap: 18px;
  position: sticky;
  inset-block-start: 0;
  inset-inline-start: 0;
  height: 100vh;
  box-sizing: border-box;
}

.haf-sidebar--collapsed {
  width: 70px;
}

/* هدر */
.haf-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.haf-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.haf-logo__icon {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #34d399, #059669, #ffffff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: white;
}

.haf-logo__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.haf-logo__title {
  font-weight: 700;
  font-size: 15px;
}

.haf-logo__subtitle {
  font-size: 11px;
  color: #9ca3af;
}

.haf-sidebar__toggle {
  border: none;
  outline: none;
  border-radius: 999px;
  width: 26px;
  height: 26px;
  background: rgba(15, 23, 42, 0.8);
  color: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ناوبری سایدبار */
.haf-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.haf-nav-item {
  border: none;
  outline: none;
  background: transparent;
  color: #cbd5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease, color 0.15s ease;
  font-size: 13px;
}

.haf-nav-item__icon {
  font-size: 16px;
}

.haf-nav-item__label {
  flex: 1;
  text-align: right;
}

.haf-nav-item__badge {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  font-size: 11px;
}

.haf-nav-item:hover {
  background: rgba(15, 23, 42, 0.8);
  transform: translateY(-1px);
}

.haf-nav-item--active {
  background: linear-gradient(90deg, #059669, #10b981);
  color: white;
}

/* فوتر سایدبار */
.haf-sidebar__footer {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(55, 65, 81, 0.8);
}

.haf-user-mini {
  display: flex;
  align-items: center;
  gap: 8px;
}

.haf-user-mini__avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #f9fafb;
  color: #111827;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.haf-user-mini__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.haf-user-mini__name {
  font-size: 13px;
}

.haf-user-mini__role {
  font-size: 11px;
  color: #9ca3af;
}

.haf-sidebar__logout-btn {
  margin-top: 10px;
  width: 100%;
  border-radius: 999px;
  border: none;
  font-size: 12px;
  padding: 7px 14px;
  cursor: pointer;
}

/* دکمه خروج از theme استفاده می‌کند اگر بخوای */
.haf-btn--danger {
  background: #ef4444;
  color: #fff;
}

/* ریسپانسیو سایدبار */
@media (max-width: 768px) {
  .haf-sidebar {
    position: relative;
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding-inline: 10px;
    height: auto;
  }

  .haf-sidebar--collapsed {
    width: 100%;
  }

  .haf-sidebar__nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .haf-sidebar__footer {
    border-top: none;
    margin-top: 0;
    margin-right: auto;
  }

  .haf-sidebar__logout-btn {
    width: auto;
    padding-inline: 12px;
    font-size: 11px;
  }
}
</style>
