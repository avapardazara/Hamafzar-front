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
          <h1 class="haf-student-profile__title">پروفایل دوره</h1>
          <p v-if="course" class="haf-student-profile__subtitle">
            {{ course.title }}
            <span class="haf-student-profile__id"> ID: {{ course.id }} </span>
          </p>
        </div>
      </div>

      <div v-if="course" class="haf-student-profile__header-actions">
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
    <section v-if="loading" class="haf-card haf-card--soft haf-mt">
      در حال بارگذاری پروفایل دوره...
    </section>

    <section v-else-if="error" class="haf-card haf-card--danger haf-mt">
      {{ error }}
    </section>

    <section v-else-if="course" class="haf-student-profile__body haf-mt">
      <!-- گرید اصلی: اطلاعات + ساید -->
      <div class="haf-student-profile__grid">
        <!-- ستون اصلی -->
        <div class="haf-student-profile__main">
          <!-- کارت هویت دوره -->
          <section class="haf-card haf-student-identity">
            <div class="haf-student-identity__header">
              <div class="haf-course-cover" style="width: 200px; height: 120px">
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
                    {{ course.mentor_name || "منتور تعیین نشده" }}
                  </span>
                  · ظرفیت:
                  <span class="haf-mono">
                    {{ course.capacity ?? "—" }}
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
                    {{
                      formatDate(
                        course.start_date || course.start_date_gregorian
                      )
                    }}
                    تا
                    {{
                      formatDate(course.end_date || course.end_date_gregorian)
                    }}
                  </span>
                </p>
              </div>
            </div>

            <dl class="haf-student-identity__details">
              <div class="haf-detail-row">
                <dt>توضیحات دوره</dt>
                <dd>{{ course.description || "توضیحاتی ثبت نشده است." }}</dd>
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
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'info',
                }"
                @click="activeTab = 'overview'"
              >
                نمای کلی
              </button>

              <button
                type="button"
                class="haf-tabs__btn"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'sessions',
                }"
                @click="activeTab = 'sessions'"
              >
                جلسات
              </button>

              <button
                type="button"
                class="haf-tabs__btn"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'students',
                }"
                @click="activeTab = 'students'"
              >
                دانشجوها
              </button>

              <button
                type="button"
                class="haf-tabs__btn"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'finance',
                }"
                @click="activeTab = 'finance'"
              >
                مالی / اقساط
              </button>
            </div>

            <!-- محتوای تب‌ها -->
            <div class="haf-tabs__panels">
              <!-- تب نمای کلی -->
              <section v-if="activeTab === 'overview'" class="haf-tabs__panel">
                <h3 class="haf-tabs__panel-title">خلاصه اطلاعات دوره</h3>
                <p class="haf-tabs__panel-desc">
                  نمای کلی از اطلاعات کلیدی دوره، شامل بازه برگزاری، ظرفیت و
                  وضعیت فعلی.
                </p>

                <div class="haf-course-grid-2 haf-mt">
                  <div class="haf-card haf-card--soft">
                    <h4 class="haf-card__title">اطلاعات زمان‌بندی</h4>
                    <dl class="haf-detail-list">
                      <div class="haf-detail-row">
                        <dt>تاریخ شروع</dt>
                        <dd>
                          {{
                            formatDate(
                              course.start_date || course.start_date_gregorian
                            )
                          }}
                        </dd>
                      </div>
                      <div class="haf-detail-row">
                        <dt>تاریخ پایان</dt>
                        <dd>
                          {{
                            formatDate(
                              course.end_date || course.end_date_gregorian
                            )
                          }}
                        </dd>
                      </div>
                      <div class="haf-detail-row">
                        <dt>ساعت برگزاری</dt>
                        <dd>
                          <span v-if="course.start_time || course.end_time">
                            {{ course.start_time || "—" }}
                            تا
                            {{ course.end_time || "—" }}
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
                        <dd>
                          {{ formatNumber(course.fee_per_student || 0) }} تومان
                        </dd>
                      </div>
                      <div class="haf-detail-row">
                        <dt>سهم منتور</dt>
                        <dd>{{ course.mentor_share_percent ?? 0 }}%</dd>
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
                class="haf-profile-tab"
              >
                <div class="haf-card haf-card--soft haf-sessions-card">
                  <header class="haf-card-header haf-card-header--between">
                    <div>
                      <button
                        class="haf-btn haf-btn--soft"
                        :disabled="!todaySession"
                        @click="goToTodaySession"
                      >
                        🌤️ جلسه امروز
                      </button>
                      <h3 class="haf-form-title">جلسات دوره</h3>
                      <p class="haf-field__hint">
                        لیست جلسات برنامه‌ریزی‌شده برای این دوره. برای ثبت حضور
                        و غیاب می‌توانی از پنل قدیمی هم استفاده کنی.
                      </p>
                    </div>

                    <div class="haf-card-header-actions">
                      <button
                        type="button"
                        class="haf-btn haf-btn--secondary"
                        :disabled="generatingSessions"
                        @click="generateSessionsAndOpen"
                      >
                        {{
                          generatingSessions
                            ? "در حال تولید جلسات..."
                            : "🗓️ تولید جلسات و رفتن به حضور و غیاب"
                        }}
                      </button>
                    </div>
                  </header>

                  <!-- اینجا جدول یا لیست جلسات فعلی که قبلاً داشتی می‌مونه -->
                  <div class="haf-table-wrapper" style="margin-top: 12px">
                    <table v-if="sessions && sessions.length" class="haf-table">
                      <thead>
                        <tr>
                          <th>تاریخ جلسه</th>
                          <th>ساعت</th>
                          <th>کلاس/اتاق</th>
                          <th>توضیحات</th>
                          <th>اقدامات</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="s in sessions" :key="s.id">
                          <td>{{ formatDate(s.session_date || s.date) }}</td>
                          <td>
                            {{ formatTime(s.start_time) }}
                            <span v-if="s.end_time">
                              تا {{ formatTime(s.end_time) }}</span
                            >
                          </td>
                          <td>{{ s.room || "—" }}</td>
                          <td>{{ s.note || s.description || "—" }}</td>
                          <td>
                            <div class="haf-flex haf-gap-xs">
                              <button
                                class="haf-btn haf-btn--soft"
                                @click="viewSession(s)"
                              >
                                نمایش
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p v-else class="haf-field__hint">
                      هنوز جلسه‌ای برای این دوره ثبت نشده است. از دکمه‌ی بالا
                      برای تولید خودکار جلسات استفاده کن.
                    </p>
                  </div>
                </div>
              </section>
              <!-- تب دانشجوها -->
              <section
                v-else-if="activeTab === 'students'"
                class="haf-tabs__panel"
              >
                <h3 class="haf-tabs__panel-title">
                  مدیریت دانشجوهای ثبت‌نام‌شده
                </h3>
                <p class="haf-tabs__panel-desc">
                  از این بخش می‌توانی دانشجوهای فعال را به دوره اضافه کنی یا
                  ثبت‌نام‌های موجود را حذف کنی.
                </p>

                <!-- کارت: لیست دانشجوهای ثبت‌نام‌شده -->
                <div class="haf-card haf-card--soft haf-mt">
                  <div class="haf-card__header-row">
                    <h4 class="haf-card__title">
                      دانشجوهای ثبت‌نام‌شده در این دوره
                    </h4>
                    <span class="haf-chip">
                      تعداد: {{ formatNumber(students?.length || 0) }} نفر
                    </span>
                  </div>

                  <table class="haf-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>نام دانشجو</th>
                        <th>کد/شماره دانشجو</th>
                        <th>موبایل</th>
                        <th style="width: 120px; text-align: left">اقدام</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!students || students.length === 0">
                        <td colspan="5" class="haf-table__empty">
                          هنوز دانشجویی برای این دوره ثبت‌نام نشده است.
                        </td>
                      </tr>
                      <tr v-for="(st, idx) in students" :key="st.id || idx">
                        <td>{{ idx + 1 }}</td>
                        <td>{{ st.full_name || st.student_name || "—" }}</td>
                        <td class="haf-mono">
                          {{ st.code || st.student_code || "—" }}
                        </td>
                        <td class="haf-mono">
                          {{ st.phone || st.student_phone || "—" }}
                        </td>
                        <td style="text-align: left">
                          <button
                            type="button"
                            class="haf-btn haf-btn--ghost haf-btn--xs"
                            :disabled="unenrollingId === st.id"
                            @click="unenrollStudent(st)"
                          >
                            {{
                              unenrollingId === st.id
                                ? "در حال حذف..."
                                : "حذف از دوره"
                            }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- کارت: افزودن دانشجو -->
                <div class="haf-card haf-card--soft haf-mt">
                  <h4 class="haf-card__title">افزودن دانشجو به دوره</h4>
                  <p class="haf-field__hint" style="margin-bottom: 10px">
                    فقط دانشجوهایی نمایش داده می‌شوند که
                    <strong>حذف نشده‌اند</strong> (is_deleted = False) و هنوز در
                    این دوره ثبت‌نام نکرده‌اند.
                  </p>

                  <div class="haf-student-form-grid">
                    <div class="haf-field haf-field--full">
                      <label class="haf-field__label"> انتخاب دانشجو </label>
                      <select v-model="studentToEnroll" class="haf-input">
                        <option value="">یک دانشجو انتخاب کنید...</option>
                        <option
                          v-for="st in studentsOptions"
                          :key="st.id"
                          :value="st.id"
                        >
                          {{ st.full_name }} – {{ st.phone || "بدون موبایل" }}
                        </option>
                      </select>
                    </div>

                    <div
                      class="haf-field haf-field--full"
                      style="display: flex; justify-content: flex-end; gap: 8px"
                    >
                      <button
                        type="button"
                        class="haf-btn haf-btn--ghost"
                        @click="reloadAll"
                      >
                        رفرش لیست
                      </button>

                      <button
                        type="button"
                        class="haf-btn haf-btn--primary"
                        :disabled="!studentToEnroll || enrolling"
                        @click="enrollSelectedStudent"
                      >
                        {{ enrolling ? "در حال ثبت‌نام..." : "افزودن به دوره" }}
                      </button>
                    </div>
                  </div>

                  <p
                    v-if="!studentsOptions || studentsOptions.length === 0"
                    class="haf-field__hint"
                    style="margin-top: 4px"
                  >
                    در حال حاضر دانشجوی فعالی که خارج از این دوره باشد پیدا نشد؛
                    برای اضافه کردن دانشجوهای جدید، ابتدا آن‌ها را در بخش
                    «دانشجوها» ثبت کن.
                  </p>
                </div>
              </section>
              <!-- تب مالی -->
              <section
                v-else-if="activeTab === 'finance'"
                class="haf-tabs__panel"
              >
                <h3 class="haf-tabs__panel-title">وضعیت مالی دوره</h3>
                <p class="haf-tabs__panel-desc">
                  خلاصه‌ای از وضعیت مالی دوره، شامل شهریه‌ها، مبالغ دریافت‌شده و
                  مانده. اتصال کامل این بخش به ماژول اقساط در فاز بعدی انجام
                  می‌شود.
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
                    <p class="haf-metric-card__label">
                      تعداد دانشجوهای ثبت‌نام‌شده
                    </p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(students?.length || 0) }} نفر
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">جمع تقریبی شهریه کل</p>
                    <p class="haf-metric-card__value">
                      {{
                        formatNumber(
                          (course.fee_per_student || 0) *
                            (students?.length || 0)
                        )
                      }}
                      تومان
                    </p>
                  </div>
                </div>

                <!-- اگر بک‌اند برای این دوره خلاصه مالی بده -->
                <div v-if="finance" class="haf-card haf-card--soft haf-mt">
                  <h4 class="haf-card__title">خلاصه مالی از بک‌اند</h4>
                  <dl class="haf-detail-list">
                    <div class="haf-detail-row">
                      <dt>شهریه اسمی کل</dt>
                      <dd>
                        {{
                          formatNumber(finance.face || finance.total_face || 0)
                        }}
                        تومان
                      </dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>مجموع دریافتی</dt>
                      <dd>
                        {{
                          formatNumber(
                            finance.received || finance.total_received || 0
                          )
                        }}
                        تومان
                      </dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>مطالبات باز</dt>
                      <dd class="haf-text-danger">
                        {{
                          formatNumber(
                            finance.remain || finance.total_receivables || 0
                          )
                        }}
                        تومان
                      </dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>سهم منتور</dt>
                      <dd>
                        {{ formatNumber(finance.mentor_share || 0) }} تومان
                      </dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>پرداخت‌شده به منتور</dt>
                      <dd>
                        {{ formatNumber(finance.mentor_paid || 0) }} تومان
                      </dd>
                    </div>
                    <div class="haf-detail-row">
                      <dt>مانده تسویه منتور</dt>
                      <dd
                        :class="
                          finance.mentor_due > 0
                            ? 'haf-text-danger'
                            : 'haf-text-success'
                        "
                      >
                        {{ formatNumber(finance.mentor_due || 0) }} تومان
                      </dd>
                    </div>
                  </dl>
                </div>

                <div v-else class="haf-card haf-card--soft haf-mt">
                  <p class="haf-empty-state">
                    برای مدیریت جزئیات اقساط و تراکنش‌ها، از ماژول «اقساط»
                    استفاده کن. (اتصال مستقیم این تب به API مالی در مرحله بعدی
                    تکمیل می‌شود.)
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
                <strong
                  >{{ formatNumber(course.fee_per_student || 0) }} تومان</strong
                >
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </section>

    <section v-else class="haf-card haf-mt">دوره پیدا نشد.</section>
  </section>
