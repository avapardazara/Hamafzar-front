<template>
  <section class="haf-student-profile haf-courses-page" dir="rtl">
    <!-- هدر بالا + دکمه برگشت -->
    <header class="haf-student-profile__header">
      <div class="haf-student-profile__title-wrap">
        <button
          type="button"
          class="haf-btn haf-btn--ghost haf-btn--sm"
          @click="goBack"
        >
          ← بازگشت به لیست دوره‌ها
        </button>
        <div>
          <h1 class="haf-student-profile__title">
            پروفایل دوره
          </h1>
          <p
            v-if="course"
            class="haf-student-profile__subtitle"
          >
            {{ course.title }}
            <span class="haf-student-profile__id">
              ID: {{ course.id }}
            </span>
          </p>
        </div>
      </div>

      <div
        v-if="course"
        class="haf-student-profile__header-actions"
      >
        <button
          type="button"
          class="haf-btn haf-btn--outline"
          @click="goToEdit"
        >
          ✏️ ویرایش دوره
        </button>
      </div>
    </header>

    <!-- وضعیت لودینگ / خطا -->
    <section
      v-if="loading"
      class="haf-card haf-card--soft haf-mt"
    >
      در حال بارگذاری پروفایل دوره...
    </section>

    <section
      v-else-if="error"
      class="haf-card haf-card--danger haf-mt"
    >
      {{ error }}
    </section>

    <section
      v-else-if="course"
      class="haf-student-profile__body haf-mt"
    >
      <!-- گرید اصلی: اطلاعات + ساید -->
      <div class="haf-student-profile__grid">
        <!-- ستون اصلی -->
        <div class="haf-student-profile__main">
          <!-- کارت هویت دوره -->
          <section class="haf-card haf-student-identity">
            <div class="haf-student-identity__header">
              <div class="haf-course-cover" style="width: 200px; height: 120px;">
                <template v-if="course.cover_url">
                  <img
                    :src="course.cover_url"
                    alt="کاور دوره"
                    class="haf-course-cover__img"
                  />
                </template>
                <template v-else>
                  <div class="haf-course-cover__placeholder">
                    بدون تصویر کاور
                  </div>
                </template>
              </div>

              <div>
                <h2 class="haf-student-identity__name">
                  {{ course.title }}
                </h2>
                <p class="haf-student-identity__meta">
                  منتور:
                  <span class="haf-mono">
                    {{ course.mentor_name || 'منتور تعیین نشده' }}
                  </span>
                  · ظرفیت:
                  <span class="haf-mono">
                    {{ course.capacity ?? '—' }}
                  </span>
                </p>

                <p class="haf-student-identity__meta">
                  وضعیت:
                  <span
                    class="haf-course-status-pill"
                    :data-variant="course.status || 'ACTIVE'"
                  >
                    {{ formatStatusLabel(course.status) }}
                  </span>
                  · بازه برگزاری:
                  <span class="haf-mono">
                    {{ formatDate(course.start_date || course.start_date_gregorian) }}
                    تا
                    {{ formatDate(course.end_date || course.end_date_gregorian) }}
                  </span>
                </p>
              </div>
            </div>

            <dl class="haf-student-identity__details">
              <div class="haf-detail-row">
                <dt>توضیحات دوره</dt>
                <dd>{{ course.description || 'توضیحاتی ثبت نشده است.' }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>وضعیت</dt>
                <dd>
                  <span
                    class="haf-course-status-pill"
                    :data-variant="course.status || 'ACTIVE'"
                  >
                    {{ formatStatusLabel(course.status) }}
                  </span>
                </dd>
              </div>
              <div class="haf-detail-row">
                <dt>تاریخ ایجاد</dt>
                <dd>{{ formatDate(course.created_at) }}</dd>
              </div>
            </dl>
          </section>

          <!-- تب‌ها -->
          <section class="haf-tabs haf-mt-lg">
            <!-- دکمه‌های تب -->
            <div class="haf-tabs__list">
              <button
                type="button"
                class="haf-tabs__btn"
                :class="{ 'haf-tabs__btn--active': activeTab === 'overview' }"
                @click="activeTab = 'overview'"
              >
                نمای کلی
              </button>

              <button
                type="button"
                class="haf-tabs__btn"
                :class="{ 'haf-tabs__btn--active': activeTab === 'sessions' }"
                @click="activeTab = 'sessions'"
              >
                جلسات
              </button>

              <button
                type="button"
                class="haf-tabs__btn"
                :class="{ 'haf-tabs__btn--active': activeTab === 'students' }"
                @click="activeTab = 'students'"
              >
                دانشجوها
              </button>

              <button
                type="button"
                class="haf-tabs__btn"
                :class="{ 'haf-tabs__btn--active': activeTab === 'finance' }"
                @click="activeTab = 'finance'"
              >
                مالی / اقساط
              </button>
            </div>

            <!-- محتوای تب‌ها -->
            <div class="haf-tabs__panels">
              <!-- تب نمای کلی -->
              <section
                v-if="activeTab === 'overview'"
                class="haf-tabs__panel"
              >
                <h3 class="haf-tabs__panel-title">
                  خلاصه اطلاعات دوره
                </h3>
                <p class="haf-tabs__panel-desc">
                  نمای کلی از اطلاعات کلیدی دوره، شامل بازه برگزاری، ظرفیت و وضعیت فعلی.
                </p>

                <div class="haf-course-grid-2 haf-mt">
                  <div class="haf-card haf-card--soft">
                    <h4 class="haf-card__title">اطلاعات زمان‌بندی</h4>
                    <dl class="haf-detail-list">
                      <div class="haf-detail-row">
                        <dt>تاریخ شروع</dt>
                        <dd>{{ formatDate(course.start_date || course.start_date_gregorian) }}</dd>
                      </div>
                      <div class="haf-detail-row">
                        <dt>تاریخ پایان</dt>
                        <dd>{{ formatDate(course.end_date || course.end_date_gregorian) }}</dd>
                      </div>
                      <div class="haf-detail-row">
                        <dt>ساعت برگزاری</dt>
                        <dd>
                          <span v-if="course.start_time || course.end_time">
                            {{ course.start_time || '—' }}
                            تا
                            {{ course.end_time || '—' }}
                          </span>
                          <span v-else>ثبت نشده</span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div class="haf-card haf-card--soft">
                    <h4 class="haf-card__title">اطلاعات مالی کلی</h4>
                    <dl class="haf-detail-list">
                      <div class="haf-detail-row">
                        <dt>شهریه هر دانشجو</dt>
                        <dd>{{ formatNumber(course.fee_per_student || 0) }} تومان</dd>
                      </div>
                      <div class="haf-detail-row">
                        <dt>سهم منتور</dt>
                        <dd>
                          {{ course.mentor_share_percent ?? 0 }}%
                        </dd>
                      </div>
                      <div class="haf-detail-row">
                        <dt>تعداد دانشجوهای ثبت‌نام‌شده</dt>
                        <dd>{{ formatNumber(students?.length || 0) }}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              <!-- تب جلسات -->
              <section
                v-else-if="activeTab === 'sessions'"
                class="haf-tabs__panel"
              >
                <h3 class="haf-tabs__panel-title">
                  جلسات دوره
                </h3>
                <p class="haf-tabs__panel-desc">
                  این بخش شبیه صفحه «جلسات دوره» در بک‌اند است و لیست جلسات ثبت‌شده
                  به‌همراه خلاصه حضور و غیاب را نشان می‌دهد. برای مدیریت کامل حضور و غیاب
                  می‌توانی روی دکمه «حضور و غیاب» هر جلسه کلیک کنی.
                </p>

                <!-- KPI های جلسات -->
                <div class="haf-metrics-grid haf-mt">
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">تعداد کل جلسات</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(sessionsStats.totalSessions) }}
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">کل حضورهای ثبت‌شده</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(sessionsStats.totalAttendance) }}
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">حاضر / غایب</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(sessionsStats.totalPresent) }} حاضر ·
                      {{ formatNumber(sessionsStats.totalAbsent) }} غایب
                    </p>
                  </div>
                </div>

                <!-- جدول جلسات -->
                <div class="haf-card haf-card--soft haf-mt">
                  <table class="haf-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>تاریخ جلسه</th>
                        <th>ساعت</th>
                        <th>مدت (دقیقه)</th>
                        <th>حضور / غیاب</th>
                        <th>وضعیت</th>
                        <th>اقدام</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!sessions || sessions.length === 0">
                        <td colspan="7" class="haf-table__empty">
                          هنوز جلسه‌ای برای این دوره ثبت نشده است.
                        </td>
                      </tr>

                      <tr
                        v-for="(s, idx) in sessions"
                        :key="s.id || idx"
                      >
                        <td>{{ idx + 1 }}</td>
                        <td>
                          {{ formatDate(s.session_date || s.date || s.date_gregorian || s.date_jalali) }}
                        </td>
                        <td>
                          <span class="haf-mono">
                            {{ s.start_time || '—' }}
                            <span v-if="s.end_time">
                              تا {{ s.end_time }}
                            </span>
                          </span>
                        </td>
                        <td>
                          <span class="haf-mono">
                            {{ s.duration_minutes ?? '—' }}
                          </span>
                        </td>
                        <td>
                          {{ sessionAttendanceSummary(s) }}
                        </td>
                        <td>
                          {{ formatSessionStatus(s) }}
                        </td>
                        <td class="haf-table__cell--actions">
                          <a
                            v-if="sessionAttendanceLink(s)"
                            :href="sessionAttendanceLink(s)"
                            target="_blank"
                            rel="noopener"
                            class="haf-btn haf-btn--ghost haf-btn--xs"
                          >
                            حضور و غیاب
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- تب دانشجوها -->
              <section
                v-else-if="activeTab === 'students'"
                class="haf-tabs__panel"
              >
                <h3 class="haf-tabs__panel-title">
                  دانشجوهای ثبت‌نام‌شده
                </h3>
                <p class="haf-tabs__panel-desc">
                  این بخش خلاصه‌ای از دانشجوهای ثبت‌نام‌شده در دوره را نمایش می‌دهد.
                  در مراحل بعدی، امکان مدیریت مستقیم ثبت‌نام‌ها از همین صفحه اضافه می‌شود.
                </p>

                <!-- خلاصه وضعیت دانشجوها -->
                <div class="haf-metrics-grid haf-mt">
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">تعداد کل دانشجوها</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(studentsStats.total) }}
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">فعال</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(studentsStats.active) }}
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">لغو / غیرفعال</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(studentsStats.cancelled) }}
                    </p>
                  </div>
                </div>

                <div class="haf-card haf-card--soft haf-mt">
                  <table class="haf-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>نام دانشجو</th>
                        <th>موبایل</th>
                        <th>وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!students || students.length === 0">
                        <td colspan="4" class="haf-table__empty">
                          هنوز دانشجویی برای این دوره ثبت‌نام نشده است.
                        </td>
                      </tr>
                      <tr
                        v-for="(st, idx) in students"
                        :key="st.id || st.enrollment_id || st.student_id || idx"
                      >
                        <td>{{ idx + 1 }}</td>
                        <td>
                          {{ st.full_name || st.student_name || '—' }}
                        </td>
                        <td>
                          <span class="haf-mono">
                            {{ st.phone || st.student_phone || '—' }}
                          </span>
                        </td>
                        <td>
                          {{ formatStudentStatus(st.status) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- تب مالی -->
              <section
                v-else-if="activeTab === 'finance'"
                class="haf-tabs__panel"
              >
                <h3 class="haf-tabs__panel-title">
                  وضعیت مالی دوره
                </h3>
                <p class="haf-tabs__panel-desc">
                  خلاصه‌ای از وضعیت مالی دوره، شامل شهریه‌ها، مبالغ دریافت‌شده و مانده.
                  اتصال کامل این بخش به ماژول اقساط در فاز بعدی انجام می‌شود.
                </p>

                <!-- محاسبات ساده بر اساس شهریه * تعداد دانشجو -->
                <div class="haf-metrics-grid haf-mt">
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">شهریه هر دانشجو</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(course.fee_per_student || 0) }} تومان
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">تعداد دانشجوهای ثبت‌نام‌شده</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(students?.length || 0) }} نفر
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">جمع تقریبی شهریه کل</p>
                    <p class="haf-metric-card__value">
                      {{
                        formatNumber(
                          (course.fee_per_student || 0) * (students?.length || 0),
                        )
                      }}
                      تومان
                    </p>
                  </div>
                </div>

                <!-- اگر بک‌اند برای این دوره خلاصه مالی بده -->
                <div
                  v-if="finance"
                  class="haf-card haf-card--soft haf-mt"
                >
                  <h4 class="haf-card__title">خلاصه مالی از بک‌اند</h4>
                  <dl class="haf-detail-list">
                    <div class="haf-detail-row">
                      <dt>شهریه اسمی کل</dt>
                      <dd>{{ formatNumber(finance.face || finance.total_face || 0) }} تومان</dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>مجموع دریافتی</dt>
                      <dd>{{ formatNumber(finance.received || finance.total_received || 0) }} تومان</dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>مطالبات باز</dt>
                      <dd class="haf-text-danger">
                        {{ formatNumber(finance.remain || finance.total_receivables || 0) }} تومان
                      </dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>سهم منتور</dt>
                      <dd>{{ formatNumber(finance.mentor_share || 0) }} تومان</dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>پرداخت‌شده به منتور</dt>
                      <dd>{{ formatNumber(finance.mentor_paid || 0) }} تومان</dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>مانده تسویه منتور</dt>
                      <dd :class="finance.mentor_due > 0 ? 'haf-text-danger' : 'haf-text-success'">
                        {{ formatNumber(finance.mentor_due || 0) }} تومان
                      </dd>
                    </div>
                  </dl>
                </div>

                <div
                  v-else
                  class="haf-card haf-card--soft haf-mt"
                >
                  <p class="haf-empty-state">
                    برای مدیریت جزئیات اقساط و تراکنش‌ها، از ماژول «اقساط» استفاده کن.
                    (اتصال مستقیم این تب به API مالی در مرحله بعدی تکمیل می‌شود.)
                  </p>
                </div>
              </section>
            </div>
          </section>
        </div>

        <!-- ستون ساید – خلاصه -->
        <aside class="haf-student-profile__aside">
          <section class="haf-card haf-card--glass">
            <h3 class="haf-card__title">خلاصه وضعیت دوره</h3>
            <ul class="haf-course-summary-list">
              <li>
                <span>وضعیت</span>
                <strong>{{ formatStatusLabel(course.status) }}</strong>
              </li>
              <li>
                <span>تعداد جلسات ثبت‌شده</span>
                <strong>{{ formatNumber(sessions?.length || 0) }}</strong>
              </li>
              <li>
                <span>دانشجوهای ثبت‌نام‌شده</span>
                <strong>{{ formatNumber(students?.length || 0) }}</strong>
              </li>
              <li>
                <span>شهریه هر دانشجو</span>
                <strong>{{ formatNumber(course.fee_per_student || 0) }} تومان</strong>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </section>

    <section
      v-else
      class="haf-card haf-mt"
    >
      دوره پیدا نشد.
    </section>
  </section>
</template>

<script setup>
import '../students/students.page.css'
import './courses.page.css'
import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { useCourseProfile } from './courses.page.js'

definePageMeta({
  middleware: ['auth'],
})

const {
  loading,
  error,
  course,
  sessions,
  students,
  finance,
  formatNumber,
  formatDate,
  goBack,
  goToEdit,
} = useCourseProfile()

const activeTab = ref('overview')

// تنظیم base URL بک‌اند برای لینک حضور و غیاب
const config = useRuntimeConfig()
const apiBase = config.public?.apiBase || ''
// اگر apiBase شبیه http://localhost:5000/api باشد، /api را حذف می‌کنیم
const backendBase = apiBase.replace(/\/api\/?$/, '')

// KPI جلسات بر اساس داده‌های API /api/courses/<id>/sessions
const sessionsStats = computed(() => {
  const list = sessions?.value || []
  let totalSessions = list.length
  let totalAttendance = 0
  let totalPresent = 0
  let totalAbsent = 0

  for (const s of list) {
    const stats = s?.stats || {}
    const present = Number(
      stats.present ??
      stats.PRESENT ??
      stats.present_count ??
      0,
    ) || 0
    const absent = Number(
      stats.absent ??
      stats.ABSENT ??
      stats.absent_count ??
      0,
    ) || 0
    const total = Number(
      stats.total ??
      stats.total_attendance ??
      s.total_attendance ??
      (Array.isArray(s.attendances) ? s.attendances.length : 0),
    ) || 0

    totalPresent += present
    totalAbsent += absent
    totalAttendance += total
  }

  return {
    totalSessions,
    totalAttendance,
    totalPresent,
    totalAbsent,
  }
})

// KPI دانشجوها
const studentsStats = computed(() => {
  const list = students?.value || []
  const total = list.length
  let active = 0
  let cancelled = 0

  for (const st of list) {
    const s = (st.status || '').toUpperCase()
    if (s === 'ACTIVE' || s === 'REGISTERED') active++
    else if (s === 'CANCELLED' || s === 'DROPPED') cancelled++
  }

  return { total, active, cancelled }
})

function formatStatusLabel (s) {
  const v = (s || '').toUpperCase()
  if (v === 'ARCHIVED') return 'آرشیو'
  if (v === 'DRAFT') return 'پیش‌نویس'
  return 'فعال'
}

function formatSessionStatus (session) {
  const v = (session?.status || '').toUpperCase()
  if (!v || v === 'PLANNED') return 'برنامه‌ریزی شده'
  if (v === 'DONE' || v === 'HELD') return 'برگزار شده'
  if (v === 'CANCELLED') return 'لغو شده'
  return session.status || 'نامشخص'
}

function formatStudentStatus (s) {
  const v = (s || '').toUpperCase()
  if (v === 'ACTIVE' || v === 'REGISTERED') return 'فعال'
  if (v === 'CANCELLED' || v === 'DROPPED') return 'لغو شده'
  return s || 'نامشخص'
}

// خلاصه حضور و غیاب برای هر جلسه (حاضر / غایب / کل)
function sessionAttendanceSummary (session) {
  if (!session) return '—'
  const stats = session.stats || {}
  const present = Number(
    stats.present ??
    stats.PRESENT ??
    stats.present_count ??
    0,
  ) || 0
  const absent = Number(
    stats.absent ??
    stats.ABSENT ??
    stats.absent_count ??
    0,
  ) || 0
  const total = Number(
    stats.total ??
    stats.total_attendance ??
    session.total_attendance ??
    (Array.isArray(session.attendances) ? session.attendances.length : 0),
  ) || 0

  if (!total) return '—'

  return `${formatNumber(present)} حاضر / ${formatNumber(absent)} غایب از ${formatNumber(total)}`
}

// لینک رفتن به صفحه حضور و غیاب بک‌اند
function sessionAttendanceLink (session) {
  if (!course?.value?.id || !session?.id) return null
  const base = backendBase || ''
  return `${base}/courses/${course.value.id}/attendance?session_id=${session.id}`
}
</script>
