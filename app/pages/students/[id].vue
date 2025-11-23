<template>
  <section class="haf-student-profile" dir="rtl">
    <!-- هدر بالا + دکمه برگشت -->
    <header class="haf-student-profile__header">
      <div class="haf-student-profile__title-wrap">
        <button
          type="button"
          class="haf-btn haf-btn--ghost haf-btn--sm"
          @click="goBack"
        >
          ← بازگشت به لیست
        </button>
        <div>
          <h1 class="haf-student-profile__title">پروفایل دانشجو</h1>
          <p class="haf-student-profile__subtitle" v-if="student">
            {{
              student.full_name || student.first_name + " " + student.last_name
            }}
            <span class="haf-student-profile__id">ID: {{ student.id }}</span>
          </p>
        </div>
      </div>

      <div class="haf-student-profile__header-actions" v-if="student">
        <button
          type="button"
          class="haf-btn haf-btn--outline"
          @click="goToEdit"
        >
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
                  {{
                    student.full_name ||
                    student.first_name + " " + student.last_name
                  }}
                </h2>
                <p class="haf-student-identity__meta">
                  موبایل:
                  <span class="haf-mono">{{ student.phone || "—" }}</span>
                  · کد ملی:
                  <span class="haf-mono">{{
                    student.national_code || "—"
                  }}</span>
                </p>
              </div>
            </div>

            <dl class="haf-student-identity__details">
              <div class="haf-detail-row">
                <dt>ایمیل</dt>
                <dd>{{ student.email || "ثبت نشده" }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>آدرس</dt>
                <dd>{{ student.address || "ثبت نشده" }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>یادداشت داخلی</dt>
                <dd>{{ student.note || student.notes || "—" }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>وضعیت</dt>
                <dd>
                  <span
                    class="haf-status-pill"
                    :data-variant="student.status || 'active'"
                  >
                    {{ student.status === "inactive" ? "غیرفعال" : "فعال" }}
                  </span>
                </dd>
              </div>
              <div class="haf-detail-row">
                <dt>تاریخ ایجاد</dt>
                <dd>{{ formatDate(student.created_at) }}</dd>
              </div>
            </dl>
          </section>

          <!-- 🔹 تب‌ها: info / courses / skills / finance / installments -->
          <section class="haf-tabs haf-mt-lg">
            <!-- دکمه‌های تب -->
            <div class="haf-tabs__list tabs">
              <button
                type="button"
                class="haf-tabs__btn tab"
                :class="{
                  'haf-tabs__btn--active active': activeTab === 'info',
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
                  'haf-tabs__btn--active active': activeTab === 'courses',
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
                  'haf-tabs__btn--active active': activeTab === 'skills',
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
                  'haf-tabs__btn--active active': activeTab === 'finance',
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
                  'haf-tabs__btn--active active': activeTab === 'installments',
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
                      {{
                        student.full_name ||
                        student.first_name + " " + student.last_name
                      }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">کدملی</div>
                    <div class="haf-detail-row-value haf-mono">
                      {{ student.national_code || "—" }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">شماره موبایل</div>
                    <div class="haf-detail-row-value haf-mono">
                      {{ student.phone || "—" }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">ایمیل</div>
                    <div class="haf-detail-row-value">
                      {{ student.email || "—" }}
                    </div>
                  </div>

                  <div class="haf-info-item haf-info-item--full">
                    <div class="haf-field__label">آدرس</div>
                    <div class="haf-detail-row-value">
                      {{ student.address || "—" }}
                    </div>
                  </div>

                  <div class="haf-info-item haf-info-item--full">
                    <div class="haf-field__label">یادداشت</div>
                    <div class="haf-detail-row-value">
                      {{ student.note || student.notes || "—" }}
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
                  <p class="haf-card__title">دوره‌های دانشجو</p>
                  <p class="haf-card__subtitle">
                    لیست دوره‌هایی که این دانشجو در آن‌ها ثبت‌نام شده است.
                  </p>
                </div>

                <div class="haf-card haf-card--soft haf-mt table-responsive">
                  <table class="haf-table data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>عنوان دوره</th>
                        <th>منتور</th>
                        <th>وضعیت</th>
                        <th>تاریخ ثبت‌نام</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="coursesLoading">
                        <td colspan="5">در حال بارگذاری دوره‌ها...</td>
                      </tr>
                      <tr v-else-if="coursesError">
                        <td colspan="5" class="haf-text-danger">
                          {{ coursesError }}
                        </td>
                      </tr>
                      <tr v-else-if="!courses || !courses.length">
                        <td colspan="5" class="haf-table__empty">
                          هنوز دوره‌ای برای این دانشجو ثبت نشده است.
                        </td>
                      </tr>
                      <tr
                        v-else
                        v-for="(c, idx) in courses"
                        :key="c.id || c.course_id || idx"
                      >
                        <td>{{ idx + 1 }}</td>
                        <td>{{ c.course_title || c.title || "—" }}</td>
                        <td>{{ c.mentor_name || "—" }}</td>
                        <td>
                          <span class="haf-chip">
                            {{ c.status || "ONGOING" }}
                          </span>
                        </td>
                        <td class="haf-mono">
                          {{ formatDate(c.enrolled_at) }}
                        </td>
                      </tr>
                    </tbody>
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
                  <!-- مهارت‌های فنی -->
                  <div class="skill-card-section haf-card haf-card--soft">
                    <h3>💻 مهارت‌های فنی</h3>
                    <div class="skill-input">
                      <input
                        type="text"
                        v-model="techSkillInput"
                        placeholder="افزودن مهارت فنی"
                        class="haf-input"
                      />
                      <button
                        type="button"
                        class="haf-btn haf-btn--primary"
                        @click="onAddTechSkill"
                      >
                        ➕
                      </button>
                    </div>
                    <ul class="haf-tag-list">
                      <li
                        v-for="(s, idx) in skillsTech"
                        :key="idx"
                        class="haf-tag-item"
                      >
                        <span>{{ s }}</span>
                        <button
                          type="button"
                          class="haf-tag-item__remove"
                          @click="removeTechSkill(idx)"
                        >
                          ✕
                        </button>
                      </li>
                      <li v-if="!skillsTech.length" class="haf-table__empty">
                        هنوز مهارت فنی ثبت نشده است.
                      </li>
                    </ul>
                  </div>

                  <!-- مهارت‌های نرم -->
                  <div
                    class="skill-card-section haf-card haf-card--soft haf-mt"
                  >
                    <h3>🤝 مهارت‌های نرم</h3>
                    <div class="skill-input skill-input--multi">
                      <input
                        type="text"
                        v-model="softSkillTitle"
                        placeholder="افزودن مهارت نرم"
                        class="haf-input"
                      />
                      <input
                        type="text"
                        v-model="softSkillDate"
                        placeholder="تاریخ برگزاری (مثلاً 1403/07/18)"
                        class="haf-input"
                      />
                      <input
                        type="number"
                        v-model.number="softSkillHours"
                        placeholder="ساعت"
                        min="1"
                        class="haf-input"
                      />
                      <button
                        type="button"
                        class="haf-btn haf-btn--primary"
                        @click="onAddSoftSkill"
                      >
                        ➕
                      </button>
                    </div>
                    <ul class="haf-tag-list">
                      <li
                        v-for="(s, idx) in skillsSoft"
                        :key="idx"
                        class="haf-tag-item"
                      >
                        <span>
                          {{ s.title }}
                          <small v-if="s.date"> ({{ s.date }}) </small>
                          <small v-if="s.hours"> - {{ s.hours }} ساعت </small>
                        </span>
                        <button
                          type="button"
                          class="haf-tag-item__remove"
                          @click="removeSoftSkill(idx)"
                        >
                          ✕
                        </button>
                      </li>
                      <li v-if="!skillsSoft.length" class="haf-table__empty">
                        هنوز مهارت نرم ثبت نشده است.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <!-- Tab: Finance -->
              <section
                id="tab-finance"
                class="haf-tabs__panel tab-panel"
                v-show="activeTab === 'finance'"
              >
                <!-- خلاصه مالی (از بک‌اند / API پروفایل دانشجو) -->
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
                      {{
                        formatNumber(finance?.totals?.installments_active || 0)
                      }}
                      قسط
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">مبلغ پرداخت‌شده</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(finance?.totals?.paid || 0) }} تومان
                    </p>
                  </div>
                </div>

                <!-- بخش قدیمی پرداخت / جدول‌ها (فعلاً UI قدیمی) -->
                <div
                  v-if="isAdmin"
                  class="haf-card haf-card--soft haf-mt"
                  style="margin-bottom: 12px"
                >
                  <div
                    style="
                      display: grid;
                      grid-template-columns: 1fr 140px 120px 1fr 120px;
                      gap: 8px;
                      align-items: center;
                    "
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

                <div
                  class="haf-card haf-card--soft haf-mt table-responsive"
                  style="margin-bottom: 10px"
                >
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
                    <tbody>
                      <!-- بعداً با API پر می‌شه -->
                    </tbody>
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
                    <tbody>
                      <!-- بعداً با API پر می‌شه -->
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- Tab: Installments - فقط ادمین -->
              <section
                v-if="activeTab === 'installments'"
                class="haf-tabs__panel"
              >
                <h3 class="haf-tabs__panel-title">وضعیت اقساط دانشجو</h3>
                <p class="haf-tabs__panel-desc">
                  در این بخش می‌توانی تمام اقساط تعریف‌شده برای این دانشجو را
                  ببینی؛ شامل مبلغ کل، مبالغ پرداخت‌شده و مانده هر پلن اقساط.
                </p>

                <!-- لودینگ / خطا -->
                <div
                  v-if="installmentsLoading"
                  class="haf-card haf-card--soft haf-mt"
                >
                  در حال بارگذاری اطلاعات اقساط...
                </div>

                <div
                  v-else-if="installmentsError"
                  class="haf-card haf-card--danger haf-mt"
                >
                  {{ installmentsError }}
                </div>

                <template v-else>
                  <!-- خلاصه کلی اقساط -->
                  <div class="haf-metrics-grid haf-mt">
                    <div class="haf-metric-card">
                      <p class="haf-metric-card__label">جمع کل اقساط</p>
                      <p class="haf-metric-card__value">
                        {{ formatMoneyFa(installmentSummary.sum_total) }} تومان
                      </p>
                    </div>
                    <div class="haf-metric-card">
                      <p class="haf-metric-card__label">مبلغ پرداخت‌شده</p>
                      <p class="haf-metric-card__value">
                        {{ formatMoneyFa(installmentSummary.sum_paid) }} تومان
                      </p>
                    </div>
                    <div class="haf-metric-card">
                      <p class="haf-metric-card__label">مانده اقساط</p>
                      <p class="haf-metric-card__value haf-text-danger">
                        {{ formatMoneyFa(installmentSummary.sum_remain) }} تومان
                      </p>
                    </div>
                  </div>

                  <!-- خلاصه پلن‌های اقساط -->
                  <div
                    v-if="installmentPlans && installmentPlans.length"
                    class="haf-card haf-card--soft haf-mt"
                  >
                    <div class="haf-card__header-row">
                      <h4 class="haf-card__title">پلن‌های اقساط ثبت‌شده</h4>
                      <span class="haf-chip">
                        تعداد پلن: {{ installmentPlans.length }}
                      </span>
                    </div>

                    <table class="haf-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>عنوان پلن</th>
                          <th>دوره</th>
                          <th>مبلغ کل پلن</th>
                          <th>پرداخت‌شده</th>
                          <th>مانده</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(p, idx) in installmentPlans"
                          :key="p.id || idx"
                        >
                          <td>{{ idx + 1 }}</td>
                          <td>{{ p.title || "پلن اقساط" }}</td>
                          <td class="haf-mono">{{ p.course_id || "—" }}</td>
                          <td class="haf-mono">
                            {{ formatMoneyFa(p.total_amount) }} تومان
                          </td>
                          <td class="haf-mono">
                            {{ formatMoneyFa(p.paid) }} تومان
                          </td>
                          <td class="haf-mono haf-text-danger">
                            {{ formatMoneyFa(p.remain) }} تومان
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- لیست تک‌تک اقساط -->
                  <div class="haf-card haf-card--soft haf-mt">
                    <div class="haf-card__header-row">
                      <h4 class="haf-card__title">لیست اقساط</h4>
                      <span class="haf-chip">
                        تعداد اقساط: {{ items.length }}
                      </span>
                    </div>

                    <table class="haf-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>دوره</th>
                          <th>پلن</th>
                          <th>شماره قسط</th>
                          <th>مبلغ قسط</th>
                          <th>تاریخ سررسید</th>
                          <th>وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="!items.length">
                          <td colspan="7" class="haf-table__empty">
                            هنوز برای این دانشجو قسطی ثبت نشده است.
                          </td>
                        </tr>
                        <tr v-for="(inst, idx) in items" :key="inst.id || idx">
                          <td>{{ idx + 1 }}</td>
                          <td>{{ inst.course_title || "—" }}</td>
                          <td>{{ inst.plan_title || "—" }}</td>
                          <td class="haf-mono">
                            {{ inst.seq || "—" }}
                          </td>
                          <td class="haf-mono">
                            {{ formatMoneyFa(inst.amount_total) }} تومان
                          </td>
                          <td class="haf-mono">
                            {{ inst.due_date || "—" }}
                          </td>
                          <td>
                            <span class="haf-chip">
                              {{ formatStatus(inst.status) }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
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

    <section v-else class="haf-card haf-mt">دانشجو پیدا نشد.</section>
  </section>
</template>

<script setup>
import "./students.page.css";
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const API_BASE = "http://localhost:5000";

// هدر JWT از کوکی ha_token
function getAuthHeaders() {
  const token = useCookie("ha_token", { path: "/" });
  const headers = {};
  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`;
  }
  return headers;
}

// هندل کردن 401 (مثل courses.page.js)
function handleUnauthorized(res, data, router) {
  if (!res) return;
  if (res.status === 401 || data?.error === "unauthorized") {
    const token = useCookie("ha_token", { path: "/" });
    token.value = null;
    if (process.client && router) {
      router.push("/auth/login");
    }
    throw new Error("unauthorized");
  }
}
definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();
const studentId = computed(() => Number(route.params.id));

// --- استیت اصلی پروفایل دانشجو ---
const loading = ref(false);
const error = ref(null);
const student = ref(null);
const stats = ref(null);
const finance = ref(null);

function formatNumber(value) {
  const n = Number(value || 0);
  if (Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("fa-IR").format(n);
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fa-IR");
}

function getInitials(stu) {
  if (!stu) return "?";
  const full =
    stu.full_name || `${stu.first_name || ""} ${stu.last_name || ""}`.trim();
  if (!full) return "?";
  const parts = full.split(" ");
  if (parts.length === 1) return parts[0][0] || "?";
  return (parts[0][0] || "") + (parts[1][0] || "");
}

function goBack() {
  router.push("/students");
}

function goToEdit() {
  if (!studentId.value) return;
  router.push(`/students/${studentId.value}/edit`);
}

async function fetchStudentProfile() {
  if (!studentId.value) return;
  loading.value = true;
  error.value = null;

  try {
    const res = await fetch(`${API_BASE}/api/students/${studentId.value}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(
        "[student-profile] fetchStudentProfile error",
        res.status,
        data
      );
      // 401 → خروج لاگین و ریدایرکت
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "خطا در دریافت اطلاعات دانشجو");
    }

    // پر کردن stateها
    student.value = data;
    stats.value = data.stats || null;
    finance.value = data.finance || null;
  } catch (err) {
    console.error("[student-profile] fetchStudentProfile exception", err);
    if (err.message !== "unauthorized") {
      error.value = err.message || "خطا در دریافت اطلاعات دانشجو";
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchStudentProfile();
});

// --- تب‌ها ---
const activeTab = ref("info");

const isAdmin = computed(() => {
  const role =
    (student.value?.current_user_role || student.value?.role || "")
      ?.toString()
      ?.toLowerCase() || "";
  return role === "admin" || role === "superadmin";
});

// --- اقساط دانشجو ---
const installmentsLoading = ref(false);
const installmentsError = ref(null);
const installmentItems = ref([]);
const installmentPlans = ref([]);
const installmentSummary = ref({
  sum_total: 0,
  sum_paid: 0,
  sum_remain: 0,
});

const items = computed(() => installmentItems.value || []);

function formatMoneyFa(val) {
  return formatNumber(val || 0);
}

function formatStatus(status) {
  const s = (status || "").toString().toUpperCase();
  if (s === "PAID") return "پرداخت‌شده";
  if (s === "LATE") return "معوق";
  if (s === "CANCELLED") return "لغو شده";
  return "در انتظار پرداخت";
}

async function fetchStudentInstallments() {
  if (!studentId.value) return;
  installmentsLoading.value = true;
  installmentsError.value = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/installments`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[student-profile] installments error", res.status, data);
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "خطا در دریافت اطلاعات اقساط دانشجو");
    }

    installmentItems.value = data.items || data.installments || [];
    installmentPlans.value = data.plans || [];
    installmentSummary.value = data.summary || {
      sum_total: 0,
      sum_paid: 0,
      sum_remain: 0,
    };
  } catch (err) {
    console.error("[student-profile] fetchStudentInstallments exception", err);
    if (err.message !== "unauthorized") {
      installmentsError.value =
        err.message || "خطا در دریافت اطلاعات اقساط دانشجو";
    }
  } finally {
    installmentsLoading.value = false;
  }
}

watch(
  () => activeTab.value,
  (val) => {
    if (val === "installments") {
      fetchStudentInstallments();
    }
  }
);
</script>