</template>

<script setup>
import "../students/students.page.css";
import "./courses.page.css";
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRuntimeConfig } from "#app";
import { useCourseProfile } from "./courses.page.js";

definePageMeta({ middleware: ["auth"] });

function formatStatusLabel(s) {
  const v = (s || "").toUpperCase();
  if (v === "ARCHIVED") return "آرشیو";
  if (v === "DRAFT") return "پیش‌نویس";
  return "فعال";
}

const {
  loading,
  error,
  course,
  sessions,
  students,
  studentsOptions,
  finance,
  kpis,
  formatNumber,
  formatDate,
  formatTime,
  getInitials,
  goBack,
  reloadAll,
  studentToEnroll,
  enrolling,
  unenrollingId,
  enrollSelectedStudent,
  unenrollStudent,
  generatingSessions,
  generateSessionsAndOpen,
} = useCourseProfile();

const activeTab = ref("overview");
const router = useRouter();
const route = useRoute();

// ---------- helpers ----------
const todayISO = () => new Date().toISOString().slice(0, 10);

const todaySession = computed(() => {
  const t = todayISO()
  const list = sessions.value || []

  return list.find(s => {
    const raw = s.session_date || s.date
    if (!raw) return false

    // raw ممکنه Date، string با T، یا string با فاصله باشه
    const iso = new Date(raw).toISOString().slice(0, 10)
    return iso === t
  }) || null
})

