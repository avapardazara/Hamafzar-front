<template>
  <section class="haf-students-page" dir="rtl">
    <!-- هدر بالا -->
    <header class="haf-students-header">
      <div>
        <h1 class="haf-students-title">دانشجوها / کارآموزها</h1>
        <p class="haf-students-subtitle">
          مدیریت اطلاعات دانشجوها، ثبت‌نام، ارتباط و وضعیت مالی در یک نما
        </p>
      </div>

      <div class="haf-students-header-actions">
        <button
          type="button"
          class="haf-btn haf-btn--ghost"
          @click="onRefresh"
          :disabled="loading"
        >
          🔄 بروزرسانی
        </button>
        <button
          type="button"
          class="haf-btn haf-btn--primary"
          @click="onCreate"
        >
          ➕ افزودن دانشجو
        </button>
      </div>
    </header>

    <!-- فیلترها / جستجو -->
    <section class="haf-card haf-students-filters">
      <div class="haf-filters-row">
        <div class="haf-field">
          <label class="haf-field__label">
            جست‌وجو
          </label>
          <input
            v-model="filters.q"
            type="text"
            class="haf-input"
            placeholder="نام، موبایل، کدملی، ایمیل..."
            @keyup.enter="fetchStudents"
          />
        </div>

        <div class="haf-field haf-field--inline">
          <label class="haf-field__label">تاریخ ثبت‌نام از</label>
          <input
            ref="fromDateInput"
            v-model="filters.date_from"
            type="text"
            class="haf-input haf-input--date"
            placeholder="مثال: ۱۴۰۲/۰۱/۰۱"
          />
        </div>

        <div class="haf-field haf-field--inline">
          <label class="haf-field__label">تا</label>
          <input
            ref="toDateInput"
            v-model="filters.date_to"
            type="text"
            class="haf-input haf-input--date"
            placeholder="مثال: ۱۴۰۲/۱۲/۲۹"
          />
        </div>

        <div class="haf-field haf-field--inline haf-field--compact">
          <label class="haf-field__label">&nbsp;</label>
          <button
            type="button"
            class="haf-btn haf-btn--primary haf-btn--block"
            @click="fetchStudents"
            :disabled="loading"
          >
            جست‌وجو
          </button>
        </div>

        <div class="haf-field haf-field--inline haf-field--compact">
          <label class="haf-field__label">&nbsp;</label>
          <button
            type="button"
            class="haf-btn haf-btn--ghost haf-btn--block"
            @click="resetFilters"
            :disabled="loading"
          >
            پاک‌سازی
          </button>
        </div>
      </div>

      <div class="haf-filters-meta">
        <span class="haf-chip">
          تعداد کل:
          <strong>{{ formatNumber(total) }}</strong>
          نفر
        </span>
        <span v-if="loading" class="haf-chip haf-chip--soft">
          در حال بارگذاری لیست دانشجوها...
        </span>
      </div>
    </section>

    <!-- جدول لیست دانشجوها -->
    <section class="haf-card haf-students-table-wrapper">
      <table class="haf-table">
        <thead>
          <tr>
            <th>نام و نام خانوادگی</th>
            <th>موبایل</th>
            <th>کد ملی</th>
            <th>ایمیل</th>
            <th>تاریخ ایجاد</th>
            <th class="haf-table__actions-col">عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && students.length === 0">
            <td colspan="6" class="haf-table__empty">
              هیچ دانشجویی با این شرایط پیدا نشد.
            </td>
          </tr>

          <tr
            v-for="student in students"
            :key="student.id"
          >
<td>
<div class="haf-student-name-cell">
  <div class="haf-avatar-mini">
    <img
      v-if="student.avatar_url"
      :src="student.avatar_url"
      alt="avatar"
      class="haf-avatar-mini__img"
    />
    <span v-else>
      {{ getInitials(student) }}
    </span>
  </div>

  <div>
    <div class="haf-student-name">
      {{ student.full_name }}
    </div>
    <div class="haf-student-id haf-mono">
      {{ student.national_code || '—' }}
    </div>
  </div>
</div>
</td>
            <td>
              <span class="haf-mono">
                {{ student.phone || '—' }}
              </span>
            </td>
            <td>
              <span class="haf-mono">
                {{ student.national_code || '—' }}
              </span>
            </td>
            <td>{{ student.email || '—' }}</td>
            <td>
              {{ formatDate(student.created_at) }}
            </td>
<td class="haf-table__actions">
  <button
    type="button"
    class="haf-icon-btn"
    @click="goToProfile(student)"
    title="نمایش پروفایل"
  >
    👁
  </button>
  <button
    type="button"
    class="haf-icon-btn"
    @click="goToEdit(student)"
    title="ویرایش"
  >
    ✏️
  </button>
  <button
    type="button"
    class="haf-icon-btn haf-icon-btn--danger"
    @click="onDelete(student)"
    title="حذف"
  >
    🗑
  </button>
</td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup>
import './students.page.css'
import useStudents from './students.page.js'

definePageMeta({
  middleware: ['auth'],
})

const {
  students,
  loading,
  total,
  filters,
  fromDateInput,
  toDateInput,
  fetchStudents,
  resetFilters,
  onCreate,
  onRefresh,
  goToProfile,
  goToEdit,
  onDelete,
  getInitials,
  formatNumber,
  formatDate,
} = useStudents()
</script>
