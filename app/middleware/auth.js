export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('ha_token').value
  if (!token) {
    const redirect = encodeURIComponent(to.fullPath || '/dashboard')
    return navigateTo(`/auth/login?redirect=${redirect}`, { replace: true })
  }
})