/**
 * سعی می‌کنیم به روت‌های فرانت بریم.
 * اگر هیچ‌کدوم وجود نداشت → می‌ریم به صفحه Jinja جزئیات جلسه.
 */
function openSessionSmart(sessionId) {
  const cid = course.value?.id || route.params.id;
  if (!sessionId) return;

  // روت‌های محتمل فرانت (به ترتیب اولویت)
  const candidates = [
    `/courses/${cid}/sessions/${sessionId}`, // اگر nested ساخته باشی
    `/sessions/${sessionId}`, // اگر صفحه سشن جداست
    `/attendance/${cid}/session/${sessionId}`, // الگوی قدیمی که تو jinja هم بود
  ];

  for (const path of candidates) {
    const resolved = router.resolve(path);
    if (resolved?.matched?.length) {
      router.push(path);
      return;
    }
  }

  // فول‌بک به بک‌اند (طبق قالب‌های Jinja)
  window.open(`http://localhost:5000/sessions/${sessionId}`, "_blank");
}

function goToTodaySession() {
  if (!todaySession.value) {
    alert("برای امروز جلسه‌ای ثبت نشده.");
    return;
  }
  openSessionSmart(todaySession.value.id);
}

function viewSession(s) {
  openSessionSmart(s?.id);
}
</script>
