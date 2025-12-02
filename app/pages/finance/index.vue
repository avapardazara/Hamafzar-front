<template>
  <section class="haf-finance-page" dir="rtl">
    <!-- هدر و KPIها -->
    <header class="haf-finance-header">
      <div>
        <h1 class="haf-finance-title">داشبورد مالی</h1>
        <p class="haf-finance-subtitle">
          نمای کلی شهریه‌ها، مطالبات، تسویه منتورها و هزینه‌ها در هم‌افزار.
        </p>
      </div>

      <div class="haf-finance-header-actions">
        <span class="haf-chip haf-chip--soft">
          💰 شهریه اسمی کل:
          <strong>{{ formatMoney(kpis.total_face || 0) }}</strong>
        </span>
        <span class="haf-chip">
          دریافت‌شده:
          <strong>{{ formatMoney(kpis.total_received || 0) }}</strong>
        </span>
      </div>
    </header>

    <!-- خطا / لودینگ -->
    <section v-if="loading" class="haf-card haf-card--soft haf-mt">
      در حال بارگذاری داده‌های مالی...
    </section>
    <section v-else-if="error" class="haf-card haf-card--danger haf-mt">
      {{ error }}
    </section>

    <section v-else class="haf-finance-body">
      <!-- ردیف KPI اصلی -->
      <section class="haf-kpi-row haf-card haf-card--glass">
        <div class="haf-kpi-item">
          <p class="haf-kpi-label">شهریه اسمی کل</p>
          <p class="haf-kpi-value">
            {{ formatMoney(kpis.total_face || 0) }}
          </p>
        </div>
        <div class="haf-kpi-item">
          <p class="haf-kpi-label">مجموع دریافتی</p>
          <p class="haf-kpi-value">
            {{ formatMoney(kpis.total_received || 0) }}
          </p>
        </div>
        <div class="haf-kpi-item">
          <p class="haf-kpi-label">مطالبات باز</p>
          <p class="haf-kpi-value haf-kpi-value--danger">
            {{ formatMoney(kpis.total_receivables || 0) }}
          </p>
        </div>
        <div class="haf-kpi-item">
          <p class="haf-kpi-label">اقساط سررسیدگذشته</p>
          <p class="haf-kpi-value">
            {{ formatNumber(kpis.overdue_count || 0) }}
          </p>
        </div>
      </section>

      <!-- تب‌ها -->
      <section class="haf-tabs haf-mt-lg">
        <div class="haf-tabs__list">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="haf-tabs__btn"
            :class="{ 'haf-tabs__btn--active': activeTab === tab.key }"
            @click="setActiveTab(tab.key)"
          >
            <span class="haf-tabs__icon" v-if="tab.icon">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>

        <div class="haf-tabs__panels">
          <!-- 🟢 تب نمای کلی -->
          <section v-if="activeTab === 'overview'" class="haf-tabs__panel">
            <h2 class="haf-tabs__panel-title">نمای کلی مالی</h2>
            <p class="haf-tabs__panel-desc">
              خلاصه‌ای از روند درآمد، معوقات، اقساط نزدیک و هزینه‌های ماه جاری.
            </p>

            <div class="haf-grid-2 haf-mt">
              <!-- درآمد ماهانه -->
              <div class="haf-card haf-card--soft">
                <h3 class="haf-card__title">درآمد ماهانه</h3>
                <p class="haf-card__subtitle">Paid tuition per month</p>

                <div v-if="monthlyChart.rows.length" class="haf-chart-rows">
                  <div
                    v-for="row in monthlyChart.rows"
                    :key="row.ym"
                    class="haf-chart-row"
                  >
                    <div class="haf-chart-row__label">
                      {{ row.ym }}
                    </div>
                    <div class="haf-chart-row__bar-wrap">
                      <div
                        class="haf-chart-row__bar"
                        :style="{ '--bar-width': row.percent + '%' }"
                      ></div>
                    </div>
                    <div class="haf-chart-row__value">
                      {{ formatMoney(row.amount) }}
                    </div>
                  </div>
                </div>
                <p v-else class="haf-empty-state">داده‌ای برای نمایش نیست.</p>
              </div>

              <!-- A/R Aging -->
              <div class="haf-card haf-card--soft">
                <h3 class="haf-card__title">A/R Aging (معوقات به تفکیک روز)</h3>
                <div class="haf-table-wrapper">
                  <table class="haf-table">
                    <thead>
                      <tr>
                        <th>0–30</th>
                        <th>31–60</th>
                        <th>61–90</th>
                        <th>90+</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{{ formatMoney(aging["0-30"] || 0) }}</td>
                        <td>{{ formatMoney(aging["31-60"] || 0) }}</td>
                        <td>{{ formatMoney(aging["61-90"] || 0) }}</td>
                        <td>{{ formatMoney(aging["90+"] || 0) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- اقساط ۷ روز آینده + دوره‌های پرفروش + هزینه‌ها -->
            <div class="haf-grid-3 haf-mt">
              <!-- اقساط ۷ روز آینده -->
              <div class="haf-card haf-card--soft">
                <h3 class="haf-card__title">اقساط ۷ روز آینده</h3>
                <div class="haf-table-wrapper">
                  <table class="haf-table">
                    <thead>
                      <tr>
                        <th>دانشجو/شرح</th>
                        <th>تاریخ سررسید</th>
                        <th>مبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, idx) in upcoming7" :key="idx">
                        <td>
                          {{
                            p.student_name ||
                            p.student?.full_name ||
                            p.note ||
                            "—"
                          }}
                        </td>
                        <td>{{ p.due || p.due_date || "—" }}</td>
                        <td>
                          {{ formatMoney(p.amount || p.amount_total || 0) }}
                        </td>
                      </tr>
                      <tr v-if="!upcoming7.length">
                        <td colspan="3" class="haf-empty-state">
                          موردی ندارد.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- دوره‌های پرفروش -->
              <div class="haf-card haf-card--soft">
                <h3 class="haf-card__title">دوره‌های پرفروش ماه جاری</h3>
                <div class="haf-table-wrapper">
                  <table class="haf-table">
                    <thead>
                      <tr>
                        <th>عنوان دوره</th>
                        <th>تعداد تراکنش</th>
                        <th>دریافتی (MTD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(c, idx) in topCoursesMTD" :key="idx">
                        <td>{{ c.title }}</td>
                        <td>{{ formatNumber(c.count || 0) }}</td>
                        <td>{{ formatMoney(c.amount || 0) }}</td>
                      </tr>
                      <tr v-if="!topCoursesMTD.length">
                        <td colspan="3" class="haf-empty-state">
                          موردی ندارد.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- هزینه‌های ماه جاری -->
              <div class="haf-card haf-card--soft">
                <h3 class="haf-card__title">
                  هزینه‌های ماه جاری (به تفکیک دسته)
                </h3>
                <div class="haf-table-wrapper">
                  <table class="haf-table">
                    <thead>
                      <tr>
                        <th>دسته</th>
                        <th>جمع</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(val, cat) in expenseByCat" :key="cat">
                        <td>{{ cat }}</td>
                        <td>{{ formatMoney(val || 0) }}</td>
                      </tr>
                      <tr v-if="!Object.keys(expenseByCat).length">
                        <td colspan="2" class="haf-empty-state">
                          موردی ثبت نشده.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <!-- 🟡 تب مطالبات دانشجو -->
          <section
            v-else-if="activeTab === 'receivables'"
            class="haf-tabs__panel"
          >
            <h2 class="haf-tabs__panel-title">مطالبات دانشجو</h2>
            <p class="haf-tabs__panel-desc">
              لیست بدهی‌های باز دانشجوها بر اساس دوره و نوع برنامه پرداخت.
            </p>

            <div class="haf-table-wrapper haf-mt">
              <table class="haf-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>دانشجو</th>
                    <th>دوره</th>
                    <th>شهریه</th>
                    <th>دریافتی</th>
                    <th>بدهی/مانده</th>
                    <th>اکشن</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(it, idx) in receivables" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>{{ it.student_name }}</td>
                    <td>{{ it.course_title }}</td>
                    <td>{{ formatMoney(it.fee || it.face || 0) }}</td>
                    <td>{{ formatMoney(it.received || it.paid || 0) }}</td>
                    <td
                      :class="
                        (it.balance || it.remain || 0) > 0
                          ? 'haf-text-danger'
                          : 'haf-text-success'
                      "
                    >
                      {{ formatMoney(computeBalance(it)) }}
                    </td>
                    <td>
                      <button
                        v-if="computeBalance(it) > 0"
                        type="button"
                        class="haf-link-btn"
                        @click="goToStudentFinance(it.student_id)"
                      >
                        مشاهده در پروفایل دانشجو
                      </button>
                      <span v-else class="haf-empty-state">—</span>
                    </td>
                  </tr>
                  <tr v-if="!receivables.length">
                    <td colspan="7" class="haf-empty-state">موردی یافت نشد.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 🔵 تب دوره‌ها -->
          <section v-else-if="activeTab === 'courses'" class="haf-tabs__panel">
            <h2 class="haf-tabs__panel-title">صورت‌حساب دوره‌ها</h2>
            <p class="haf-tabs__panel-desc">
              خلاصه مالی هر دوره شامل شهریه، دریافتی، مانده و سهم منتور.
            </p>

            <div class="haf-table-wrapper haf-mt">
              <table class="haf-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>دوره</th>
                    <th>دانشجو</th>
                    <th>اسمی</th>
                    <th>دریافتی</th>
                    <th>بدهی</th>
                    <th>سهم منتور</th>
                    <th>پرداخت به منتور</th>
                    <th>مانده تسویه</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, idx) in coursesSummary" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <button
                        type="button"
                        class="haf-link-btn"
                        @click="goToCourse(r.course_id)"
                      >
                        {{ r.course_title || r.course?.title }}
                      </button>
                    </td>
                    <td>{{ r.students || r.students_count || "—" }}</td>
                    <td>{{ formatMoney(r.face || r.fee || 0) }}</td>
                    <td>{{ formatMoney(r.received || r.paid || 0) }}</td>
                    <td :class="(r.remain || 0) > 0 ? 'haf-text-danger' : ''">
                      {{ formatMoney(r.remain || 0) }}
                    </td>
                    <td>{{ formatMoney(r.mentor_share || 0) }}</td>
                    <td>{{ formatMoney(r.mentor_paid || 0) }}</td>
                    <td
                      :class="
                        (r.mentor_due || 0) > 0
                          ? 'haf-text-danger'
                          : 'haf-text-success'
                      "
                    >
                      {{ formatMoney(r.mentor_due || 0) }}
                    </td>
                  </tr>
                  <tr v-if="!coursesSummary.length">
                    <td colspan="9" class="haf-empty-state">
                      داده‌ای برای نمایش نیست.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 🟣 تب منتورها -->
          <section v-else-if="activeTab === 'mentors'" class="haf-tabs__panel">
            <h2 class="haf-tabs__panel-title">تسویه منتورها</h2>
            <p class="haf-tabs__panel-desc">
              وضعیت مانده تسویه هر منتور بر اساس سهم دوره‌ها و پرداخت‌های
              ثبت‌شده.
            </p>

            <div class="haf-table-wrapper haf-mt">
              <table class="haf-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>منتور</th>
                    <th>تعداد دوره</th>
                    <th>دریافتی دوره‌ها</th>
                    <th>سهم منتور</th>
                    <th>پرداخت‌شده</th>
                    <th>مانده</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, idx) in mentorsSummary" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <button
                        type="button"
                        class="haf-link-btn"
                        @click="goToMentor(r.mentor_id)"
                      >
                        {{ r.mentor_name }}
                      </button>
                    </td>
                    <td>{{ formatNumber(r.courses || 0) }}</td>
                    <td>{{ formatMoney(r.received || 0) }}</td>
                    <td>{{ formatMoney(r.share || 0) }}</td>
                    <td>{{ formatMoney(r.paid || 0) }}</td>
                    <td
                      :class="
                        (r.due || 0) > 0
                          ? 'haf-text-danger'
                          : 'haf-text-success'
                      "
                    >
                      {{ formatMoney(r.due || 0) }}
                    </td>
                  </tr>
                  <tr v-if="!mentorsSummary.length">
                    <td colspan="7" class="haf-empty-state">
                      اطلاعاتی وجود ندارد.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 🟤 تب اقساط -->
          <section
            v-else-if="activeTab === 'installments'"
            class="haf-tabs__panel"
          >
            <h2 class="haf-tabs__panel-title">اقساط</h2>
            <p class="haf-tabs__panel-desc">
              لیست اقساط باز و معوق به تفکیک برنامه و دوره.
            </p>

            <div class="haf-table-wrapper haf-mt">
              <table class="haf-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>عنوان</th>
                    <th>دوره</th>
                    <th>سررسید</th>
                    <th>مبلغ</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, idx) in installments" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>{{ p.title }}</td>
                    <td>{{ p.course_title || p.course?.title || "—" }}</td>
                    <td>{{ p.due || p.due_date || "—" }}</td>
                    <td>{{ formatMoney(p.amount || p.amount_total || 0) }}</td>
                    <td
                      :class="
                        p.overdue ? 'haf-text-danger' : 'haf-text-success'
                      "
                    >
                      {{ p.overdue ? "معوق" : "باز" }}
                    </td>
                  </tr>
                  <tr v-if="!installments.length">
                    <td colspan="6" class="haf-empty-state">
                      قسطی برای نمایش نیست.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 🧱 تب دارایی‌ها -->
          <section v-else-if="activeTab === 'assets'" class="haf-tabs__panel">
            <h2 class="haf-tabs__panel-title">دارایی‌ها</h2>
            <p class="haf-tabs__panel-desc">
              فهرست دارایی‌های ثبت‌شده در سیستم (اگر ماژول Asset فعال باشد).
            </p>

            <div v-if="assetModelPresent">
              <div class="haf-card haf-card--soft haf-assets-header">
                <div>
                  <span class="haf-assets-label">مجموع ارزش فعلی:</span>
                  <span class="haf-assets-value">
                    {{ formatMoney(assetsTotal || 0) }} تومان
                  </span>
                </div>
                <button
                  type="button"
                  class="haf-btn haf-btn--primary haf-btn--sm"
                >
                  افزودن دارایی
                </button>
              </div>

              <div class="haf-table-wrapper haf-mt">
                <table class="haf-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>نام</th>
                      <th>دسته‌بندی</th>
                      <th>تاریخ خرید</th>
                      <th>مبلغ خرید</th>
                      <th>تعداد</th>
                      <th>وضعیت</th>
                      <th>ارزش کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(a, idx) in assets" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td :title="a.notes || ''">{{ a.name }}</td>
                      <td>{{ a.category || "—" }}</td>
                      <td>{{ a.purchase_date || "—" }}</td>
                      <td>{{ formatMoney(a.purchase_price || 0) }}</td>
                      <td>{{ a.quantity || "—" }}</td>
                      <td>{{ a.status || "—" }}</td>
                      <td>{{ formatMoney(assetTotalValue(a)) }}</td>
                    </tr>
                    <tr v-if="!assets.length">
                      <td colspan="8" class="haf-empty-state">
                        دارایی‌ای ثبت نشده.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="haf-card haf-card--soft haf-mt">
              مدل دارایی‌ها (Asset) هنوز در سیستم تعریف نشده است.
            </div>
          </section>

          <!-- 🧾 تب هزینه‌ها -->
          <section v-else-if="activeTab === 'expenses'" class="haf-tabs__panel">
            <h2 class="haf-tabs__panel-title">هزینه‌ها</h2>
            <p class="haf-tabs__panel-desc">
              هزینه‌های ثبت‌شده به تفکیک دسته، روش پرداخت و وضعیت.
            </p>

            <div class="haf-card haf-card--soft haf-expenses-summary">
              <div>
                <strong>هزینه ماه جاری:</strong>
                {{ formatMoney(expenseKpis.mtd || 0) }} تومان &nbsp;|&nbsp;
                <strong>مجموع کل هزینه‌ها:</strong>
                {{ formatMoney(expenseKpis.total || 0) }} تومان
              </div>
              <button
                type="button"
                class="haf-btn haf-btn--primary haf-btn--sm"
              >
                افزودن هزینه
              </button>
            </div>

            <div class="haf-table-wrapper haf-mt">
              <table class="haf-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>عنوان</th>
                    <th>دسته</th>
                    <th>روش پرداخت</th>
                    <th>وضعیت</th>
                    <th>تاریخ</th>
                    <th>مبلغ کل</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ex, idx) in expenses" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>{{ ex.title || "—" }}</td>
                    <td>{{ ex.category || "سایر" }}</td>
                    <td>{{ ex.payment_label || ex.payment_method || "—" }}</td>
                    <td>{{ ex.status || "—" }}</td>
                    <td>
                      {{ ex.date || ex.paid_date || ex.expense_date || "—" }}
                    </td>
                    <td class="haf-text-strong">
                      {{
                        formatMoney(
                          ex.total_amount || ex.amount_total || ex.amount || 0
                        )
                      }}
                    </td>
                  </tr>
                  <tr v-if="!expenses.length">
                    <td colspan="7" class="haf-empty-state">
                      هنوز هزینه‌ای ثبت نشده است.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-if="Object.keys(expenseByCat).length"
              class="haf-card haf-card--soft haf-mt"
            >
              <p class="haf-card__title">
                تفکیک هزینه‌های ماه جاری به تفکیک دسته
              </p>
              <div class="haf-chips-row">
                <span
                  v-for="(val, cat) in expenseByCat"
                  :key="cat"
                  class="haf-chip"
                >
                  {{ cat }}: {{ formatMoney(val || 0) }}
                </span>
              </div>
            </div>
          </section>
        </div>
      </section>
    </section>
  </section>
</template>

<script setup>
import "./finance.page.css";
import { useFinancePage } from "./finance.page.js";

definePageMeta({
  middleware: ["auth"],
});

const {
  loading,
  error,
  activeTab,
  tabs,
  setActiveTab,

  kpis,
  monthlyChart,
  aging,
  upcoming7,
  topCoursesMTD,
  expenseByCat,

  receivables,
  coursesSummary,
  mentorsSummary,
  installments,
  assets,
  assetsTotal,
  assetModelPresent,

  expenses,
  expenseKpis,

  formatNumber,
  formatMoney,
  computeBalance,
  assetTotalValue,
  goToStudentFinance,
  goToMentor,
  goToCourse,
} = useFinancePage();
</script>
