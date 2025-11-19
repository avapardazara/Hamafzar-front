<template>
  <div class="haf-shell" dir="rtl">
    <!-- سایدبار ثابت -->
    <aside class="haf-shell__sidebar">
      <HafSidebar />
    </aside>

    <!-- محتوای صفحه (داشبورد، دانشجو، ...) -->
    <main class="haf-shell__main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import HafSidebar from '@/components/layout/HafSidebar.vue'
</script>

<style scoped>
.haf-shell {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
  background: radial-gradient(circle at top left, #f9fafb, #e5f2ff);
}

/* ستون سایدبار */
.haf-shell__sidebar {
  min-height: 100vh;
}

/* محتوای اصلی */
.haf-shell__main {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* موبایل: سایدبار تمام عرض بالا قرار می‌گیرد */
@media (max-width: 768px) {
  .haf-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .haf-shell__sidebar {
    min-height: auto;
  }

  .haf-shell__main {
    padding: 14px 12px 20px;
  }
}
</style>
