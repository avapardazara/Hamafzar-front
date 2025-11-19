<template>
  <section class="haf-students-page haf-courses-page" dir="rtl">
    <!-- هدر بالا -->
    <header class="haf-students-header">
      <div>
        <h1 class="haf-students-title">دوره‌ها</h1>
        <p class="haf-students-subtitle">
          مدیریت دوره‌ها، منتورها و وضعیت ثبت‌نام در یک نمای منسجم
        </p>
      </div>

      <div class="haf-students-header-actions">
        <button
          type="button"
          class="haf-btn haf-btn--ghost"
          @click="onRefresh"
        >
          ↻ بروزرسانی
        </button>

        <button
          type="button"
          class="haf-btn haf-btn--primary"
          @click="goToCreate"
        >
          ➕ دوره جدید
        </button>
      </div>
    </header>

    <!-- فیلترها -->
    <section class="haf-card haf-students-filters">
      <div class="haf-filters-row">
        <div class="haf-field haf-field--inline">
          <label class="haf-field__label">جست‌وجو در نام دوره</label>
          <input
            v-model="filters.q"
            type="text"
            class="haf-input"
            placeholder="مثلاً: بوت‌کمپ برنامه‌نویسی..."
            @keyup.enter="applyFilters"
          >
        </div>

        <div class="haf-field haf-field--inline">
          <label class="haf-field__label">وضعیت دوره</label>
          <select
            v-model="filters.status"
            class="haf-input"
          >
            <option value="">همه</option>
            <option value="ACTIVE">فعال</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="ARCHIVED">آرشیو</option>
          </select>
        </div>

        <div class="haf-field haf-field--compact">
          <label class="haf-field__label">&nbsp;</label>
          <button
            type="button"
            class="haf-btn haf-btn--primary"
            @click="applyFilters"
          >
            جست‌وجو
          </button>
        </div>

        <div class="haf-field haf-field--compact">
          <label class="haf-field__label">&nbsp;</label>
          <button
            type="button"
            class="haf-btn haf-btn--ghost"
            @click="resetFilters"
          >
            پاک‌سازی
          </button>
        </div>
      </div>

      <div class="haf-filters-meta">
        <span class="haf-chip">
          مجموع دوره‌ها:
          <strong>{{ total }}</strong>
        </span>
        <span
          v-if="filters.status"
          class="haf-chip haf-chip--soft"
        >
          وضعیت فعال: {{ formatStatusLabel(filters.status) }}
        </span>
      </div>
    </section>

    <!-- جدول دوره‌ها -->
    <section class="haf-card haf-students-table-wrapper">
      <table class="haf-table">
        <thead>
          <tr>
            <th>#</th>
            <th>نام دوره</th>
            <th>منتور</th>
            <th>وضعیت</th>
            <th>تاریخ شروع</th>
            <th>تاریخ پایان</th>
            <th class="haf-table__actions-col">عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="haf-table__empty">
              در حال بارگذاری لیست دوره‌ها...
            </td>
          </tr>

          <tr v-else-if="!hasRows">
            <td colspan="7" class="haf-table__empty">
              هیچ دوره‌ای با این شرایط پیدا نشد.
            </td>
          </tr>

          <tr
            v-for="(course, idx) in courses"
            :key="course.id || idx"
          >
            <td>{{ idx + 1 }}</td>

            <td>
              <div class="haf-student-name-cell">
                <div class="haf-avatar-mini">
                  <span>
                    {{ (course.title || '?').substring(0, 2) }}
                  </span>
                </div>
                <div>
                  <div class="haf-student-name">
                    {{ course.title || '—' }}
                  </div>
                  <div class="haf-student-id">
                    شناسه دوره: {{ course.id }}
                  </div>
                </div>
              </div>
            </td>

            <td>
              <span class="haf-mono">
                {{ course.mentor_name || 'منتور تعیین نشده' }}
              </span>
            </td>

            <td>
              <span
                class="haf-course-status-pill"
                :data-variant="course.status || 'ACTIVE'"
              >
                {{ formatStatusLabel(course.status) }}
              </span>
            </td>

            <td>{{ formatDateShort(course.start_date || course.start_date_gregorian) }}</td>
            <td>{{ formatDateShort(course.end_date || course.end_date_gregorian) }}</td>

            <td class="haf-table__actions-col">
              <div class="haf-table__actions">
                <!-- مشاهده پروفایل -->
                <button
                  type="button"
                  class="haf-link-btn"
                  @click="goToProfile(course)"
                >
                  👁 مشاهده
                </button>

                <!-- ویرایش -->
                <button
                  type="button"
                  class="haf-icon-btn"
                  title="ویرایش دوره"
                  @click="goToEdit(course)"
                >
                  ✏️
                </button>

                <!-- بایگانی -->
                <button
                  type="button"
                  class="haf-icon-btn haf-icon-btn--danger"
                  title="بایگانی دوره"
                  @click="archiveCourse(course)"
                >
                  🗂
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <p
        v-if="error"
        class="haf-field__error"
        style="margin-top:10px;"
      >
        {{ error }}
      </p>
    </section>
  </section>
</template>

<script setup>
import '../students/students.page.css'
import './courses.page.css'
import { useCourses } from './courses.page.js'

definePageMeta({
  middleware: ['auth'],
})

const {
  loading,
  error,
  courses,
  total,
  filters,
  pagination,
  hasRows,
  formatStatusLabel,
  fetchCourses,
  applyFilters,
  resetFilters,
  goToCreate,
  goToEdit,
  goToProfile,
  archiveCourse,
} = useCourses()

function onRefresh () {
  fetchCourses()
}

function formatDateShort (value) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('fa-IR')
  } catch {
    return '—'
  }
}
</script>
