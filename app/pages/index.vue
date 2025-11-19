<template>
  <!-- این صفحه فقط برای ریدایرکت استفاده می‌شود -->
  <div />
</template>

<script setup>
import { useState, navigateTo } from '#app'

definePageMeta({
  layout: false, // سایدبار و داشبورد رو اینجا نمی‌خوایم
})

const user = useState('ha_user', () => null)

// سینک با localStorage (برای وقتی که صفحه رفرش می‌شود)
if (process.client) {
  if (!user.value) {
    const raw = window.localStorage.getItem('ha_user')
    if (raw) {
      try {
        user.value = JSON.parse(raw)
      } catch (e) {
        console.warn('Invalid ha_user in localStorage', e)
      }
    }
  }

  // اگر لاگین است → بفرست داشبورد
  if (user.value) {
    navigateTo('/dashboard', { replace: true })
  } else {
    // اگر لاگین نیست → بفرست صفحه لاگین با redirect به داشبورد
    navigateTo('/auth/login?redirect=/dashboard', { replace: true })
  }
}
</script>
