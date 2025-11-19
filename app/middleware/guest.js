export default defineNuxtRouteMiddleware(() => {
  const user = useState('ha_user')

  if (user.value) {
    return navigateTo('/dashboard', { replace: true })
  }
})
