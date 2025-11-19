export function useAuth () {
  const user = useState('ha_user', () => null)
  const token = useCookie('ha_token', { path: '/' })

  const isLoggedIn = computed(() => Boolean(user.value && token.value))

  function logout () {
    user.value = null
    token.value = null
    navigateTo('/auth/login?redirect=/dashboard', { replace: true })
  }

  function getAuthHeaders () {
    return token.value
      ? { Authorization: `Bearer ${token.value}` }
      : {}
  }

  return {
    user,
    token,
    isLoggedIn,
    logout,
    getAuthHeaders
  }
}
