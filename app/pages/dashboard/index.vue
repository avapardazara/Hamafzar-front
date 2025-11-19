<template>
  <section class="haf-main__content">
    <!-- هدر داخلی داشبورد (نه هدر سایت) -->
    <header class="haf-main__header">
      <div>
        <h1 class="haf-main__title">داشبورد</h1>
        <p class="haf-main__subtitle">
          وضعیت کلی دوره‌ها، دانشجویان و پرداخت‌ها را یکجا ببین.
        </p>
      </div>

      <div class="haf-main__actions">
        <button class="haf-btn haf-btn--ghost" @click="refresh">
          🔄 بروزرسانی
        </button>
      </div>
    </header>

    <!-- کارت‌های آمار -->
    <section class="haf-section">
      <div class="haf-grid haf-grid--stats">
        <article
          v-for="stat in stats"
          :key="stat.key"
          class="haf-card haf-stat-card"
        >
          <div class="haf-stat-card__header">
            <span class="haf-stat-card__icon">{{ stat.icon }}</span>
            <span
              :class="[
                'haf-stat-card__chip',
                `haf-stat-card__chip--${stat.trend}`
              ]"
            >
              {{ stat.trend === 'up' ? 'رو به رشد' : 'کاهش' }}
            </span>
          </div>
          <div class="haf-stat-card__body">
            <div class="haf-stat-card__label">{{ stat.label }}</div>
            <div class="haf-stat-card__value">{{ stat.value }}</div>
            <div class="haf-stat-card__delta">
              {{ stat.delta }}
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- دو ستون: جلسات امروز / فعالیت‌های مالی -->
    <section class="haf-section haf-grid haf-grid--two">
      <!-- جلسات امروز -->
      <article class="haf-card">
        <header class="haf-card__header">
          <h2 class="haf-card__title">جلسات امروز</h2>
          <span class="haf-card__badge">{{ todaySessions.length }}</span>
        </header>
        <ul class="haf-list">
          <li
            v-for="session in todaySessions"
            :key="session.id"
            class="haf-list-item"
          >
            <div class="haf-list-item__main">
              <div class="haf-list-item__title">{{ session.title }}</div>
              <div class="haf-list-item__meta">
                <span>{{ session.time }}</span>
                <span>منتور: {{ session.mentor }}</span>
              </div>
            </div>
            <span
              :class="[
                'haf-chip',
                session.type === 'online'
                  ? 'haf-chip--success'
                  : 'haf-chip--neutral'
              ]"
            >
              {{ session.type === 'online' ? 'آنلاین' : 'حضوری' }}
            </span>
          </li>
        </ul>
      </article>

      <!-- فعالیت‌های اخیر مالی -->
      <article class="haf-card">
        <header class="haf-card__header">
          <h2 class="haf-card__title">فعالیت‌های اخیر مالی</h2>
        </header>
        <div class="haf-table">
          <div class="haf-table__head">
            <span>دانشجو</span>
            <span>دوره</span>
            <span>مبلغ</span>
            <span>وضعیت</span>
          </div>
          <div
            v-for="payment in recentPayments"
            :key="payment.id"
            class="haf-table__row"
          >
            <span>{{ payment.student }}</span>
            <span>{{ payment.course }}</span>
            <span>{{ payment.amount }}</span>
            <span
              :class="[
                'haf-status',
                `haf-status--${payment.status}`
              ]"
            >
              {{ payment.statusLabel }}
            </span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import useDashboard from './dashboard.page.js'
definePageMeta({
  middleware: ['auth'],
})
const {
  stats,
  todaySessions,
  recentPayments,
  refresh
} = useDashboard()
</script>

<!-- همچنان از همون CSS سراسری داشبورد استفاده کن -->
<style scoped src="./dashboard.page.css"></style>
