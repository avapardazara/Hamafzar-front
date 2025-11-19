<template>
  <section class="haf-finance-page" dir="rtl">
    <header class="haf-finance-header">
      <div class="haf-finance-header__title-block">
        <button
          type="button"
          class="haf-btn haf-btn--ghost haf-btn--sm"
          @click="goBack"
        >
          ← بازگشت به مالی منتورها
        </button>
        <div>
          <h1 class="haf-finance-header__title">
            ریز مالی منتور
          </h1>
          <p
            v-if="mentor"
            class="haf-finance-header__subtitle"
          >
            {{ mentor.full_name || (mentor.first_name + ' ' + mentor.last_name) }}
            <span class="haf-finance-header__subtitle-id">
              ID: {{ mentor.id }}
            </span>
          </p>
        </div>
      </div>
      <div class="haf-finance-header__actions">
        <button
          v-if="mentor"
          type="button"
          class="haf-btn haf-btn--outline haf-btn--sm"
          @click="goToMentorProfile"
        >
          👤 مشاهده پروفایل منتور
        </button>
      </div>
    </header>

    <section
      v-if="loading"
      class="haf-card haf-alert haf-alert--muted"
    >
      در حال بارگذاری اطلاعات مالی منتور...
    </section>

    <section
      v-else-if="error"
      class="haf-card haf-alert haf-alert--danger"
    >
      {{ error }}
    </section>

    <section
      v-else
      class="haf-finance-layout"
    >
      <!-- ستون اصلی -->
      <div class="haf-finance-main">
        <!-- متریک‌ها -->
        <section class="haf-card haf-finance-metrics">
          <div class="haf-metric-card">
            <p class="haf-metric-card__label">مجموع سهم منتور (INCOME)</p>
            <p class="haf-metric-card__value">
              {{ formatNumber(totals.income || 0) }}
              <span class="haf-metric-card__unit">تومان</span>
            </p>
          </div>
          <div class="haf-metric-card">
            <p class="haf-metric-card__label">پرداخت‌شده به منتور (EXPENSE)</p>
            <p class="haf-metric-card__value">
              {{ formatNumber(totals.expense || 0) }}
              <span class="haf-metric-card__unit">تومان</span>
            </p>
          </div>
          <div class="haf-metric-card">
            <p class="haf-metric-card__label">مانده قابل‌پرداخت</p>
            <p class="haf-metric-card__value haf-metric-card__value--accent">
              {{ formatNumber(totals.balance || 0) }}
              <span class="haf-metric-card__unit">تومان</span>
            </p>
          </div>
        </section>

        <!-- فرم ثبت تراکنش -->
        <section class="haf-card haf-finance-form-card">
          <h2 class="haf-card__title">ثبت تراکنش جدید برای منتور</h2>
          <p class="haf-card__subtitle">
            برای ثبت پرداخت‌ها یا سهم‌های جدید منتور، از این فرم استفاده کن.
          </p>

          <form
            class="haf-form"
            @submit.prevent="submitPayment"
          >
            <div class="haf-form-grid">
              <div class="haf-field">
                <label class="haf-field__label">مبلغ (تومان)</label>
                <input
                  v-model="form.amount"
                  type="number"
                  min="0"
                  class="haf-input"
                  placeholder="مثلاً 2,500,000"
                >
              </div>

              <div class="haf-field">
                <label class="haf-field__label">نوع تراکنش</label>
                <select
                  v-model="form.kind"
                  class="haf-input"
                >
                  <option value="EXPENSE">
                    پرداخت به منتور (هزینه برای سیستم)
                  </option>
                  <option value="INCOME">
                    ثبت سهم منتور (درآمد به نفع او)
                  </option>
                </select>
              </div>

              <div class="haf-field">
                <label class="haf-field__label">تاریخ تراکنش (اختیاری)</label>
                <input
                  v-model="form.paid_at"
                  type="datetime-local"
                  class="haf-input"
                >
                <p class="haf-field__hint">
                  اگر خالی بگذاری، زمان فعلی ثبت می‌شود.
                </p>
              </div>

              <div class="haf-field haf-field--full">
                <label class="haf-field__label">شرح</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="haf-input"
                  placeholder="مثلاً تسویه قسط اول، علی‌الحساب، ..."
                >
              </div>

              <div class="haf-field haf-field--full">
                <label class="haf-field__label">یادداشت داخلی (اختیاری)</label>
                <textarea
                  v-model="form.note"
                  rows="2"
                  class="haf-input haf-input--textarea"
                  placeholder="توضیحاتی که فقط برای استفاده داخلی است..."
                ></textarea>
              </div>
            </div>

            <div class="haf-form-actions">
              <button
                type="submit"
                class="haf-btn haf-btn--primary"
                :disabled="loading"
              >
                💾 ثبت تراکنش
              </button>
            </div>
          </form>
        </section>

        <!-- جدول تراکنش‌ها -->
        <section class="haf-card haf-finance-table-card">
          <div class="haf-finance-table-card__header">
            <div>
              <h2 class="haf-card__title">لیست تراکنش‌های مالی منتور</h2>
              <p class="haf-card__subtitle">
                تراکنش‌ها بر اساس جدیدترین زمان ثبت نمایش داده می‌شوند.
              </p>
            </div>
          </div>

          <div class="haf-finance-table-wrapper">
            <table class="haf-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>تاریخ</th>
                  <th>شرح</th>
                  <th>نوع</th>
                  <th>مبلغ</th>
                  <th>یادداشت</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="payments.length === 0">
                  <td
                    colspan="6"
                    class="haf-table__empty"
                  >
                    هنوز هیچ تراکنشی برای این منتور ثبت نشده است.
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="(p, idx) in payments"
                  :key="p.id"
                >
                  <td>{{ idx + 1 }}</td>
                  <td>
                    <span class="haf-mono">
                      {{ p.paid_at || '—' }}
                    </span>
                  </td>
                  <td>{{ p.title || '—' }}</td>
                  <td>
                    <span
                      class="haf-payment-kind"
                      :class="p.kind === 'INCOME'
                        ? 'haf-payment-kind--income'
                        : 'haf-payment-kind--expense'"
                    >
                      {{ p.kind === 'INCOME' ? 'سهم منتور (درآمد)' : 'پرداخت به منتور' }}
                    </span>
                  </td>
                  <td>
                    {{ formatNumber(p.amount || 0) }}
                    <span class="haf-table__unit">تومان</span>
                  </td>
                  <td>{{ p.note || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- ستون کناری: کارت خلاصه منتور -->
      <aside class="haf-finance-aside" v-if="mentor">
        <section class="haf-card haf-finance-mentor-card">
          <div class="haf-finance-mentor-card__avatar">
            <div class="haf-avatar-lg">
              <span>
                {{ getInitials(mentor.full_name || (mentor.first_name + ' ' + mentor.last_name)) }}
              </span>
            </div>
          </div>
          <div class="haf-finance-mentor-card__body">
            <h3 class="haf-finance-mentor-card__name">
              {{ mentor.full_name || (mentor.first_name + ' ' + mentor.last_name) }}
            </h3>
            <p
              v-if="mentor.email"
              class="haf-finance-mentor-card__email"
            >
              {{ mentor.email }}
            </p>
            <p
              v-if="mentor.phone"
              class="haf-finance-mentor-card__phone"
            >
              {{ mentor.phone }}
            </p>
          </div>
          <div class="haf-finance-mentor-card__footer">
            <div class="haf-summary-list">
              <div class="haf-summary-item">
                <span>مجموع سهم</span>
                <strong>{{ formatNumber(totals.income || 0) }}</strong>
              </div>
              <div class="haf-summary-item">
                <span>پرداخت‌شده</span>
                <strong>{{ formatNumber(totals.expense || 0) }}</strong>
              </div>
              <div class="haf-summary-item">
                <span>مانده</span>
                <strong>{{ formatNumber(totals.balance || 0) }}</strong>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </section>
  </section>
</template>

<script setup>
import '../finance.page.css'
import { useMentorFinanceDetail, formatNumber } from '../finance.page.js'

definePageMeta({
  middleware: ['auth'],
})

const {
  loading,
  error,
  mentor,
  payments,
  totals,
  form,
  submitPayment,
  goBack,
  goToMentorProfile,
} = useMentorFinanceDetail()

function getInitials(name) {
  if (!name) return '؟'
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return (parts[0][0] || '') + (parts[1][0] || '')
}
</script>
