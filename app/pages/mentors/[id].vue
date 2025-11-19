<!-- app/pages/mentors/[id].vue -->
<template>
  <section class="haf-student-profile" dir="rtl">
    <!-- هدر بالا -->
    <header class="haf-student-profile__header">
      <div class="haf-student-profile__title-wrap">
        <button
          type="button"
          class="haf-btn haf-btn--ghost haf-btn--sm"
          @click="goBack"
        >
          ← بازگشت به لیست منتورها
        </button>
        <div>
          <h1 class="haf-student-profile__title">
            پروفایل منتور
          </h1>
          <p class="haf-student-profile__subtitle" v-if="mentor">
            {{ mentor.full_name || (mentor.first_name + ' ' + mentor.last_name) }}
            <span class="haf-student-profile__id">ID: {{ mentor.id }}</span>
          </p>
        </div>
      </div>

      <div class="haf-student-profile__header-actions" v-if="mentor">
        <button
          type="button"
          class="haf-btn haf-btn--outline"
          @click="goToEdit"
        >
          ✏️ ویرایش اطلاعات
        </button>
      </div>
    </header>

    <!-- وضعیت لود / خطا -->
    <section v-if="loading" class="haf-card haf-card--soft haf-mt">
      در حال بارگذاری پروفایل منتور...
    </section>
    <section v-else-if="error" class="haf-card haf-card--danger haf-mt">
      {{ error }}
    </section>

    <section v-else-if="mentor" class="haf-student-profile__body haf-mt">
      <div class="haf-student-profile__grid">
        <!-- ستون اصلی -->
        <div class="haf-student-profile__main">
          <!-- کارت هویت -->
          <section class="haf-card haf-student-identity">
            <div class="haf-student-identity__header">
              <div class="haf-avatar-lg">
                <img
                  v-if="mentor.avatar_url"
                  :src="mentor.avatar_url"
                  alt="avatar"
                >
                <span v-else>
                  {{ getInitials(mentor) }}
                </span>
              </div>
              <div>
                <h2 class="haf-student-identity__name">
                  {{ mentor.full_name || (mentor.first_name + ' ' + mentor.last_name) }}
                </h2>
                <p class="haf-student-identity__meta">
                  ایمیل:
                  <span class="haf-mono">{{ mentor.email || '—' }}</span>
                  · موبایل:
                  <span class="haf-mono">{{ mentor.phone || '—' }}</span>
                </p>
              </div>
            </div>

            <dl class="haf-student-identity__details">
              <div class="haf-detail-row">
                <dt>کد ملی</dt>
                <dd class="haf-mono">{{ mentor.national_code || '—' }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>آدرس</dt>
                <dd>{{ mentor.address || 'ثبت نشده' }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>بیو</dt>
                <dd>{{ mentor.bio || '—' }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>یادداشت داخلی</dt>
                <dd>{{ mentor.note || mentor.notes || '—' }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>تاریخ ایجاد</dt>
                <dd>{{ formatDate(mentor.created_at) }}</dd>
              </div>
            </dl>
          </section>

          <!-- تب‌ها: اطلاعات / دوره‌ها / مالی -->
          <section class="haf-tabs haf-mt-lg">
            <div class="haf-tabs__list tabs">
              <button
                type="button"
                class="haf-tabs__btn tab"
                :class="{ 'haf-tabs__btn--active active': activeTab === 'info' }"
                data-tab="info"
                @click="activeTab = 'info'"
              >
                اطلاعات
              </button>

              <button
                type="button"
                class="haf-tabs__btn tab"
                :class="{ 'haf-tabs__btn--active active': activeTab === 'courses' }"
                data-tab="courses"
                @click="activeTab = 'courses'"
              >
                دوره‌ها
              </button>

              <button
                type="button"
                class="haf-tabs__btn tab"
                :class="{ 'haf-tabs__btn--active active': activeTab === 'finance' }"
                data-tab="finance"
                @click="activeTab = 'finance'"
              >
                مالی
              </button>
            </div>

            <div class="haf-tabs__panels">
              <!-- تب اطلاعات -->
              <section
                id="tab-info"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'info'"
              >
                <div class="haf-grid-2 haf-mt haf-info-grid">
                  <div class="haf-info-item">
                    <div class="haf-field__label">نام و نام‌خانوادگی</div>
                    <div class="haf-detail-row-value">
                      {{ mentor.full_name || (mentor.first_name + ' ' + mentor.last_name) }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">کد ملی</div>
                    <div class="haf-detail-row-value haf-mono">
                      {{ mentor.national_code || '—' }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">شماره تماس</div>
                    <div class="haf-detail-row-value haf-mono">
                      {{ mentor.phone || '—' }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">ایمیل</div>
                    <div class="haf-detail-row-value">
                      {{ mentor.email || '—' }}
                    </div>
                  </div>

                  <div class="haf-info-item haf-info-item--full">
                    <div class="haf-field__label">آدرس</div>
                    <div class="haf-detail-row-value">
                      {{ mentor.address || '—' }}
                    </div>
                  </div>

                  <div class="haf-info-item haf-info-item--full">
                    <div class="haf-field__label">بیو</div>
                    <div class="haf-detail-row-value">
                      {{ mentor.bio || '—' }}
                    </div>
                  </div>
                </div>
              </section>

              <!-- تب دوره‌ها -->
              <section
                id="tab-courses"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'courses'"
              >
                <div class="haf-card haf-card--soft haf-mt">
                  <div class="haf-mt">
                    <p class="haf-field__hint" v-if="!courses.length">
                      هنوز دوره‌ای برای این منتور در API جدید ثبت نشده است؛ بعداً می‌توانیم ارتباط با بک‌اند را کامل کنیم.
                    </p>

                    <div v-else class="table-responsive">
                      <table class="haf-table data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>عنوان دوره</th>
                            <th>شهریه هر دانشجو</th>
                            <th>سهم منتور</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(c, idx) in courses"
                            :key="c.id || idx"
                          >
                            <td>{{ idx + 1 }}</td>
                            <td>{{ c.title || 'بدون عنوان' }}</td>
                            <td>{{ formatNumber(c.tuition_per_student || 0) }} تومان</td>
                            <td>{{ c.mentor_share_percent || 0 }}٪</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              <!-- تب مالی -->
              <section
                id="tab-finance"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'finance'"
              >
                <div class="haf-metrics-grid haf-mt">
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">درآمد کل دوره‌ها</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(finance?.income_total || finance?.totals?.income_total || 0) }} تومان
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">سهم منتور</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(finance?.share_total || finance?.totals?.share_total || 0) }} تومان
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">پرداخت شده</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(finance?.paid_total || finance?.totals?.paid_total || 0) }} تومان
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">بدهی باقی‌مانده</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(finance?.remaining || finance?.totals?.remaining || 0) }} تومان
                    </p>
                  </div>
                </div>

                <div class="haf-card haf-card--soft haf-mt">
                  <h4 class="haf-card__title">جزییات مالی</h4>
                  <p class="haf-empty-state">
                    اتصال کامل این بخش به API مالی منتور (per-course و تراکنش‌ها) را می‌توانیم در مرحله بعد پیاده‌سازی کنیم؛
                    الان ساختار UI و binding‌های کلی آماده است.
                  </p>
                </div>
              </section>
            </div>
          </section>
        </div>

        <!-- ستون ساید (خلاصه) -->
        <aside class="haf-student-profile__aside">
          <section class="haf-card haf-card--glass">
            <h3 class="haf-card__title">خلاصه وضعیت</h3>
            <ul class="haf-summary-list">
              <li>
                <span>دوره‌های منتور</span>
                <strong>{{ formatNumber(courses.length) }}</strong>
              </li>
              <li>
                <span>درآمد کل</span>
                <strong>
                  {{ formatNumber(finance?.income_total || finance?.totals?.income_total || 0) }} تومان
                </strong>
              </li>
              <li>
                <span>سهم پرداخت‌شده</span>
                <strong>
                  {{ formatNumber(finance?.paid_total || finance?.totals?.paid_total || 0) }} تومان
                </strong>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </section>

    <section v-else class="haf-card haf-mt">
      منتور پیدا نشد.
    </section>
  </section>
</template>

<script setup>
import '../students/students.page.css'
import './mentors.page.css'
import { ref } from 'vue'
import { useMentorProfile } from './mentors.page.js'

definePageMeta({
  middleware: ['auth']
})

const activeTab = ref('info')

const {
  loading,
  error,
  mentor,
  stats,
  finance,
  courses,
  formatNumber,
  formatDate,
  getInitials,
  goBack,
  goToEdit
} = useMentorProfile()
</script>
