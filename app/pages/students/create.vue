<template>
  <div class="haf-students-page">
    <!-- هدر بالا -->
    <div class="haf-students-header">
      <div>
        <h1 class="haf-students-title">ایجاد دانشجو</h1>
        <p class="haf-students-subtitle">
          ثبت دانشجوی جدید در سیستم هم‌افزار و اتصال او به جریان آموزشی.
        </p>
      </div>

      <div class="haf-students-header-actions">
        <button
          type="button"
          class="haf-btn haf-btn--ghost"
          @click="goBackToList"
        >
          بازگشت به لیست
        </button>
      </div>
    </div>

    <!-- کارت فرم -->
    <div class="haf-card">
      <form class="haf-student-form" @submit.prevent="onSubmit">
        <!-- گرید اصلی فرم -->
        <div class="haf-student-form-grid">
          <!-- آواتار - تمام عرض -->
          <div class="haf-field haf-field--full">
            <div class="haf-profile-side" style="width: 100%; max-width: 340px;">
              <div class="haf-avatar-box">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="Avatar preview"
                  class="haf-avatar-img"
                >
                <div v-else class="haf-avatar-placeholder">
                  {{ initials || "?" }}
                </div>

                <label class="haf-avatar-upload">
                  📷
                  <input
                    type="file"
                    class="haf-input haf-input--file"
                    accept="image/*"
                    @change="onAvatarChange"
                    hidden
                  >
                </label>
              </div>

              <div class="haf-profile-name" style="margin-top: 10px; font-size: 16px;">
                {{ form.full_name || 'نام دانشجو' }}
              </div>
              <div class="haf-profile-id haf-mono">
                {{ form.national_code || 'کد ملی / شناسه' }}
              </div>
            </div>
          </div>

          <!-- نام -->
          <div class="haf-field">
            <label class="haf-field__label">نام</label>
            <input
              v-model="form.first_name"
              type="text"
              class="haf-input"
              placeholder="مثلاً علی"
              @input="autoFullName"
            >
          </div>

          <!-- نام خانوادگی -->
          <div class="haf-field">
            <label class="haf-field__label">نام خانوادگی</label>
            <input
              v-model="form.last_name"
              type="text"
              class="haf-input"
              placeholder="مثلاً رضایی"
              @input="autoFullName"
            >
          </div>

          <!-- نام کامل (فقط‌خواندنی) -->
          <div class="haf-field haf-field--full">
            <label class="haf-field__label">نام کامل</label>
            <input
              v-model="form.full_name"
              type="text"
              class="haf-input"
              readonly
            >
            <div class="haf-field__hint">
              این فیلد به‌صورت خودکار از روی نام و نام خانوادگی پر می‌شود، اما می‌توانی دستی هم اصلاحش کنی.
            </div>
          </div>

          <!-- موبایل -->
          <div class="haf-field">
            <label class="haf-field__label">شماره موبایل</label>
            <input
              v-model="form.mobile"
              type="text"
              class="haf-input"
              placeholder="09xxxxxxxxx"
            >
          </div>

          <!-- ایمیل -->
          <div class="haf-field">
            <label class="haf-field__label">ایمیل</label>
            <input
              v-model="form.email"
              type="email"
              class="haf-input"
              placeholder="student@example.com"
            >
          </div>

          <!-- کد ملی -->
          <div class="haf-field">
            <label class="haf-field__label">کد ملی</label>
            <input
              v-model="form.national_code"
              type="text"
              class="haf-input haf-mono"
              placeholder="xxxxxxxxxx"
            >
          </div>

          <!-- هر فیلد اضافه دیگری که در بک‌اند داری می‌تونی اینجا اضافه کنی -->
        </div>

        <!-- پیام خطای کلی -->
        <p v-if="error" class="haf-form-error">
          {{ error }}
        </p>

        <!-- اکشن‌های پایین فرم -->
        <div class="haf-student-form-actions">
          <button
            type="button"
            class="haf-btn haf-btn--ghost"
            @click="cancel"
          >
            لغو
          </button>

          <button
            type="submit"
            class="haf-btn haf-btn--primary"
            :disabled="saving"
          >
            <span v-if="saving">در حال ذخیره...</span>
            <span v-else>ذخیره دانشجو</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import './students.page.css'
import { useStudentForm } from './students.page.js'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()

const {
  form,
  loading,   // فعلاً استفاده خاصی ندارد، ولی برای آینده می‌گذاریم
  saving,
  error,
  onSubmit,
  autoFullName,
} = useStudentForm()

// 👉 پیش‌نمایش آواتار (سمت فرانت فقط برای UI؛ فعلاً به بک‌اند نمی‌فرستیم)
const avatarPreview = ref(null)

function onAvatarChange (event) {
  const file = event.target.files?.[0]
  if (!file) {
    avatarPreview.value = null
    return
  }

  const reader = new FileReader()
  reader.onload = e => {
    avatarPreview.value = e.target?.result || null
  }
  reader.readAsDataURL(file)
}

// 👉 اینیشیال‌ها برای نمایش داخل آواتار
const initials = computed(() => {
  const first = form.first_name?.[0] || ''
  const last = form.last_name?.[0] || ''
  const combo = `${first}${last}`.trim()
  return combo || ''
})

// 👉 دکمه‌های ناوبری
function goBackToList () {
  router.push('/students')
}

function cancel () {
  router.push('/students')
}
</script>
