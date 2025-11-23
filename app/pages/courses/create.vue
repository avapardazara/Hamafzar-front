<template>
  <section class="haf-profile-page haf-courses-page" dir="rtl">
    <!-- هدر اصلی صفحه -->
    <header class="haf-students-header" style="margin-bottom: 12px">
      <div>
        <h1 class="haf-students-title">
          {{ isEdit ? "ویرایش دوره" : "دوره جدید" }}
        </h1>
        <p class="haf-students-subtitle">
          تنظیم اطلاعات اصلی دوره، منتور، زمان‌بندی و جزئیات مالی
        </p>
      </div>

      <div class="haf-students-header-actions">
        <button type="button" class="haf-btn haf-btn--ghost" @click="goBack">
          ← بازگشت به لیست دوره‌ها
        </button>
      </div>
    </header>

    <!-- 🔹 سکشن بالایی: کاور + توضیح + تب‌ها -->
    <section class="haf-course-hero">
      <div class="haf-course-hero__grid">
        <!-- سمت چپ: کاور دوره -->
        <div class="haf-course-hero__media">
          <div class="haf-course-cover">
            <template v-if="coverPreview">
              <img
                :src="coverPreview"
                alt="کاور دوره"
                class="haf-course-cover__img"
              />
            </template>
            <template v-else>
              <div class="haf-course-cover__placeholder">
                تصویر کاور دوره را انتخاب کنید
              </div>
            </template>
          </div>

          <div style="margin-top: 12px; text-align: center">
            <label
              class="haf-btn haf-btn--primary haf-btn--block"
              style="cursor: pointer"
            >
              📷 انتخاب تصویر کاور
              <input
                type="file"
                accept="image/*"
                hidden
                @change="onCoverChange"
              />
            </label>
            <p class="haf-field__hint" style="margin-top: 8px">
              پیشنهاد: نسبت 16:9 با اندازه حداقل 720×1280 پیکسل.
            </p>
          </div>
        </div>

        <!-- سمت راست: توضیح کوتاه + تب‌ها -->
        <div class="haf-course-hero__info">
          <h2 class="haf-course-hero__title">تنظیمات دوره</h2>
          <p class="haf-course-hero__subtitle">
            ابتدا تصویر و اطلاعات کلی دوره را مشخص کنید، سپس از طریق تب‌ها
            جزئیات زمان‌بندی، مالی و دانشجوها را تکمیل کنید.
          </p>

          <!-- تب‌ها داخل سکشن بالایی -->
          <nav class="haf-tabs haf-tabs--inline">
            <button
              type="button"
              class="haf-tab"
              :class="{ 'haf-tab--active': activeTab === 'main' }"
              @click="activeTab = 'main'"
            >
              اطلاعات اصلی
            </button>
            <button
              type="button"
              class="haf-tab"
              :class="{ 'haf-tab--active': activeTab === 'schedule' }"
              @click="activeTab = 'schedule'"
            >
              زمان‌بندی
            </button>
            <button
              type="button"
              class="haf-tab"
              :class="{ 'haf-tab--active': activeTab === 'finance' }"
              @click="activeTab = 'finance'"
            >
              مالی
            </button>
            <button
              type="button"
              class="haf-tab"
              :class="{ 'haf-tab--active': activeTab === 'students' }"
              @click="activeTab = 'students'"
              :disabled="!isEdit"
            >
              دانشجوها
            </button>
          </nav>
        </div>
      </div>
    </section>

    <!-- 🔹 سکشن پایینی: فرم تب‌ها -->
    <main class="haf-profile-form haf-profile-form--padded">
      <!-- خطای کلی -->
      <p v-if="error" class="haf-form-error">
        {{ error }}
      </p>

      <!-- تب: اطلاعات اصلی -->
      <section v-if="activeTab === 'main'" class="haf-student-form">
        <div class="haf-student-form-grid">
          <div class="haf-field haf-field--full">
            <label class="haf-field__label">
              نام دوره
              <span style="color: #ef4444">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              class="haf-input"
              placeholder="مثلاً: بوت‌کمپ توسعه وب با Flask و Vue"
            />
          </div>

          <!-- منتور مسئول: سلکت‌ باکس -->
          <div class="haf-field">
            <label class="haf-field__label"> منتور مسئول </label>
            <select v-model="form.mentor_id" class="haf-input">
              <option value="">انتخاب منتور</option>
              <option v-for="m in mentorsOptions" :key="m.id" :value="m.id">
                {{ m.full_name }}
              </option>
            </select>
            <p class="haf-field__hint">
              تنها منتورهایی نمایش داده می‌شوند که از سیستم حذف نشده باشند.
            </p>
          </div>

          <div class="haf-field">
            <label class="haf-field__label"> ظرفیت دوره (تعداد نفرات) </label>
            <input
              v-model="form.capacity"
              type="number"
              min="0"
              class="haf-input"
              placeholder="مثلاً 25"
            />
          </div>

          <div class="haf-field">
            <label class="haf-field__label"> دسته‌بندی </label>
            <input
              v-model="form.category"
              type="text"
              class="haf-input"
              placeholder="مثلاً: برنامه‌نویسی، نرم‌افزار، مهارت نرم..."
            />
          </div>

          <div class="haf-field">
            <label class="haf-field__label"> سطح دوره </label>
            <select v-model="form.level" class="haf-input">
              <option value="">انتخاب کنید</option>
              <option value="BEGINNER">مقدماتی</option>
              <option value="INTERMEDIATE">متوسط</option>
              <option value="ADVANCED">پیشرفته</option>
            </select>
          </div>

          <div class="haf-field">
            <label class="haf-field__label"> وضعیت دوره </label>
            <select v-model="form.status" class="haf-input">
              <option value="ACTIVE">فعال</option>
              <option value="DRAFT">پیش‌نویس</option>
              <option value="ARCHIVED">آرشیو</option>
            </select>
          </div>

          <div class="haf-field haf-field--full">
            <label class="haf-field__label"> توضیحات دوره </label>
            <textarea
              v-model="form.description"
              rows="4"
              class="haf-input haf-input--textarea"
              placeholder="خلاصه‌ای از محتوای دوره، مخاطبان هدف و خروجی مورد انتظار..."
            ></textarea>
          </div>
        </div>
      </section>

      <!-- تب: زمان‌بندی -->
      <section v-else-if="activeTab === 'schedule'" class="haf-student-form">
        <div class="haf-student-form-grid">
          <div class="haf-field">
            <label class="haf-field__label"> تاریخ شروع </label>
            <input
              v-model="form.start_date"
              type="date"
              class="haf-input haf-input--date"
            />
          </div>

          <div class="haf-field">
            <label class="haf-field__label"> تاریخ پایان </label>
            <input
              v-model="form.end_date"
              type="date"
              class="haf-input haf-input--date"
            />
          </div>

          <div class="haf-field">
            <label class="haf-field__label"> زمان شروع (اختیاری) </label>
            <input v-model="form.start_time" type="time" class="haf-input" />
          </div>

          <div class="haf-field">
            <label class="haf-field__label"> زمان پایان (اختیاری) </label>
            <input v-model="form.end_time" type="time" class="haf-input" />
          </div>

          <!-- ============ زمان‌بندی جلسات ============ -->
          <div class="haf-card haf-mt-sm">
            <div class="haf-course-section-title">زمان‌بندی جلسات</div>

            <!-- نوع زمان‌بندی -->
            <div class="haf-schedule-box haf-mb-sm">
              <div class="haf-segmented">
                <button
                  type="button"
                  class="haf-chip-toggle"
                  :class="{
                    'haf-chip-toggle--active': form.schedule_type === 'CUSTOM',
                  }"
                  @click="form.schedule_type = 'CUSTOM'"
                >
                  تاریخ‌های سفارشی
                </button>
                <button
                  type="button"
                  class="haf-chip-toggle"
                  :class="{
                    'haf-chip-toggle--active': form.schedule_type === 'WEEKLY',
                  }"
                  @click="form.schedule_type = 'WEEKLY'"
                >
                  روزهای هفته
                </button>
              </div>

              <!-- CUSTOM -->
              <div v-if="form.schedule_type === 'CUSTOM'" class="haf-mt-sm">
                <div class="haf-course-section-title">تاریخ جلسات</div>

                <div class="haf-flex haf-gap-sm haf-mt-xs">
                  <input
                    v-model="customDateInput"
                    type="date"
                    class="haf-input"
                  />
                  <button
                    type="button"
                    class="haf-btn haf-btn--primary"
                    @click="addCustomDate"
                    :disabled="!customDateInput"
                  >
                    افزودن
                  </button>
                </div>

                <ul class="haf-chip-list" v-if="sessions.length">
                  <li
                    v-for="(s, i) in sessions"
                    :key="s.date + i"
                    class="haf-chip"
                  >
                    {{ i + 1 }}. {{ s.date }}
                    <button
                      type="button"
                      class="haf-chip__remove"
                      @click="removeCustomDate(i)"
                    >
                      حذف
                    </button>
                  </li>
                </ul>
                <div v-else class="haf-empty-state haf-mt-xs">
                  فعلاً تاریخی ثبت نشده.
                </div>
              </div>

              <!-- WEEKLY -->
              <div v-else class="haf-mt-sm">
                <div class="haf-course-section-title">روزهای هفته</div>

                <div class="haf-weekdays-grid haf-mt-xs">
                  <button
                    v-for="d in WEEK_DAYS"
                    :key="d.code"
                    type="button"
                    class="haf-weekday-pill"
                    :class="{
                      'haf-weekday-pill--active': weeklyDays.includes(d.code),
                    }"
                    @click="toggleWeeklyDay(d.code)"
                    :disabled="!!pairOdd"
                  >
                    {{ d.label }}
                  </button>
                </div>

                <div class="haf-course-section-title haf-mt-sm">
                  الگوی زوج / فرد
                </div>
                <div class="haf-segmented haf-mt-xs">
                  <button
                    type="button"
                    class="haf-chip-toggle"
                    :class="{ 'haf-chip-toggle--active': !pairOdd }"
                    @click="setPairOdd('')"
                  >
                    بدون الگو
                  </button>
                  <button
                    type="button"
                    class="haf-chip-toggle"
                    :class="{ 'haf-chip-toggle--active': pairOdd === 'PAIR' }"
                    @click="setPairOdd('PAIR')"
                  >
                    زوج
                  </button>
                  <button
                    type="button"
                    class="haf-chip-toggle"
                    :class="{ 'haf-chip-toggle--active': pairOdd === 'ODD' }"
                    @click="setPairOdd('ODD')"
                  >
                    فرد
                  </button>
                </div>

                <div class="haf-empty-state haf-mt-xs">
                  اگر زوج/فرد فعال شود، انتخاب روزهای هفته غیرفعال خواهد شد.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- تب: مالی -->
      <section v-else-if="activeTab === 'finance'" class="haf-student-form">
        <div class="haf-student-form-grid">
          <div class="haf-field">
            <label class="haf-field__label"> شهریه هر دانشجو (تومان) </label>
            <input
              v-model="form.fee_per_student"
              type="number"
              min="0"
              class="haf-input"
              placeholder="مثلاً ۴٬۵۰۰٬۰۰۰"
            />
          </div>

          <div class="haf-field">
            <label class="haf-field__label"> سهم منتور (%) </label>
            <input
              v-model="form.mentor_share_percent"
              type="number"
              step="0.1"
              min="0"
              max="100"
              class="haf-input"
              placeholder="مثلاً ۳۰"
            />
          </div>

          <div class="haf-field haf-field--full">
            <p class="haf-field__hint">
              جزئیات بیشتر مالی (اقساط، تخفیف‌ها و تسویه با منتور) از طریق ماژول
              «اقساط» مدیریت می‌شود و بعداً به این فرم متصل خواهد شد.
            </p>
          </div>
        </div>
      </section>

      <!-- تب: دانشجوها -->
      <section v-else-if="activeTab === 'students'" class="haf-student-form">
        <div class="haf-card haf-card--soft">
          <h3 class="haf-form-title">دانشجوهای ثبت‌نام‌شده در دوره</h3>
          <p class="haf-field__hint" style="margin-bottom: 10px">
            این تب فقط پس از ذخیره دوره فعال است. در نسخه Nuxt، این بخش به‌صورت
            مستقیم به پروفایل دوره و تب «دانشجوها» متصل می‌شود.
          </p>
          <p class="haf-field__hint">
            برای مدیریت ثبت‌نام‌ها، بعد از ذخیره دوره به پروفایل دوره بروید.
          </p>
        </div>
      </section>

      <!-- دکمه‌های اکشن پایین فرم -->
      <div class="haf-student-form-actions">
        <button type="button" class="haf-btn haf-btn--ghost" @click="goBack">
          انصراف
        </button>

        <button
          type="button"
          class="haf-btn haf-btn--primary"
          :disabled="submitting"
          @click="onSubmit"
        >
          {{
            submitting
              ? "در حال ذخیره..."
              : isEdit
              ? "ذخیره تغییرات"
              : "ثبت دوره"
          }}
        </button>
      </div>
    </main>
  </section>
</template>

<script setup>
import "../students/students.page.css";
import "./courses.page.css";
import { ref } from "vue";
import { useCourseForm } from "./courses.page.js";

definePageMeta({
  middleware: ["auth"],
});

const activeTab = ref("main");

const {
  WEEK_DAYS,
  sessions,
  weeklyDays,
  pairOdd,
  customDateInput,
  addCustomDate,
  removeCustomDate,
  toggleWeeklyDay,
  setPairOdd,
  loading,
  submitting,
  error,
  form,
  isEdit,
  coverPreview,
  onCoverChange,
  onSubmit,
  goBack,
  mentorsOptions, // ⬅️ حتماً در useCourseForm برگردونده بشه
} = useCourseForm();
</script>
