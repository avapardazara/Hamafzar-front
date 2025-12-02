<!-- app/pages/mentors/[id].vue -->
<template>
  <section class="haf-student-profile" dir="rtl">
    <!-- هدر بالا -->
    <header class="haf-student-profile__header">
      <div class="haf-student-profile__title-wrap">
        <button
          type="button"
          class="haf-btn haf-btn--ghost haf-btn--sm"
          @click="goBack"
        >
          ← بازگشت به لیست منتورها
        </button>
        <div>
          <h1 class="haf-student-profile__title">پروفایل منتور</h1>
          <p class="haf-student-profile__subtitle" v-if="mentor">
            {{ mentor.full_name || mentor.first_name + " " + mentor.last_name }}
            <span class="haf-student-profile__id">ID: {{ mentor.id }}</span>
          </p>
        </div>
      </div>

      <div class="haf-student-profile__header-actions" v-if="mentor">
        <button
          type="button"
          class="haf-btn haf-btn--outline"
          @click="goToEdit"
        >
          ✏️ ویرایش اطلاعات
        </button>
      </div>
    </header>

    <!-- وضعیت لود / خطا -->
    <section v-if="loading" class="haf-card haf-card--soft haf-mt">
      در حال بارگذاری پروفایل منتور...
    </section>
    <section v-else-if="error" class="haf-card haf-card--danger haf-mt">
      {{ error }}
    </section>

    <section v-else-if="mentor" class="haf-student-profile__body haf-mt">
      <div class="haf-student-profile__grid">
        <!-- ستون اصلی -->
        <div class="haf-student-profile__main">
          <!-- کارت هویت -->
          <section class="haf-card haf-student-identity">
            <div class="haf-student-identity__header">
              <div class="haf-avatar-lg">
                <img
                  v-if="mentor.avatar_url"
                  :src="mentor.avatar_url"
                  alt="avatar"
                />
                <span v-else>
                  {{ getInitials(mentor) }}
                </span>
              </div>
              <div>
                <h2 class="haf-student-identity__name">
                  {{
                    mentor.full_name ||
                    mentor.first_name + " " + mentor.last_name
                  }}
                </h2>
                <p class="haf-student-identity__meta">
                  ایمیل:
                  <span class="haf-mono">{{ mentor.email || "—" }}</span>
                  · موبایل:
                  <span class="haf-mono">{{ mentor.phone || "—" }}</span>
                </p>
              </div>
            </div>

            <dl class="haf-student-identity__details">
              <div class="haf-detail-row">
                <dt>کد ملی</dt>
                <dd class="haf-mono">{{ mentor.national_code || "—" }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>آدرس</dt>
                <dd>{{ mentor.address || "ثبت نشده" }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>بیو</dt>
                <dd>{{ mentor.bio || "—" }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>یادداشت داخلی</dt>
                <dd>{{ mentor.note || mentor.notes || "—" }}</dd>
              </div>
              <div class="haf-detail-row">
                <dt>تاریخ ایجاد</dt>
                <dd>{{ formatDate(mentor.created_at) }}</dd>
              </div>
            </dl>
          </section>

          <!-- تب‌ها: اطلاعات / دوره‌ها / مالی -->
          <section class="haf-tabs haf-mt-lg">
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
                اطلاعات
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
                  'haf-tabs__btn--active active': activeTab === 'finance',
                }"
                data-tab="finance"
                @click="activeTab = 'finance'"
              >
                مالی
              </button>
            </div>

            <div class="haf-tabs__panels">
              <!-- تب اطلاعات -->
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
                        mentor.full_name ||
                        mentor.first_name + " " + mentor.last_name
                      }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">کد ملی</div>
                    <div class="haf-detail-row-value haf-mono">
                      {{ mentor.national_code || "—" }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">شماره تماس</div>
                    <div class="haf-detail-row-value haf-mono">
                      {{ mentor.phone || "—" }}
                    </div>
                  </div>

                  <div class="haf-info-item">
                    <div class="haf-field__label">ایمیل</div>
                    <div class="haf-detail-row-value">
                      {{ mentor.email || "—" }}
                    </div>
                  </div>

                  <div class="haf-info-item haf-info-item--full">
                    <div class="haf-field__label">آدرس</div>
                    <div class="haf-detail-row-value">
                      {{ mentor.address || "—" }}
                    </div>
                  </div>

                  <div class="haf-info-item haf-info-item--full">
                    <div class="haf-field__label">بیو</div>
                    <div class="haf-detail-row-value">
                      {{ mentor.bio || "—" }}
                    </div>
                  </div>
                </div>
              </section>

              <!-- تب دوره‌ها -->
              <section
                id="tab-courses"
                v-show="activeTab === 'courses'"
                class="haf-tab-panel"
              >
                <div class="haf-card haf-card--soft">
                  <p class="haf-card__title">دوره‌های منتور</p>
                  <p class="haf-card__subtitle">
                    لیست دوره‌هایی که این منتور در آن‌ها به عنوان مدرس ثبت شده
                    است.
                  </p>
                </div>

                <div class="haf-card haf-card--soft haf-mt table-responsive">
                  <table class="haf-table data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>عنوان دوره</th>
                        <th>وضعیت</th>
                        <th>تاریخ شروع</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="loading">
                        <td colspan="4">در حال بارگذاری دوره‌ها...</td>
                      </tr>
                      <tr v-else-if="error">
                        <td colspan="4" class="haf-text-danger">
                          {{ error }}
                        </td>
                      </tr>
                      <tr v-else-if="!courses || !courses.length">
                        <td colspan="4" class="haf-table__empty">
                          هنوز دوره‌ای برای این منتور ثبت نشده است.
                        </td>
                      </tr>
                      <tr
                        v-else
                        v-for="(c, idx) in courses"
                        :key="c.id || c.course_id || idx"
                      >
                        <td>{{ idx + 1 }}</td>
                        <td>{{ c.course_title || c.title || "—" }}</td>
                        <td>
                          <span class="haf-chip">
                            {{ c.status || "ACTIVE" }}
                          </span>
                        </td>
                        <td class="haf-mono">
                          {{ formatDate(c.start_date || c.started_at) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- تب مالی -->
              <section
                id="tab-finance"
                v-show="activeTab === 'finance'"
                class="haf-tab-panel"
              >
                <!-- خلاصه مالی -->
                <div class="haf-card haf-card--soft">
                  <p class="haf-card__title">خلاصه مالی منتور</p>
                  <p class="haf-card__subtitle">
                    وضعیت تسویه‌حساب با این منتور.
                  </p>

                  <div v-if="loading">در حال بارگذاری خلاصه مالی منتور...</div>

                  <div v-else-if="!mentorFinanceSummary">
                    خلاصه مالی در دسترس نیست.
                  </div>

                  <ul v-else class="haf-summary-list haf-mt">
                    <li>
                      <span>سهم کل منتور (بر اساس ثبت‌نام‌ها)</span>
                      <strong>
                        {{ formatNumber(mentorFinanceSummary.share) }} تومان
                      </strong>
                    </li>
                    <li>
                      <span>مبلغ پرداخت‌شده به منتور</span>
                      <strong class="text-emerald-600">
                        {{ formatNumber(mentorFinanceSummary.paid) }} تومان
                      </strong>
                    </li>
                    <li>
                      <span>باقیمانده قابل پرداخت</span>
                      <strong
                        :class="
                          mentorFinanceSummary.due > 0
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        "
                      >
                        {{ formatNumber(mentorFinanceSummary.due) }} تومان
                      </strong>
                    </li>
                  </ul>
                </div>

                <!-- فرم ثبت پرداخت -->
                <div class="haf-card haf-card--glass haf-mt">
                  <p class="haf-card__title">ثبت پرداختی برای منتور</p>
                  <form
                    class="haf-form haf-grid haf-grid--2col haf-mt-sm"
                    @submit.prevent="createMentorPayment"
                  >
                    <div class="haf-form__group">
                      <label class="haf-form__label">عنوان پرداخت</label>
                      <input
                        v-model="mentorPaymentTitle"
                        type="text"
                        class="haf-input"
                        placeholder="مثلاً «تسویه قسط اول»"
                      />
                    </div>

                    <div class="haf-form__group">
                      <label class="haf-form__label">مبلغ (تومان)</label>
                      <input
                        v-model.number="mentorPaymentAmount"
                        type="number"
                        min="0"
                        class="haf-input"
                        placeholder="مبلغ به تومان"
                      />
                    </div>

                    <div class="haf-form__group">
                      <label class="haf-form__label">نوع تراکنش</label>
                      <select v-model="mentorPaymentKind" class="haf-input">
                        <option value="EXPENSE">پرداخت به منتور (هزینه)</option>
                        <option value="INCOME">دریافتی از منتور (درآمد)</option>
                      </select>
                    </div>
                    <div class="haf-form__group">
                      <label class="haf-form__label">مربوط به دوره</label>
                      <select v-model="mentorPaymentCourseId" class="haf-input">
                        <option :value="null">بدون اتصال به دوره</option>
                        <option
                          v-for="c in mentorCoursesForSelect"
                          :key="c.id"
                          :value="c.id"
                        >
                          {{ c.title }}
                        </option>
                      </select>
                    </div>
                    <div class="haf-form__group haf-form__group--full">
                      <label class="haf-form__label">توضیحات</label>
                      <textarea
                        v-model="mentorPaymentNote"
                        class="haf-input"
                        rows="2"
                        placeholder="توضیح اختیاری"
                      ></textarea>
                    </div>

                    <div class="haf-form__actions haf-form__group--full">
                      <button
                        type="submit"
                        class="haf-btn haf-btn--primary"
                        :disabled="mentorPaymentSaving"
                      >
                        {{
                          mentorPaymentSaving ? "در حال ثبت..." : "ثبت پرداخت"
                        }}
                      </button>
                      <span
                        v-if="mentorPaymentsError"
                        class="haf-text-danger haf-ml-sm"
                      >
                        {{ mentorPaymentsError }}
                      </span>
                    </div>
                  </form>
                </div>

                <!-- لیست تراکنش‌ها -->
                <div class="haf-card haf-card--soft haf-mt table-responsive">
                  <p class="haf-card__title">تاریخچه تراکنش‌ها</p>

                  <table class="haf-table data-table haf-mt-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>تاریخ</th>
                        <th>عنوان</th>
                        <th>نوع</th>
                        <th>مبلغ</th>
                        <th>توضیحات</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="mentorPaymentsLoading">
                        <td colspan="6">در حال بارگذاری تراکنش‌ها...</td>
                      </tr>

                      <tr v-else-if="mentorPaymentsError">
                        <td colspan="6" class="haf-text-danger">
                          {{ mentorPaymentsError }}
                        </td>
                      </tr>

                      <tr v-else-if="!mentorPayments || !mentorPayments.length">
                        <td colspan="6" class="haf-table__empty">
                          هنوز تراکنشی برای این منتور ثبت نشده است.
                        </td>
                      </tr>

                      <tr
                        v-else
                        v-for="(p, idx) in mentorPayments"
                        :key="p.id || idx"
                      >
                        <td>{{ idx + 1 }}</td>
                        <td class="haf-mono">
                          {{ formatDateTime(p.paid_at || p.created_at) }}
                        </td>
                        <td>{{ p.title || "—" }}</td>
                        <td>
                          <span
                            class="haf-chip"
                            :class="
                              (p.kind || '').toUpperCase() === 'EXPENSE'
                                ? 'haf-chip--danger'
                                : 'haf-chip--success'
                            "
                          >
                            {{
                              (p.kind || "").toUpperCase() === "EXPENSE"
                                ? "پرداخت به منتور"
                                : "دریافتی از منتور"
                            }}
                          </span>
                        </td>
                        <td class="haf-mono">
                          {{ formatNumber(p.amount || 0) }} تومان
                        </td>
                        <td>{{ p.note || "—" }}</td>
                        <td>
                          <button
                            type="button"
                            class="haf-btn haf-btn--ghost haf-btn--xs text-rose-600"
                            :disabled="deletingPaymentId === (p.id || idx)"
                            @click="deleteMentorPayment(p.id || idx)"
                          >
                            {{
                              deletingPaymentId === (p.id || idx)
                                ? "در حال حذف..."
                                : "حذف"
                            }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
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
                <span>دوره‌های منتور</span>
                <strong>{{ formatNumber(courses.length) }}</strong>
              </li>
              <li>
                <span>درآمد کل</span>
                <strong>
                  {{
                    formatNumber(
                      finance?.income_total ||
                        finance?.totals?.income_total ||
                        0
                    )
                  }}
                  تومان
                </strong>
              </li>
              <li>
                <span>سهم پرداخت‌شده</span>
                <strong>
                  {{
                    formatNumber(
                      finance?.paid_total || finance?.totals?.paid_total || 0
                    )
                  }}
                  تومان
                </strong>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </section>

    <section v-else class="haf-card haf-mt">منتور پیدا نشد.</section>
  </section>
</template>

<script setup>
import "../students/students.page.css";
import "./mentors.page.css";

import { ref, computed, watch, onMounted } from "vue";

// ✅ Nuxt 3 auto-imports
const route = useRoute();
const router = useRouter();

const mentorId = computed(() => Number(route.params.id));
const activeTab = ref("info");

definePageMeta({
  middleware: ["auth"],
});

// ----------------------------
// استیت‌های اصلی پروفایل
// ----------------------------
const loading = ref(false);
const error = ref(null);

const mentor = ref(null);
const stats = ref(null);
const finance = ref(null);
const courses = ref([]);

// ----------------------------
// تنظیمات API و Auth
// ----------------------------
const API_BASE = "http://localhost:5000";

function getAuthHeaders() {
  const token = useCookie("ha_token", { path: "/" });
  const headers = {};
  if (token?.value) {
    headers["Authorization"] = `Bearer ${token.value}`;
  }
  return headers;
}

function handleUnauthorized(res, data) {
  if (res.status === 401 || res.status === 403) {
    console.warn(
      "[mentor-profile] unauthorized, redirecting...",
      res.status,
      data
    );
    router.push("/auth/login");
    throw new Error("unauthorized");
  }
}

// ----------------------------
// Helperها
// ----------------------------
function formatNumber(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("fa-IR");
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fa-IR");
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return (
    d.toLocaleDateString("fa-IR") +
    " " +
    d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
  );
}

function getInitials(m) {
  if (!m) return "?";
  const full =
    m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ") || "";
  if (!full) return "?";
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

function goBack() {
  router.push("/mentors");
}

function goToEdit() {
  if (!mentorId.value) return;
  router.push(`/mentors/${mentorId.value}/edit`);
}

// ----------------------------
// فچ پروفایل منتور از بک‌اند
// GET http://localhost:5000/api/mentors/:id
// ----------------------------
async function fetchProfile() {
  if (!mentorId.value) return;

  loading.value = true;
  error.value = null;

  try {
    const res = await fetch(`${API_BASE}/api/mentors/${mentorId.value}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[mentor-profile] fetchProfile error", res.status, data);
      handleUnauthorized(res, data);
      throw new Error(data?.error || "خطا در دریافت اطلاعات منتور");
    }

    // ساختار بک‌اند:
    // { mentor: {...}, stats: {...}, finance: {...}, courses: [...] }
    mentor.value = data.mentor || data;
    stats.value = data.stats || null;
    finance.value = data.finance || null;
    courses.value = data.courses || [];
  } catch (err) {
    console.error("[mentor-profile] fetchProfile exception", err);
    if (err.message !== "unauthorized") {
      error.value = err.message || "خطا در دریافت اطلاعات منتور";
    }
  } finally {
    loading.value = false;
  }
}

// ----------------------------
// خلاصه مالی منتور از API سراسری
// GET /api/finance/mentors/summary
// ----------------------------
const mentorFinanceRow = ref(null);
const mentorFinanceLoading = ref(false);
const mentorFinanceError = ref(null);

async function fetchMentorFinanceSummary(force = false) {
  if (!mentorId.value) return;
  if (!force && mentorFinanceRow.value) return;

  mentorFinanceLoading.value = true;
  mentorFinanceError.value = null;

  try {
    const res = await fetch(`${API_BASE}/api/finance/mentors/summary`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(
        "[mentor-profile] fetchMentorFinanceSummary error",
        res.status,
        data
      );
      handleUnauthorized(res, data);
      throw new Error(data?.error || "خطا در دریافت خلاصه مالی منتورها");
    }

    const items = data.items || [];
    const row = items.find((x) => Number(x.mentor_id) === mentorId.value);

    mentorFinanceRow.value = row || null;

    // اگر خواستی سایدبار هم از همین استفاده کند:
    if (row) {
      const old = finance.value || {};
      finance.value = {
        ...old,
        totals: {
          ...(old.totals || {}),
          income_total: Number(row.received || 0),
          share_total: Number(row.share || row.received || 0),
          paid_total: Number(row.paid || 0),
          balance: Number(row.due || 0),
        },
      };
    }
  } catch (err) {
    console.error("[mentor-profile] fetchMentorFinanceSummary exception", err);
    if (err.message !== "unauthorized") {
      mentorFinanceError.value =
        err.message || "خطا در دریافت خلاصه مالی منتورها";
    }
  } finally {
    mentorFinanceLoading.value = false;
  }
}

// ----------------------------
// computed خلاصه مالی برای UI
// ----------------------------
const mentorFinanceSummary = computed(() => {
  const row = mentorFinanceRow.value;
  if (row) {
    const share = Number(row.share ?? row.received ?? 0);
    const paid = Number(row.paid ?? 0);
    let due = Number(row.due ?? NaN);
    if (Number.isNaN(due)) due = share - paid;
    return {
      share: share || 0,
      paid: paid || 0,
      due: due || 0,
    };
  }

  // اگر به هر دلیل row نبود، از finance.totals بخوان
  if (!finance.value) return null;
  const f = finance.value || {};
  const totals = f.totals || {};
  const share = Number(
    totals.share_total ??
      totals.mentor_share ??
      totals.mentor_share_total ??
      totals.income_total ??
      0
  );
  const paid = Number(totals.paid_total ?? totals.paid ?? totals.expense ?? 0);
  let due = Number(totals.balance ?? totals.due_total ?? totals.due ?? NaN);
  if (Number.isNaN(due)) due = share - paid;
  return {
    share: share || 0,
    paid: paid || 0,
    due: due || 0,
  };
});

// ----------------------------
// لیست دوره‌ها برای سلکت پرداخت
// ----------------------------
const mentorCoursesForSelect = computed(() =>
  (courses.value || [])
    .map((c) => {
      const id = c.id || c.course_id;
      if (!id) return null;
      const title = c.course_title || c.title || `دوره #${id}`;
      return { id, title };
    })
    .filter(Boolean)
);

// ----------------------------
// تراکنش‌های مالی منتور
// GET /api/finance/mentors/:id/payments
// POST /api/finance/mentors/:id/payments
// ----------------------------
const mentorPayments = ref([]);
const mentorPaymentsLoading = ref(false);
const mentorPaymentsError = ref(null);

const mentorPaymentTitle = ref("");
const mentorPaymentAmount = ref(null);
const mentorPaymentNote = ref("");
const mentorPaymentKind = ref("EXPENSE"); // پرداخت به منتور
const mentorPaymentSaving = ref(false);
const mentorPaymentCourseId = ref(null); // اتصال به دوره
const deletingPaymentId = ref(null);

async function fetchMentorPayments(force = false) {
  if (!mentorId.value) return;
  if (!force && mentorPayments.value.length) return;

  mentorPaymentsLoading.value = true;
  mentorPaymentsError.value = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/finance/mentors/${mentorId.value}/payments`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(
        "[mentor-profile] fetchMentorPayments error",
        res.status,
        data
      );
      handleUnauthorized(res, data);
      throw new Error(data?.error || "خطا در دریافت تراکنش‌های منتور");
    }

    mentorPayments.value = data.items || data.payments || [];
  } catch (err) {
    console.error("[mentor-profile] fetchMentorPayments exception", err);
    if (err.message !== "unauthorized") {
      mentorPaymentsError.value = err.message || "خطا در دریافت لیست تراکنش‌ها";
    }
  } finally {
    mentorPaymentsLoading.value = false;
  }
}

async function createMentorPayment() {
  if (!mentorId.value) return;

  const amount = Number(mentorPaymentAmount.value || 0);
  const title = (mentorPaymentTitle.value || "").trim();

  if (!amount || amount <= 0 || !title) {
    mentorPaymentsError.value = "عنوان و مبلغ را درست وارد کن.";
    return;
  }

  mentorPaymentsError.value = null;
  mentorPaymentSaving.value = true;

  const payload = {
    amount,
    kind: mentorPaymentKind.value || "EXPENSE",
    title,
    note: (mentorPaymentNote.value || "").trim() || null,
  };

  if (mentorPaymentCourseId.value) {
    payload.course_id = mentorPaymentCourseId.value;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/finance/mentors/${mentorId.value}/payments`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false || data?.error) {
      console.error(
        "[mentor-profile] createMentorPayment error",
        res.status,
        data
      );
      handleUnauthorized(res, data);
      throw new Error(data?.error || "ثبت تراکنش برای منتور ناموفق بود");
    }

    await fetchMentorPayments(true);
    await fetchMentorFinanceSummary(true); // خلاصه مالی آپدیت شود

    // ریست فرم
    mentorPaymentTitle.value = "";
    mentorPaymentAmount.value = null;
    mentorPaymentNote.value = "";
    mentorPaymentKind.value = "EXPENSE";
    mentorPaymentCourseId.value = null;
  } catch (err) {
    console.error("[mentor-profile] createMentorPayment exception", err);
    if (err.message !== "unauthorized") {
      mentorPaymentsError.value =
        err.message || "ثبت تراکنش برای منتور ناموفق بود";
    }
  } finally {
    mentorPaymentSaving.value = false;
  }
}

// ----------------------------
// واکنش به تغییر تب
// ----------------------------
watch(
  () => activeTab.value,
  (val) => {
    if (val === "finance") {
      fetchMentorFinanceSummary(true);
      fetchMentorPayments(true);
    }
  }
);

// ----------------------------
// لود اولیه
// ----------------------------
onMounted(async () => {
  await fetchProfile();
  await fetchMentorFinanceSummary(true);
});
async function deleteMentorPayment(id) {
  if (!mentorId.value || !id) return;

  if (!window.confirm("آیا از حذف این تراکنش مطمئن هستید؟")) {
    return;
  }

  mentorPaymentsError.value = null;
  deletingPaymentId.value = id;

  try {
    const res = await fetch(
      `${API_BASE}/api/finance/mentors/${mentorId.value}/payments/${id}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.ok === false || data?.error) {
      console.error(
        "[mentor-profile] deleteMentorPayment error",
        res.status,
        data
      );
      handleUnauthorized(res, data);
      throw new Error(data?.error || "حذف تراکنش ناموفق بود");
    }

    // بعد از حذف، هم لیست تراکنش‌ها و هم خلاصه مالی را آپدیت کن
    await fetchMentorPayments(true);
    await fetchMentorFinanceSummary(true);
  } catch (err) {
    console.error("[mentor-profile] deleteMentorPayment exception", err);
    if (err.message !== "unauthorized") {
      mentorPaymentsError.value =
        err.message || "حذف تراکنش برای منتور ناموفق بود";
    }
  } finally {
    deletingPaymentId.value = null;
  }
}
</script>
