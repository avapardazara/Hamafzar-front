<!-- app/pages/mentors/create.vue -->
<template>
  <section class="haf-mentors-page" dir="rtl">
    <!-- هدر -->
    <header class="haf-mentors-header">
      <div>
        <h1 class="haf-mentors-title">
          {{ isEdit ? 'ویرایش منتور' : 'ثبت منتور جدید' }}
        </h1>
        <p class="haf-mentors-subtitle">
          {{ isEdit ? 'ویرایش اطلاعات و حساب کاربری منتور در سیستم هم‌افزار.' : 'تعریف منتور جدید و تنظیم اطلاعات ارتباطی و حساب کاربری.' }}
        </p>
      </div>
      <div class="haf-mentors-header-actions">
        <button
          type="button"
          class="haf-btn haf-btn--ghost"
          @click="goBack"
        >
          ← بازگشت به لیست منتورها
        </button>
      </div>
    </header>

    <!-- فرم -->
    <section class="haf-card">
      <form class="haf-student-form haf-mentor-form" @submit.prevent="onSubmit">
        <div v-if="error" class="haf-form-error">
          {{ error }}
        </div>

        <!-- ردیف آواتار + نام -->
        <div class="haf-student-form-grid">
          <div class="haf-field haf-field--full">
            <label class="haf-field__label">تصویر منتور</label>
            <div class="haf-avatar-upload-row">
              <div class="haf-avatar-lg">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="avatar"
                >
                <span v-else>
                  {{ (form.first_name || 'M')[0].toUpperCase() }}
                </span>
              </div>
              <div class="haf-avatar-upload-meta">
                <label class="haf-btn haf-btn--ghost haf-btn--sm">
                  انتخاب تصویر
                  <input
                    type="file"
                    class="haf-input--file"
                    accept="image/*"
                    @change="onAvatarChange"
                    hidden
                  >
                </label>
                <p class="haf-field__hint">
                  بهتر است تصویر مربعی با حداقل ابعاد ۳۰۰×۳۰۰ پیکسل آپلود شود.
                </p>
              </div>
            </div>
          </div>

          <!-- نام / نام خانوادگی -->
          <div class="haf-field">
            <label class="haf-field__label">نام</label>
            <input
              v-model="form.first_name"
              type="text"
              class="haf-input"
              required
              placeholder="نام منتور"
            >
          </div>
          <div class="haf-field">
            <label class="haf-field__label">نام خانوادگی</label>
            <input
              v-model="form.last_name"
              type="text"
              class="haf-input"
              required
              placeholder="نام خانوادگی منتور"
            >
          </div>

          <!-- ایمیل / موبایل -->
          <div class="haf-field">
            <label class="haf-field__label">ایمیل</label>
            <input
              v-model="form.email"
              type="email"
              class="haf-input"
              placeholder="example@email.com"
            >
          </div>
          <div class="haf-field">
            <label class="haf-field__label">شماره تماس</label>
            <input
              v-model="form.phone"
              type="text"
              class="haf-input"
              placeholder="مثلاً 0912..."
            >
          </div>

          <!-- کدملی / آدرس -->
          <div class="haf-field">
            <label class="haf-field__label">کد ملی</label>
            <input
              v-model="form.national_code"
              type="text"
              class="haf-input"
              placeholder="کد ملی منتور"
            >
          </div>

          <div class="haf-field haf-field--full">
            <label class="haf-field__label">آدرس</label>
            <textarea
              v-model="form.address"
              rows="2"
              class="haf-input haf-input--textarea"
              placeholder="آدرس محل سکونت / محل کار منتور"
            />
          </div>

          <!-- بیو / یادداشت داخلی -->
          <div class="haf-field haf-field--full">
            <label class="haf-field__label">بیو / معرفی کوتاه</label>
            <textarea
              v-model="form.bio"
              rows="2"
              class="haf-input haf-input--textarea"
              placeholder="توضیحی کوتاه درباره سوابق، تخصص‌ها و حوزه کاری منتور"
            />
          </div>

          <div class="haf-field haf-field--full">
            <label class="haf-field__label">یادداشت داخلی (فقط برای ادمین)</label>
            <textarea
              v-model="form.note"
              rows="2"
              class="haf-input haf-input--textarea"
              placeholder="یادداشت‌های داخلی برای تیم (در گزارش‌ها نمایش داده نمی‌شود)"
            />
          </div>
        </div>

        <!-- حساب کاربری ورود -->
        <div class="haf-mentor-account-block">
          <div class="haf-mentor-account-header">
            <div>
              <div class="haf-mentor-account-title">
                حساب کاربری ورود (اختیاری)
              </div>
              <p class="haf-field__hint">
                در صورت نیاز می‌توانی برای این منتور یک حساب کاربری جهت ورود به پنل تعریف کنی.
              </p>
            </div>

            <label class="haf-chip haf-chip--soft">
              <input
                v-model="form.acc_create"
                type="checkbox"
                class="haf-chip__checkbox"
              >
              <span>ساخت / تنظیم حساب کاربری</span>
            </label>
          </div>

          <div
            class="haf-student-form-grid haf-mentor-account-grid"
            :class="{ 'haf-mentor-account-grid--disabled': !form.acc_create && !isEdit }"
          >
            <div class="haf-field">
              <label class="haf-field__label">نام کاربری</label>
              <input
                v-model="form.acc_username"
                type="text"
                class="haf-input"
                placeholder="username"
                :disabled="!form.acc_create && !isEdit"
              >
            </div>

            <div class="haf-field">
              <label class="haf-field__label">ایمیل ورود</label>
              <input
                v-model="form.acc_email"
                type="email"
                class="haf-input"
                placeholder="ایمیل مخصوص لاگین (در صورت نیاز)"
                :disabled="!form.acc_create && !isEdit"
              >
            </div>

            <div class="haf-field">
              <label class="haf-field__label">
                {{ isEdit ? 'رمز جدید (اختیاری)' : 'رمز عبور' }}
              </label>
              <input
                v-model="form.acc_password"
                type="password"
                class="haf-input"
                minlength="6"
                :placeholder="isEdit ? 'در صورت خالی گذاشتن، رمز فعلی حفظ می‌شود' : 'حداقل ۶ کاراکتر'"
                :disabled="!form.acc_create && !isEdit"
              >
            </div>

            <div class="haf-field">
              <label class="haf-field__label">تکرار رمز</label>
              <input
                v-model="form.acc_password2"
                type="password"
                class="haf-input"
                minlength="6"
                placeholder="تکرار رمز"
                :disabled="!form.acc_create && !isEdit"
              >
            </div>
          </div>

          <p class="haf-field__hint">
            اگر این بخش را خالی بگذاری یا تیک بالا را نزنی، حساب کاربری جدید ساخته نمی‌شود.
          </p>
        </div>

        <!-- اکشن‌های پایین فرم -->
        <div class="haf-student-form-actions">
          <button
            type="button"
            class="haf-btn haf-btn--ghost"
            @click="goBack"
            :disabled="submitting"
          >
            انصراف
          </button>
          <button
            type="submit"
            class="haf-btn haf-btn--primary"
            :disabled="submitting"
          >
            {{ submitting ? 'در حال ذخیره...' : (isEdit ? 'ثبت تغییرات منتور' : 'ثبت منتور') }}
          </button>
        </div>
      </form>
    </section>
  </section>
</template>

<script setup>
import '../students/students.page.css'
import './mentors.page.css'
import { useMentorForm } from './mentors.page.js'

definePageMeta({
  middleware: ['auth']
})

const {
  loading,
  submitting,
  error,
  form,
  isEdit,
  avatarPreview,
  onAvatarChange,
  onSubmit,
  goBack
} = useMentorForm()
</script>
