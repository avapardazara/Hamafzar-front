// composables/useAuth.js
// حالت ساده و تمیز برای نگه‌داشتن وضعیت کاربر در کل اپ

export const useAuth = () => {
  // useState در Nuxt 3 به طور خودکار ایمپورت می‌شود
  const user = useState('user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const setUser = (u) => {
    user.value = u
  }

  const clearUser = () => {
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
  }
}
