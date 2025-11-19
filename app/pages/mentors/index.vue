<!-- app/pages/mentors/index.vue -->
<template>
  <section class="haf-mentors-page" dir="rtl">
    <!-- هدر بالا -->
    <header class="haf-mentors-header">
      <div>
        <h1 class="haf-mentors-title">منتورها</h1>
        <p class="haf-mentors-subtitle">
          مدیریت منتورهای فعال، وضعیت همکاری و دسترسی آن‌ها در هم‌افزار.
        </p>
      </div>

      <div class="haf-mentors-header-actions">
        <button
          type="button"
          class="haf-btn haf-btn--ghost"
          @click="fetchMentors"
          :disabled="loading"
        >
          🔄 بروزرسانی لیست
        </button>
        <button
          type="button"
          class="haf-btn haf-btn--primary"
          @click="goToCreate"
        >
          ➕ ثبت منتور جدید
        </button>
      </div>
    </header>

    <!-- فیلترها -->
    <section class="haf-card haf-mentors-filters">
      <div class="haf-filters-row">
        <div class="haf-field haf-field--inline">
          <label class="haf-field__label">جستجو</label>
          <input
            v-model="filters.q"
            type="text"
            class="haf-input"
            placeholder="نام، ایمیل یا موبایل منتور را وارد کنید..."
            @keyup.enter="applyFilters"
          >
        </div>

        <div class="haf-field haf-field--inline">
          <label class="haf-field__label">وضعیت</label>
          <select
            v-model="filters.status"
            class="haf-input"
            @change="applyFilters"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>

        <div class="haf-field haf-field--compact">
          <label class="haf-field__label">&nbsp;</label>
          <div class="haf-mentors-filter-actions">
            <button
              type="button"
              class="haf-btn haf-btn--ghost"
              @click="resetFilters"
              :disabled="loading"
            >
              پاک کردن فیلترها
            </button>
            <button
              type="button"
              class="haf-btn haf-btn--primary"
              @click="applyFilters"
              :disabled="loading"
            >
              اعمال فیلتر
            </button>
          </div>
        </div>
      </div>

      <div class="haf-filters-meta">
        <span class="haf-chip">
          منتورهای پیدا شده:
          <strong>{{ total }}</strong>
        </span>
      </div>
    </section>

    <!-- جدول -->
    <section class="haf-card haf-mentors-table-wrapper">
      <div v-if="error" class="haf-form-error">
        {{ error }}
      </div>

      <div v-if="loading" class="haf-table__empty">
        در حال بارگذاری لیست منتورها...
      </div>

      <table v-else class="haf-table">
        <thead>
          <tr>
            <th style="width: 48px;">#</th>
            <th>منتور</th>
            <th>ایمیل</th>
            <th>موبایل</th>
            <th>وضعیت</th>
            <th class="haf-table__actions-col">اکشن‌ها</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!hasRows">
            <td colspan="6" class="haf-table__empty">
              هنوز هیچ منتوری ثبت نشده است.
            </td>
          </tr>

          <tr
            v-for="(mentor, index) in mentors"
            :key="mentor.id || index"
          >
            <td>{{ index + 1 }}</td>

            <!-- ستون نام و آواتار -->
            <td>
              <div class="haf-mentor-name-cell">
                <div class="haf-avatar-mini">
                  <img
                    v-if="mentor.avatar_url"
                    :src="mentor.avatar_url"
                    alt="avatar"
                    class="haf-avatar-mini__img"
                  />
                  <span v-else>
                    {{ mentor.avatar_meta?.initials || 'M' }}
                  </span>
                </div>
                <div>
                  <div class="haf-mentor-name">
                    {{ mentor.full_name || (mentor.first_name + ' ' + mentor.last_name) || 'بدون نام' }}
                  </div>
                  <div class="haf-mentor-tagline">
                    {{ mentor.title || mentor.specialty || 'منتور هم‌افزار' }}
                  </div>
                </div>
              </div>
            </td>

            <!-- ایمیل -->
            <td>
              <span class="haf-mono">
                {{ mentor.email || '—' }}
              </span>
            </td>

            <!-- موبایل -->
            <td>
              <span class="haf-mono">
                {{ mentor.phone || '—' }}
              </span>
            </td>

            <!-- وضعیت -->
            <td>
              <span
                class="haf-status-pill"
                :data-variant="mentor.status || 'active'"
              >
                {{ mentor.status === 'inactive' ? 'غیرفعال' : 'فعال' }}
              </span>
            </td>

            <!-- اکشن‌ها -->
            <td class="haf-table__actions-col">
  <div class="haf-table__actions">
    <!-- مشاهده پروفایل -->
    <button
      type="button"
      class="haf-link-btn"
      @click="goToProfile(mentor)"
    >
      👁 
    </button>

    <!-- ویرایش -->
    <button
      type="button"
      class="haf-icon-btn"
      title="ویرایش منتور"
      @click="goToEdit(mentor)"
    >
      ✏️
    </button>

    <!-- حذف نرم (غیرفعال کردن) -->
    <button
      type="button"
      class="haf-icon-btn haf-icon-btn--danger"
      title="غیرفعال کردن منتور"
      @click="softDeleteMentor(mentor)"
    >
      🗑
    </button>
  </div>
</td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup>
import '../students/students.page.css'      // استفاده از بیس UI دانشجو
import './mentors.page.css'                // استایل اختصاصی منتورها
import { useMentors } from './mentors.page.js'

definePageMeta({
  middleware: ['auth'],
})

const {
  loading,
  error,
  mentors,
  total,
  filters,
  hasRows,
  fetchMentors,
  applyFilters,
  resetFilters,
  goToCreate,
  goToProfile,
  softDeleteMentor,
  goToEdit,
} = useMentors()
</script>
