<template>
  <div class="haf-dashboard" dir="rtl">
    <!-- سایدبار ثابت در همه صفحات -->
    <HafSidebar />

    <!-- محتوای صفحه‌ها (داشبورد، دوره‌ها، مالی و ...) -->
    <main class="haf-main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import HafSidebar from '@/components/layout/HafSidebar.vue'
</script>
