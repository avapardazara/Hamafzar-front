<template>
  <section class="haf-student-profile" dir="rtl">
    <!-- هدر بالا + دکمه برگشت -->
    <header class="haf-student-profile__header">
      <div class="haf-student-profile__title-wrap">
        <button type="button" class="haf-btn haf-btn--ghost haf-btn--sm" @click="goBack">
          ← بازگشت به لیست
        </button>
        <div>
          <h1 class="haf-student-profile__title">
            پروفایل دانشجو
          </h1>
          <p class="haf-student-profile__subtitle" v-if="student">
            {{ student.full_name || (student.first_name + ' ' + student.last_name) }}
            <span class="haf-student-profile__id">ID: {{ student.id }}</span>
          </p>
        </div>
      </div>

      <div class="haf-student-profile__header-actions" v-if="student">
        <button type="button" class="haf-btn haf-btn--outline" @click="goToEdit">
          ✏️ ویرایش اطلاعات
        </button>
      </div>
    </header>

    <!-- وضعیت لودینگ / خطا -->
    <section v-if="loading" class="haf-card haf-card--soft haf-mt">
      در حال بارگذاری پروفایل دانشجو...
    </section>
    <section v-else-if="error" class="haf-card haf-card--danger haf-mt">
      {{ error }}
    </section>

    <section v-else-if="student" class="haf-student-profile__body haf-mt">
      <!-- ستون اصلی + ستون ساید -->
      <div class="haf-student-profile__grid">
        <!-- ستون اصلی -->
        <div class="haf-student-profile__main">
          <!-- کارت هویت و مشخصات -->
          <section class="haf-card haf-card--soft haf-student-identity">
            <div class="haf-student-identity__header">
              <div class="haf-avatar-lg">
                <span>{{ getInitials(student) }}</span>
              </div>
              <div>
                <h2 class="haf-student-identity__name">
                  {{ student.full_name || (student.first_name + ' ' + student.last_name) }}
                </h2>
                <p class="haf-student-identity__meta">
                  موبایل:
                  <span class="haf-mono">{{ student.phone || '—' }}</span>
                  · کد ملی:
                  <span class="haf-mono">{{ student.national_code || '—' }}</span>
                </p>
              </div>
            </div>

            <dl class="haf-student-identity__details">
              <div class="haf-detail-row">
                <dt>ایمیل</dt>
                <dd>{{ student.email || 'ثبت نشده' }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>آدرس</dt>
                <dd>{{ student.address || 'ثبت نشده' }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>یادداشت داخلی</dt>
                <dd>{{ student.note || student.notes || '—' }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>وضعیت</dt>
                <dd>
                  <span
                    class="haf-status-pill"
                    :data-variant="student.status || 'active'"
                  >
                    {{ student.status === 'inactive' ? 'غیرفعال' : 'فعال' }}
                  </span>
                </dd>
              </div>
              <div class="haf-detail-row">
                <dt>تاریخ ایجاد</dt>
                <dd>{{ formatDate(student.created_at) }}</dd>
              </div>
            </dl>
          </section>

          <!-- 🔹 تب‌ها بر اساس منطق قدیمی: info / courses / skills / finance / installments -->
          <section class="haf-tabs haf-mt-lg">
            <!-- دکمه‌های تب -->
            <div class="haf-tabs__list tabs">
              <button
                type="button"
                class="haf-tabs__btn tab"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'info'
                }"
                data-tab="info"
                @click="activeTab = 'info'"
              >
                اطلاعات فردی
              </button>

              <button
                type="button"
                class="haf-tabs__btn tab"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'courses'
                }"
                data-tab="courses"
                @click="activeTab = 'courses'"
              >
                دوره‌ها
              </button>

              <button
                type="button"
                class="haf-tabs__btn tab"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'skills'
                }"
                data-tab="skills"
                @click="activeTab = 'skills'"
              >
                مهارت‌ها
              </button>

              <button
                type="button"
                class="haf-tabs__btn tab"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'finance'
                }"
                data-tab="finance"
                @click="activeTab = 'finance'"
              >
                مالی
              </button>

              <!-- تب اقساط فقط برای ادمین -->
              <button
                v-if="isAdmin"
                type="button"
                class="haf-tabs__btn tab"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'installments'
                }"
                data-tab="installments"
                @click="activeTab = 'installments'"
              >
                مدیریت اقساط
              </button>
            </div>

            <!-- محتوای تب‌ها -->
            <div class="haf-tabs__panels">
              <!-- Tab: Info -->
              <section
                id="tab-info"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'info'"
              >
  <div class="haf-grid-2 haf-mt haf-info-grid">
    <div class="haf-info-item">
      <div class="haf-field__label">نام و نام‌خانوادگی</div>
      <div class="haf-detail-row-value">
        {{ student.full_name || (student.first_name + ' ' + student.last_name) }}
      </div>
    </div>

    <div class="haf-info-item">
      <div class="haf-field__label">کدملی</div>
      <div class="haf-detail-row-value haf-mono">
        {{ student.national_code || '—' }}
      </div>
    </div>

    <div class="haf-info-item">
      <div class="haf-field__label">شماره موبایل</div>
      <div class="haf-detail-row-value haf-mono">
        {{ student.phone || '—' }}
      </div>
    </div>

    <div class="haf-info-item">
      <div class="haf-field__label">ایمیل</div>
      <div class="haf-detail-row-value">
        {{ student.email || '—' }}
      </div>
    </div>

    <div class="haf-info-item haf-info-item--full">
      <div class="haf-field__label">آدرس</div>
      <div class="haf-detail-row-value">
        {{ student.address || '—' }}
      </div>
    </div>

    <div class="haf-info-item haf-info-item--full">
      <div class="haf-field__label">یادداشت</div>
      <div class="haf-detail-row-value">
        {{ student.note || student.notes || '—' }}
      </div>
    </div>
  </div>
              </section>

              <!-- Tab: Courses -->
              <section
                id="tab-courses"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'courses'"
              >
                <div class="haf-card haf-card--soft haf-mt">
                  <div
                    style="display:grid; grid-template-columns: 1fr 180px 120px 120px; gap:8px; align-items:center;"
                  >
                    <input
                      type="text"
                      id="courseSearch"
                      placeholder="جستجوی دوره..."
                      class="haf-input"
                    />
                    <select
                      id="courseSelect"
                      class="haf-input"
                    ></select>
                    <select
                      id="courseStatus"
                      class="haf-input"
                    >
                      <option value="ONGOING">درحال برگزاری</option>
                      <option value="DONE">به‌اتمام‌رسیده</option>
                      <option value="DROPPED">انصراف</option>
                    </select>

                    <button
                      v-if="isAdmin"
                      id="btnEnroll"
                      type="button"
                      class="haf-btn haf-btn--primary"
                    >
                      افزودن
                    </button>
                  </div>
                </div>

                <div class="haf-card haf-card--soft haf-mt table-responsive">
                  <table class="haf-table data-table" id="enrollTable">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>عنوان دوره</th>
                        <th>منتور</th>
                        <th>وضعیت</th>
                        <th>تاریخ ثبت‌نام</th>
                        <th>اکشن</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </section>

              <!-- Tab: Skills -->
              <section
                id="tab-skills"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'skills'"
              >
                <div class="skills haf-mt">
                  <div class="skill-card-section haf-card haf-card--soft">
                    <h3>💻 مهارت‌های فنی</h3>
                    <div class="skill-input">
                      <input
                        type="text"
                        id="techInput"
                        placeholder="افزودن مهارت فنی"
                        class="haf-input"
                      />
                      <button type="button" id="btnAddTech" class="haf-btn haf-btn--primary">
                        ➕
                      </button>
                    </div>
                    <ul id="techList"></ul>
                  </div>

                  <div class="skill-card-section haf-card haf-card--soft haf-mt">
                    <h3>🤝 مهارت‌های نرم</h3>
                    <div class="skill-input skill-input--multi">
                      <input
                        type="text"
                        id="softInput"
                        placeholder="افزودن مهارت نرم"
                        class="haf-input"
                      />
                      <input
                        type="text"
                        id="softDate"
                        placeholder="تاریخ برگزاری (مثلاً 1403/07/18)"
                        class="haf-input"
                      />
                      <input
                        type="number"
                        id="softHours"
                        placeholder="ساعت"
                        min="1"
                        class="haf-input"
                      />
                      <button type="button" id="btnAddSoft" class="haf-btn haf-btn--primary">
                        ➕
                      </button>
                    </div>
                    <ul id="softList"></ul>
                  </div>
                </div>
              </section>

              <!-- Tab: Finance -->
              <section
                id="tab-finance"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'finance'"
              >
               <!-- خلاصه مالی (از کامپوزبل / بک‌اند) -->
                <div class="haf-metrics-grid haf-mt">
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">مانده حساب</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(finance?.totals?.balance || 0) }} تومان
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">اقساط فعال</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(finance?.totals?.installments_active || 0) }} قسط
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">مبلغ پرداخت‌شده</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(finance?.totals?.paid || 0) }} تومان
                    </p>
                  </div>
                </div>

                <!-- بخش قدیمی پرداخت / جدول‌ها: جا برای اتصال JS / API -->
                <div
                  v-if="isAdmin"
                  class="haf-card haf-card--soft haf-mt"
                  style="margin-bottom:12px;"
                >
                  <div
                    style="display:grid; grid-template-columns: 1fr 140px 120px 1fr 120px; gap:8px; align-items:center;"
                  >
                    <input
                      type="text"
                      id="payTitle"
                      placeholder="شرح تراکنش (مثلاً شهریه ترم 1)"
                      class="haf-input"
                    />
                    <input
                      type="number"
                      id="payAmount"
                      min="1"
                      placeholder="مبلغ"
                      class="haf-input"
                    />
                    <select id="payType" class="haf-input">
                      <option value="IN">دریافت</option>
                      <option value="OUT">پرداخت</option>
                    </select>
                    <select id="payCourse" class="haf-input">
                      <option value="">— نسبت‌دادن به دوره (اختیاری) —</option>
                    </select>
                    <button id="btnPayAdd" class="haf-btn haf-btn--primary">
                      افزودن
                    </button>
                  </div>
                </div>

                <div class="haf-card haf-card--soft haf-mt table-responsive" style="margin-bottom:10px;">
                  <table class="haf-table data-table" id="perCourseTable">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>دوره</th>
                        <th>شهریه</th>
                        <th>دریافت‌شده</th>
                        <th>بدهی</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>

                <div class="haf-card haf-card--soft table-responsive">
                  <table class="haf-table data-table" id="payTable">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>شرح</th>
                        <th>نوع</th>
                        <th>مبلغ</th>
                        <th>تاریخ</th>
                        <th>اکشن</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </section>

              <!-- Tab: Installments - فقط ادمین -->
              <section
                v-if="isAdmin"
                id="tab-installments"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'installments'"
              >
                <h3 class="haf-tabs__panel-title">مدیریت اقساط</h3>
                <p class="haf-tabs__panel-desc">
                  مدیریت برنامه‌های اقساطی مرتبط با دانشجو.
                </p>

                <div class="haf-card haf-card--soft table-responsive haf-mt">
                  <table class="haf-table data-table" id="instTable">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>برنامه</th>
                        <th>دوره</th>
                        <th>قسط</th>
                        <th>سررسید</th>
                        <th>مبلغ کل</th>
                        <th>مبلغ پایه</th>
                        <th>کارمزد چک</th>
                        <th>وضعیت</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
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
                <span>دوره‌های فعال</span>
                <strong>{{ formatNumber(stats?.courses_count || 0) }}</strong>
              </li>
              <li>
                <span>مهارت‌های ثبت‌شده</span>
                <strong>{{ formatNumber(stats?.skills_count || 0) }}</strong>
              </li>
              <li>
                <span>مانده حساب</span>
                <strong>{{ formatNumber(stats?.balance || 0) }} تومان</strong>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </section>

    <section v-else class="haf-card haf-mt">
      دانشجو پیدا نشد.
    </section>
  </section>
</template>

<script setup>
import './students.page.css'
import { ref, computed } from 'vue'
import { useStudentProfile } from './students.page.js'

definePageMeta({
  middleware: ['auth'],
})

const {
  loading,
  error,
  student,
  stats,
  finance,
  formatNumber,
  formatDate,
  getInitials,
  goBack,
  goToEdit,
} = useStudentProfile()

// 🔹 تب فعال: مطابق منطق قدیمی 'info' / 'courses' / 'skills' / 'finance' / 'installments'
const activeTab = ref('info')

// 🔹 تشخیص ادمین – بر اساس فیلد role یا current_user_role از بک‌اند
const isAdmin = computed(() => {
  const role =
    (student.value?.current_user_role ||
      student.value?.role ||
      ''
    ).toString().toLowerCase()
  return role === 'admin'
})
</script>
