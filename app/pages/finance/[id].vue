<!-- app/pages/finance/index.vue -->
<template>
  <section class="haf-finance-page" dir="rtl">
    <!-- هدر بالا -->
    <header class="haf-page-header">
      <div class="haf-page-header__main">
        <h1 class="haf-page-title">داشبورد مالی</h1>
        <p class="haf-page-subtitle">
          نمای کلی وضعیت مالی، شهریه‌ها، مطالبات و صورت‌حساب دوره‌ها.
        </p>
      </div>
    </header>

    <!-- وضعیت لود / خطا -->
    <section v-if="loading" class="haf-card haf-card--soft haf-mt">
      در حال بارگذاری اطلاعات مالی...
    </section>
    <section v-else-if="error" class="haf-card haf-card--danger haf-mt">
      {{ error }}
    </section>

    <section v-else class="haf-finance-page__body haf-mt">
      <!-- ردیف KPIها (بالای صفحه) -->
      <div class="haf-grid-4 haf-kpi-grid">
        <div class="haf-card haf-kpi-card">
          <div class="haf-kpi-card__label">شهریه اسمی کل</div>
          <div class="haf-kpi-card__value">
            {{ formatNumber(kpis.total_face) }} تومان
          </div>
        </div>
        <div class="haf-card haf-kpi-card">
          <div class="haf-kpi-card__label">مجموع دریافتی</div>
          <div class="haf-kpi-card__value text-emerald-600">
            {{ formatNumber(kpis.total_received) }} تومان
          </div>
        </div>
        <div class="haf-card haf-kpi-card">
          <div class="haf-kpi-card__label">مطالبات باز</div>
          <div class="haf-kpi-card__value text-amber-600">
            {{ formatNumber(kpis.total_receivables) }} تومان
          </div>
        </div>
        <div class="haf-card haf-kpi-card">
          <div class="haf-kpi-card__label">دانشجوهای دارای قسط سررسیدگذشته</div>
          <div class="haf-kpi-card__value text-rose-600">
            {{ formatNumber(kpis.overdue_count) }} نفر
          </div>
        </div>
      </div>

      <!-- تب‌ها: نمای کلی / مطالبات دانشجو / صورتحساب دوره‌ها -->
      <section class="haf-tabs haf-mt-lg">
        <div class="haf-tabs__list tabs">
          <button
            type="button"
            class="haf-tabs__btn tab"
            :class="{
              'haf-tabs__btn--active active': activeTab === 'overview',
            }"
            @click="activeTab = 'overview'"
          >
            نمای کلی
          </button>

          <button
            type="button"
            class="haf-tabs__btn tab"
            :class="{
              'haf-tabs__btn--active active': activeTab === 'receivables',
            }"
            @click="activeTab = 'receivables'"
          >
            مطالبات دانشجو
          </button>

          <button
            type="button"
            class="haf-tabs__btn tab"
            :class="{ 'haf-tabs__btn--active active': activeTab === 'courses' }"
            @click="activeTab = 'courses'"
          >
            صورتحساب دوره‌ها
          </button>
        </div>

        <div class="haf-tabs__panels">
          <!-- تب نمای کلی (آخرین تراکنش‌ها) -->
          <section
            v-show="activeTab === 'overview'"
            class="haf-tabs__panel haf-tab-panel"
          >
            <div class="haf-card haf-card--soft">
              <p class="haf-card__title">آخرین تراکنش‌ها</p>
              <p class="haf-card__subtitle">
                آخرین پرداخت‌ها و دریافتی‌های ثبت‌شده در سیستم.
              </p>

              <div class="table-responsive haf-mt-sm">
                <table class="haf-table data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>تاریخ</th>
                      <th>دانشجو</th>
                      <th>دوره</th>
                      <th>نوع</th>
                      <th>مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!payments.length">
                      <td colspan="6" class="haf-table__empty">
                        هنوز تراکنشی ثبت نشده است.
                      </td>
                    </tr>
                    <tr v-else v-for="(p, idx) in payments" :key="p.id || idx">
                      <td>{{ idx + 1 }}</td>
                      <td class="haf-mono">
                        {{ formatDateTime(p.paid_at || p.created_at) }}
                      </td>
                      <td>{{ p.student_name || "—" }}</td>
                      <td>{{ p.course_title || "—" }}</td>
                      <td>
                        <span
                          class="haf-chip"
                          :class="
                            (p.kind || '').toUpperCase() === 'INCOME'
                              ? 'haf-chip--success'
                              : 'haf-chip--danger'
                          "
                        >
                          {{
                            (p.kind || "").toUpperCase() === "INCOME"
                              ? "دریافتی"
                              : "پرداختی"
                          }}
                        </span>
                      </td>
                      <td class="haf-mono">
                        {{ formatNumber(p.amount || 0) }} تومان
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- تب مطالبات دانشجو -->
          <section
            v-show="activeTab === 'receivables'"
            class="haf-tabs__panel haf-tab-panel"
          >
            <div class="haf-card haf-card--soft">
              <p class="haf-card__title">لیست مطالبات دانشجو</p>
              <p class="haf-card__subtitle">
                دانشجوهایی که هنوز مانده شهریه دارند و وضعیت اقساط‌شان.
              </p>
            </div>

            <div class="haf-card haf-card--soft haf-mt table-responsive">
              <table class="haf-table data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>دانشجو</th>
                    <th>دوره</th>
                    <th>شهریه اسمی</th>
                    <th>دریافتی</th>
                    <th>مانده</th>
                    <th>سررسیدگذشته</th>
                    <th>اولین سررسید بعدی</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!receivables.length">
                    <td colspan="8" class="haf-table__empty">
                      در حال حاضر دانشجویی با مانده‌ی شهریه ثبت نشده است.
                    </td>
                  </tr>
                  <tr
                    v-else
                    v-for="(r, idx) in receivables"
                    :key="r.enrollment_id || idx"
                  >
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <div class="haf-table__primary">
                        <div class="haf-table__title">
                          {{ r.student_name || "—" }}
                        </div>
                        <div
                          class="haf-table__subtitle haf-mono"
                          v-if="r.phone"
                        >
                          {{ r.phone }}
                        </div>
                      </div>
                    </td>
                    <td>{{ r.course_title || "—" }}</td>
                    <td class="haf-mono">
                      {{ formatNumber(r.fee || 0) }} تومان
                    </td>
                    <td class="haf-mono text-emerald-600">
                      {{ formatNumber(r.paid || 0) }} تومان
                    </td>
                    <td class="haf-mono text-amber-600">
                      {{ formatNumber(r.balance || 0) }} تومان
                    </td>
                    <td class="haf-mono">
                      <span
                        v-if="r.overdue_amount && r.overdue_amount > 0"
                        class="text-rose-600"
                      >
                        {{ formatNumber(r.overdue_amount) }} تومان
                        <span v-if="r.max_overdue_days">
                          ({{ r.max_overdue_days }} روز)
                        </span>
                      </span>
                      <span v-else>—</span>
                    </td>
                    <td class="haf-mono">
                      {{ r.next_due_date ? formatDate(r.next_due_date) : "—" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- تب صورتحساب دوره‌ها -->
          <section
            v-show="activeTab === 'courses'"
            class="haf-tabs__panel haf-tab-panel"
          >
            <div class="haf-card haf-card--soft">
              <p class="haf-card__title">صورتحساب دوره‌ها</p>
              <p class="haf-card__subtitle">
                جمع شهریه اسمی، دریافتی و مطالبات باقی‌مانده برای هر دوره.
              </p>
            </div>

            <div class="haf-card haf-card--soft haf-mt table-responsive">
              <table class="haf-table data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>عنوان دوره</th>
                    <th>منتور</th>
                    <th>تعداد دانشجو</th>
                    <th>شهریه اسمی کل</th>
                    <th>مجموع دریافتی</th>
                    <th>مطالبات باقی‌مانده</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!courseInvoices.length">
                    <td colspan="7" class="haf-table__empty">
                      هنوز اطلاعاتی برای دوره‌ها ثبت نشده است.
                    </td>
                  </tr>
                  <tr
                    v-else
                    v-for="(c, idx) in courseInvoices"
                    :key="c.id || idx"
                  >
                    <td>{{ idx + 1 }}</td>
                    <td>{{ c.title || "—" }}</td>
                    <td>{{ c.mentorName || "—" }}</td>
                    <td class="haf-mono">
                      {{ formatNumber(c.studentsCount || 0) }}
                    </td>
                    <td class="haf-mono">
                      {{ formatNumber(c.face || 0) }} تومان
                    </td>
                    <td class="haf-mono text-emerald-600">
                      {{ formatNumber(c.received || 0) }} تومان
                    </td>
                    <td
                      class="haf-mono"
                      :class="
                        (c.remain || 0) > 0
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      "
                    >
                      {{ formatNumber(c.remain || 0) }} تومان
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </section>
  </section>
</template>

<script setup>
import "./finance.page.css";
import { ref, computed, onMounted } from "vue";

const activeTab = ref("overview"); // overview | student_receivables | course_invoices

// -----------------------------
// استیت اصلی داشبورد
// -----------------------------
const loading = ref(false);
const error = ref(null);
const dashboard = ref(null);

// -----------------------------
// تنظیمات API و Auth
// -----------------------------
const API_BASE = "http://localhost:5000";

function getAuthHeaders() {
  const token = useCookie("ha_token", { path: "/" });
  const headers = {};
  if (token?.value) {
    headers["Authorization"] = `Bearer ${token.value}`;
  }
  return headers;
}

// -----------------------------
// Helper ها
// -----------------------------
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

// انتخاب اولین مقدار عددی معتبر از بین چند گزینه
function pickNumber(...candidates) {
  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    const n = Number(c);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

// -----------------------------
// فچ داشبورد مالی
// GET /api/finance/dashboard
// -----------------------------
async function fetchDashboard() {
  loading.value = true;
  error.value = null;

  try {
    const res = await fetch(`${API_BASE}/api/finance/dashboard`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[finance] fetchDashboard error", res.status, data);
      error.value = data?.error || "خطا در دریافت اطلاعات مالی سیستم";
      return;
    }

    console.log("[finance] dashboard payload =", data);
    dashboard.value = data || {};
  } catch (err) {
    console.error("[finance] fetchDashboard exception", err);
    error.value = err?.message || "خطا در ارتباط با سرور مالی";
  } finally {
    loading.value = false;
  }
}

function refreshDashboard() {
  fetchDashboard();
}

// -----------------------------
// KPI ها (نمای کلی)
// dashboard.kpis
// -----------------------------
const overviewKpis = computed(() => {
  const k = (dashboard.value && dashboard.value.kpis) || {};

  const totalFace = pickNumber(
    k.total_face,
    k.totalFace,
    k.face_total,
    k.nominal_total
  );

  const totalReceived = pickNumber(
    k.total_received,
    k.totalReceived,
    k.received_total,
    k.paid_total
  );

  let totalReceivables = pickNumber(
    k.total_receivables,
    k.totalReceivables,
    k.receivable_total,
    k.remaining_total
  );
  if (!totalReceivables) {
    totalReceivables = totalFace - totalReceived;
  }
  if (totalReceivables < 0) totalReceivables = 0;

  const overdueCount = pickNumber(
    k.overdue_count,
    k.overdueCount,
    k.overdue_plans_count,
    k.overdue_students_count
  );

  return {
    totalFace,
    totalReceived,
    totalReceivables,
    overdueCount,
  };
});

// -----------------------------
// تب "مطالبات دانشجو"
// dashboard.receivables (آرایه)
// -----------------------------
const studentReceivablesRows = computed(() => {
  const data = dashboard.value;
  if (!data) return [];

  const raw = Array.isArray(data.receivables)
    ? data.receivables
    : Array.isArray(data.student_receivables)
    ? data.student_receivables
    : [];

  return raw.map((r, idx) => {
    const fee = pickNumber(r.fee, r.nominal, r.face, r.tuition_total);
    const paid = pickNumber(r.paid, r.received, r.paid_total);
    let balance = pickNumber(r.balance, r.receivable, r.remaining);
    if (!balance) balance = fee - paid;
    if (balance < 0) balance = 0;

    return {
      idx: idx + 1,
      enrollmentId: r.enrollment_id ?? r.id,
      studentId: r.student_id ?? null,
      studentName: r.student_name ?? "—",
      phone: r.phone ?? r.mobile ?? r.mobile_phone ?? null,
      courseId: r.course_id ?? null,
      courseTitle: r.course_title ?? r.title ?? "—",
      fee,
      paid,
      balance,
      overdueAmount: pickNumber(r.overdue_amount),
      maxOverdueDays: pickNumber(r.max_overdue_days),
      nextDueDate: r.next_due_date ?? null,
    };
  });
});

// -----------------------------
// تب "صورتحساب دوره‌ها"
// dashboard.courses (آرایه)
// -----------------------------
const courseInvoicesRows = computed(() => {
  const data = dashboard.value;
  if (!data) return [];

  const raw = Array.isArray(data.courses)
    ? data.courses
    : Array.isArray(data.course_invoices)
    ? data.course_invoices
    : [];

  return raw.map((c, idx) => {
    const totals = c.totals || c.kpis || {};

    const nominal = pickNumber(
      c.nominal_total,
      c.face_total,
      c.tuition_total,
      totals.nominal_total,
      totals.face_total,
      totals.total_face
    );

    const received = pickNumber(
      c.received_total,
      c.paid_total,
      totals.received_total,
      totals.paid_total,
      totals.total_received
    );

    let receivable = pickNumber(
      c.receivable_total,
      c.remaining_total,
      totals.receivable_total,
      totals.remaining_total,
      totals.total_receivables
    );
    if (!receivable) receivable = nominal - received;
    if (receivable < 0) receivable = 0;

    let mentorName = c.mentor_name ?? "—";
    if (!mentorName && c.mentor) {
      mentorName =
        c.mentor.full_name ||
        `${c.mentor.first_name || ""} ${c.mentor.last_name || ""}`.trim() ||
        "—";
    }

    return {
      idx: idx + 1,
      courseId: c.course_id ?? c.id,
      title: c.course_title ?? c.title ?? "—",
      mentorName,
      studentsCount: pickNumber(
        c.students_count,
        c.enrollments_count,
        totals.students_count
      ),
      nominal,
      received,
      receivable,
      status: c.status ?? "ACTIVE",
      startDate: c.start_date ?? c.started_at ?? null,
    };
  });
});

// -----------------------------
// لود اولیه
// -----------------------------
onMounted(() => {
  fetchDashboard();
});
</script>
