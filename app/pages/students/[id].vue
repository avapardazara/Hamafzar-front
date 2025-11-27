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
          @click="onClickEditStudent"
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
                        @click="addTechSkill"
                      >
                        ➕
                      </button>
                    </div>

                    <ul class="haf-tag-list">
                      <li
                        v-for="(s, idx) in skillsTech"
                        :key="s.id || idx"
                        class="haf-tag-item"
                      >
                        <span>
                          {{ s.name }}
                        </span>
                        <button
                          type="button"
                          class="haf-tag-item__remove"
                          @click="deleteSkill(s.id, 'TECH', idx)"
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
                        @click="addSoftSkill"
                      >
                        ➕
                      </button>
                    </div>
                    <ul class="haf-tag-list">
                      <li
                        v-for="(s, idx) in skillsSoft"
                        :key="s.id || idx"
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
                          @click="deleteSkill(s)"
                        >
                          ✕aa
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
                class="haf-tabs__panel"
                id="tab-finance"
                v-show="activeTab === 'finance'"
              >
                <h3 class="haf-tabs__panel-title">وضعیت مالی دانشجو</h3>
                <p class="haf-tabs__panel-desc">
                  در این تب می‌توانی شهریهٔ هر دوره، پرداخت‌ها و اقساط دانشجو را
                  ببینی و پرداخت‌های نقدی را برایش ثبت کنی.
                </p>

                <!-- خلاصه مالی -->
                <div class="haf-metrics-grid haf-mt">
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">مانده حساب کل</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(financeTotals.total_face) }}تومان
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">اقساط فعال</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(financeTotals.total_paid) }}
                    </p>
                  </div>
                  <div class="haf-metric-card">
                    <p class="haf-metric-card__label">مجموع پرداخت‌شده</p>
                    <p class="haf-metric-card__value">
                      {{ formatNumber(financeTotals.total_remain) }}تومان
                    </p>
                  </div>
                </div>

                <!-- بخش اصلی مالی: فقط برای ادمین -->
                <div
                  class="haf-mt"
                  style="
                    display: grid;
                    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
                    gap: 16px;
                    align-items: flex-start;
                  "
                >
                  <!-- ستون چپ: فرم و جدول دوره‌ها -->
                  <div>
                    <!-- فرم ثبت تراکنش -->
                    <div
                      class="haf-card haf-card--soft"
                      style="margin-bottom: 12px"
                    >
                      <h4 class="haf-card__title" style="margin-bottom: 8px">
                        ثبت پرداخت / دریافت دستی
                      </h4>
                      <p
                        class="haf-tabs__panel-desc"
                        style="margin-bottom: 12px"
                      >
                        عنوان، مبلغ، نوع تراکنش و (در صورت نیاز) دوره مرتبط را
                        مشخص کن و ثبت کن تا در حساب دانشجو لحاظ شود.
                      </p>
                      <div
                        style="
                          display: grid;
                          grid-template-columns:
                            minmax(0, 1.5fr) 130px 120px minmax(0, 1.3fr)
                            110px;
                          gap: 8px;
                          align-items: center;
                        "
                      >
                        <input
                          v-model="paymentTitle"
                          type="text"
                          placeholder="شرح تراکنش (مثلاً شهریه ترم ۱)"
                          class="haf-input"
                        />
                        <input
                          v-model.number="paymentAmount"
                          type="number"
                          min="1"
                          placeholder="مبلغ"
                          class="haf-input"
                        />
                        <select v-model="paymentType" class="haf-input">
                          <option value="IN">دریافت</option>
                          <option value="OUT">پرداخت</option>
                        </select>
                        <select v-model="paymentCourseId" class="haf-input">
                          <option value="">
                            — نسبت‌دادن به دوره (اختیاری) —
                          </option>
                          <option
                            v-for="c in enrolledCourseOptions"
                            :key="c.id"
                            :value="c.id"
                          >
                            {{ c.title }}
                            <span v-if="c.mentor_name">
                              — {{ c.mentor_name }}
                            </span>
                          </option>
                        </select>
                        <button
                          type="button"
                          class="haf-btn haf-btn--primary"
                          :disabled="
                            paymentSaving || !paymentTitle || !paymentAmount
                          "
                          @click="createPayment"
                        >
                          <span v-if="paymentSaving">در حال ثبت...</span>
                          <span v-else>افزودن</span>
                        </button>
                      </div>

                      <p
                        v-if="paymentsError"
                        class="haf-text-danger"
                        style="margin-top: 8px"
                      >
                        {{ paymentsError }}
                      </p>
                    </div>

                    <!-- جدول شهریه به تفکیک دوره -->
                    <div class="haf-card haf-card--soft table-responsive">
                      <h4 class="haf-card__title" style="margin-bottom: 8px">
                        شهریه و مانده به تفکیک دوره
                      </h4>
                      <table class="haf-table data-table">
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
                          <tr
                            v-for="(row, idx) in financeSummary.items"
                            :key="row.course_id || idx"
                          >
                            <td>{{ idx + 1 }}</td>
                            <td>{{ row.course_title || "—" }}</td>
                            <td class="haf-mono">
                              {{ formatNumber(row.fee || 0) }} تومان
                            </td>
                            <td class="haf-mono">
                              {{ formatNumber(row.paid || 0) }} تومان
                            </td>
                            <td class="haf-mono haf-text-danger">
                              {{ formatNumber(row.balance || 0) }} تومان
                            </td>
                          </tr>
                          <tr
                            v-if="
                              !financeSummary.items ||
                              !financeSummary.items.length
                            "
                          >
                            <td colspan="5" class="haf-table__empty">
                              هنوز برای این دانشجو شهریه‌ای ثبت نشده یا در هیچ
                              دوره‌ای ثبت‌نام نشده است.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- ستون راست: لیست تراکنش‌ها -->
                  <div>
                    <div class="haf-card haf-card--soft table-responsive">
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          margin-bottom: 8px;
                        "
                      >
                        <h4 class="haf-card__title">تاریخچه تراکنش‌ها</h4>
                        <button
                          type="button"
                          class="haf-btn haf-btn--ghost haf-btn--sm"
                          @click="fetchStudentPayments(true)"
                        >
                          🔄 بروزرسانی
                        </button>
                      </div>
                      <table class="haf-table data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>شرح</th>
                            <th>نوع</th>
                            <th>مبلغ</th>
                            <th>تاریخ</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(p, idx) in payments" :key="p.id || idx">
                            <td>{{ idx + 1 }}</td>
                            <td>{{ p.title }}</td>
                            <td>
                              <span class="haf-chip">
                                {{ p.type === "IN" ? "دریافت" : "پرداخت" }}
                              </span>
                            </td>
                            <td class="haf-mono">
                              {{ formatNumber(p.amount || 0) }} تومان
                            </td>
                            <td class="haf-mono">
                              {{ p.created_at || "—" }}
                            </td>
                            <td class="haf-table__actions">
                              <button
                                type="button"
                                class="haf-btn haf-btn--ghost haf-btn--sm"
                                @click="deletePayment(p)"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                          <tr v-if="!payments.length && !paymentsLoading">
                            <td colspan="6" class="haf-table__empty">
                              هنوز هیچ تراکنش مالی برای این دانشجو ثبت نشده است.
                            </td>
                          </tr>
                          <tr v-if="paymentsLoading">
                            <td colspan="6" class="haf-table__empty">
                              در حال بارگذاری تراکنش‌ها...
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- اگر ادمین نباشد -->
              </section>

              <!-- Tab: Installments - فقط ادمین -->
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

                  <!-- فرم افزودن قسط جدید -->
                  <div class="haf-card haf-card--soft haf-mt">
                    <div class="haf-card__header-row">
                      <h4 class="haf-card__title">
                        افزودن قسط جدید برای این دانشجو
                      </h4>
                    </div>
                    <div
                      style="
                        display: grid;
                        grid-template-columns: minmax(0, 1.6fr) 140px 160px;
                        gap: 8px;
                        align-items: flex-end;
                        margin-top: 8px;
                      "
                    >
                      <div class="haf-field">
                        <label class="haf-field__label">عنوان قسط</label>
                        <input
                          v-model="installmentTitle"
                          type="text"
                          class="haf-input"
                          placeholder="مثلاً قسط ۱ دوره X"
                        />
                      </div>
                      <div class="haf-field">
                        <label class="haf-field__label">مبلغ قسط (تومان)</label>
                        <input
                          v-model.number="installmentAmount"
                          type="number"
                          min="0"
                          class="haf-input"
                          placeholder="مثلاً ۳۱۵۰۰۰۰"
                        />
                      </div>
                      <div class="haf-field">
                        <label class="haf-field__label">تاریخ سررسید</label>
                        <input
                          v-model="installmentDueDate"
                          type="date"
                          class="haf-input"
                        />
                      </div>
                    </div>
                    <div
                      style="
                        display: grid;
                        grid-template-columns: minmax(0, 1.5fr) 140px;
                        gap: 8px;
                        align-items: flex-end;
                        margin-top: 8px;
                      "
                    >
                      <div class="haf-field">
                        <label class="haf-field__label"
                          >دوره مرتبط (اختیاری)</label
                        >
                        <select v-model="paymentCourseId" class="haf-input">
                          <option value="">— بدون ارتباط با دوره مشخص —</option>
                          <option
                            v-for="c in paymentCourseOptions"
                            :key="c.id"
                            :value="c.id"
                          >
                            {{ c.title || c.course_title || "دوره #" + c.id }}
                          </option>
                        </select>
                      </div>
                      <div class="haf-field" style="text-align: end">
                        <button
                          type="button"
                          class="haf-btn haf-btn--primary"
                          :disabled="!installmentTitle || !installmentAmount"
                          @click="createInstallment"
                        >
                          ثبت قسط
                        </button>
                      </div>
                    </div>
                    <p
                      v-if="installmentFormError"
                      class="haf-text-danger"
                      style="margin-top: 8px"
                    >
                      {{ installmentFormError }}
                    </p>
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
                      <h4 class="haf-card__title">فهرست اقساط</h4>
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
                          <th>وضعیت / عملیات</th>
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
                            {{ formatDate(inst.due_date) }}
                          </td>
                          <td>
                            <div
                              style="
                                display: flex;
                                flex-direction: column;
                                gap: 4px;
                              "
                            >
                              <!-- وضعیت -->
                              <span class="haf-chip">
                                {{ formatInstallmentStatus(inst.status) }}
                              </span>

                              <!-- اکشن‌ها -->
                              <div
                                style="display: flex; gap: 4px; flex-wrap: wrap"
                              >
                                <!-- دکمه پرداخت -->
                                <button
                                  type="button"
                                  class="haf-btn haf-btn--xs haf-btn--primary"
                                  :disabled="
                                    (inst.status || '').toUpperCase() ===
                                      'PAID' ||
                                    installmentActionLoadingId === inst.id
                                  "
                                  @click="markInstallmentPaid(inst)"
                                >
                                  ثبت پرداخت
                                </button>

                                <!-- دکمه بازگشت/لغو پرداخت -->
                                <button
                                  type="button"
                                  class="haf-btn haf-btn--xs haf-btn--ghost"
                                  :disabled="
                                    (inst.status || '').toUpperCase() ===
                                      'PENDING' ||
                                    installmentActionLoadingId === inst.id
                                  "
                                  @click="revertInstallmentToPending(inst)"
                                >
                                  بازگردانی به در انتظار
                                </button>
                              </div>
                            </div>
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
                <strong>{{ formatNumber(summaryStats.coursesCount) }}</strong>
              </li>
              <li>
                <span>مهارت‌های ثبت‌شده</span>
                <strong>{{ formatNumber(summaryStats.skillsCount) }}</strong>
              </li>
              <li>
                <span>مانده حساب</span>
                <strong>{{ formatNumber(summaryStats.balance) }} تومان</strong>
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
import { useCookie } from "#app";

definePageMeta({
  middleware: ["auth"],
});

const API_BASE = "http://localhost:5000";

// ===================== helpers: auth / headers =====================
function getAuthHeaders() {
  const token = useCookie("ha_token", { path: "/" });
  const headers = {};
  if (token.value) {
    headers["Authorization"] = `Bearer ${token.value}`;
  }
  return headers;
}

function handleUnauthorized(res, data, router) {
  if (res.status === 401 || res.status === 403) {
    console.warn(
      "[student-profile] unauthorized, redirecting...",
      res.status,
      data
    );
    if (router) {
      router.push("/auth/login");
    }
    throw new Error("unauthorized");
  }
}

// ===================== helpers: formatters =====================
function formatNumber(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("fa-IR").format(n);
}

function formatMoneyFa(val) {
  return formatNumber(val || 0);
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

function getInitials(stu) {
  if (!stu) return "?";
  const full =
    stu.full_name || `${stu.first_name || ""} ${stu.last_name || ""}`.trim();
  if (!full) return "?";
  const parts = full.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0] || "?";
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`;
}

function formatInstallmentStatus(status) {
  const s = (status || "").toString().toUpperCase();
  if (s === "PAID") return "پرداخت‌شده";
  if (s === "LATE" || s === "OVERDUE") return "معوق";
  if (s === "CANCELLED") return "لغو شده";
  if (s === "PENDING") return "در انتظار پرداخت";
  return "نامشخص";
}

// ===================== route / base state =====================
const route = useRoute();
const router = useRouter();
const studentId = computed(() => Number(route.params.id));

const loading = ref(false);
const error = ref(null);
const student = ref(null);

// اگر API پروفایل فیلد stats برگردونه، اینجا نگه می‌داریم (برای هر جای دیگری که استفاده می‌کنی)
const stats = ref(null);

const activeTab = ref("info");

const isAdmin = computed(() => {
  const role =
    (student.value?.current_user_role || student.value?.role || "")
      ?.toString()
      ?.toLowerCase() || "";
  return role === "admin" || role === "superadmin";
});

// ===================== fetch student profile =====================
async function fetchStudentProfile() {
  if (!studentId.value) return;

  loading.value = true;
  error.value = null;

  try {
    console.log("[student-profile] fetchStudentProfile start");

    const res = await fetch(`${API_BASE}/api/students/${studentId.value}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
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
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "خطا در دریافت اطلاعات دانشجو");
    }

    student.value = data.student || data;
    stats.value = data.stats || null;

    console.log("[student-profile] fetchStudentProfile ok", student.value);
  } catch (err) {
    console.error("[student-profile] fetchStudentProfile exception", err);
    if (err && err.message !== "unauthorized") {
      error.value = err.message || "خطا در دریافت اطلاعات دانشجو";
    }
  } finally {
    loading.value = false;
  }
}

// ===================== Courses Tab =====================
const coursesLoading = ref(false);
const coursesError = ref(null);
const courses = ref([]);

async function fetchStudentCourses(force = false) {
  if (!studentId.value) return;
  if (!force && courses.value.length) return;

  coursesLoading.value = true;
  coursesError.value = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/courses`,
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
        "[student-profile] fetchStudentCourses error",
        res.status,
        data
      );
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "خطا در دریافت دوره‌های دانشجو");
    }

    courses.value = data.items || data.courses || [];
  } catch (err) {
    console.error("[student-profile] fetchStudentCourses exception", err);
    if (err && err.message !== "unauthorized") {
      coursesError.value = err.message || "خطا در دریافت دوره‌ها";
    }
  } finally {
    coursesLoading.value = false;
  }
}

// ===================== Skills Tab =====================
const skillsLoading = ref(false);
const skillsError = ref(null);
const skillsTech = ref([]);
const skillsSoft = ref([]);

const techSkillInput = ref("");
const softSkillTitle = ref("");
const softSkillDate = ref("");
const softSkillHours = ref("");

async function fetchStudentSkills(force = false) {
  if (!studentId.value) return;
  if (!force && (skillsTech.value.length || skillsSoft.value.length)) return;

  skillsLoading.value = true;
  skillsError.value = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/skills`,
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
      console.error("[student-profile] fetchStudentSkills error", data);
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "خطا در دریافت مهارت‌های دانشجو");
    }

    const items = data.items || data.skills || [];
    skillsTech.value = items.filter(
      (s) => (s.type || s.kind || "").toUpperCase() === "TECH"
    );
    skillsSoft.value = items.filter(
      (s) => (s.type || s.kind || "").toUpperCase() === "SOFT"
    );
  } catch (err) {
    console.error("[student-profile] fetchStudentSkills exception", err);
    if (err && err.message !== "unauthorized") {
      skillsError.value = err.message || "خطا در دریافت لیست مهارت‌ها";
    }
  } finally {
    skillsLoading.value = false;
  }
}

async function addTechSkill() {
  const title = (techSkillInput.value || "").trim();
  if (!title || !studentId.value) return;

  const payload = {
    type: "TECH",
    name: title,
  };

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/skills`,
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
    if (!res.ok || data?.ok === false) {
      console.error("[student-profile] addTechSkill error", data);
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "ثبت مهارت فنی ناموفق بود");
    }

    const item = data.item || data.skill || null;

    if (item && (item.id || item.skill_id)) {
      skillsTech.value.unshift(item);
    } else {
      await fetchStudentSkills(true);
    }

    techSkillInput.value = "";
  } catch (err) {
    console.error("[student-profile] addTechSkill exception", err);
  }
}

async function addSoftSkill() {
  const title = (softSkillTitle.value || "").trim();
  if (!title || !studentId.value) return;

  const payload = {
    type: "SOFT",
    name: title,
    date_label: (softSkillDate.value || "").trim() || null,
    hours: softSkillHours.value ? Number(softSkillHours.value) : null,
  };

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/skills`,
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
    if (!res.ok || data?.ok === false) {
      console.error("[student-profile] addSoftSkill error", data);
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "ثبت مهارت نرم ناموفق بود");
    }

    const item = data.item || data.skill || null;

    if (item && (item.id || item.skill_id)) {
      skillsSoft.value.unshift(item);
    } else {
      await fetchStudentSkills(true);
    }

    softSkillTitle.value = "";
    softSkillDate.value = "";
    softSkillHours.value = "";
  } catch (err) {
    console.error("[student-profile] addSoftSkill exception", err);
  }
}

async function deleteSkill(skillOrId, type, index) {
  if (!studentId.value) return;

  let skillId = skillOrId;
  if (typeof skillOrId === "object" && skillOrId !== null) {
    skillId = skillOrId.id || skillOrId.skill_id || null;
  }

  if (!skillId) {
    console.warn("[student-profile] deleteSkill: skillId not found", skillOrId);
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/skills/${encodeURIComponent(
        skillId
      )}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.ok === false) {
      console.error("[student-profile] deleteSkill error", res.status, data);
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "حذف مهارت ناموفق بود");
    }

    // optimistic update
    if (type === "TECH") {
      skillsTech.value.splice(index, 1);
    } else if (type === "SOFT") {
      skillsSoft.value.splice(index, 1);
    }

    // و در نهایت sync قطعی با سرور
    await fetchStudentSkills(true);
  } catch (err) {
    console.error("[student-profile] deleteSkill exception", err);
  }
}

// ===================== Installments (اقساط) =====================
const installmentsLoading = ref(false);
const isLoadingInstallments = installmentsLoading; // برای تطبیق با ارورهای قبلی
const installmentsError = ref(null);
const installmentFormError = ref(null);
const installmentItems = ref([]);
const installmentPlans = ref([]);
const installmentSummary = ref({
  sum_total: 0,
  sum_paid: 0,
  sum_remain: 0,
});
const installmentActionLoadingId = ref(null);

// فرم ساخت قسط
const installmentTitle = ref("");
const installmentAmount = ref(null);
const installmentDueDate = ref("");
const selectedCourseId = ref("");

const items = computed(() => installmentItems.value || []);

async function fetchStudentInstallments(force = false) {
  if (!studentId.value) return;
  if (!force && installmentItems.value.length) return;

  installmentsLoading.value = true;
  installmentsError.value = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/installments`,
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
        "[student-profile] fetchStudentInstallments error",
        res.status,
        data
      );
      handleUnauthorized(res, data, router);
      throw new Error("خطا در دریافت اطلاعات اقساط دانشجو");
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

async function createInstallment() {
  if (!studentId.value) return;
  if (!installmentTitle.value || !installmentAmount.value) return;

  installmentFormError.value = null;

  const payload = {
    title: installmentTitle.value,
    amount_total: Number(installmentAmount.value),
    due_date: installmentDueDate.value || null,
    course_id: selectedCourseId.value || null,
  };

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/installments`,
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
    if (!res.ok || data?.ok === false) {
      console.error(
        "[student-profile] createInstallment error",
        res.status,
        data
      );
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "ثبت قسط ناموفق بود");
    }

    installmentTitle.value = "";
    installmentAmount.value = null;
    installmentDueDate.value = "";
    selectedCourseId.value = "";

    await fetchStudentInstallments(true);
    await fetchStudentFinanceSummary(true);
  } catch (err) {
    console.error("[student-profile] createInstallment exception", err);
    if (err && err.message !== "unauthorized") {
      installmentFormError.value = err.message || "ثبت قسط ناموفق بود";
    }
  }
}

async function updateInstallmentStatus(inst, newStatus) {
  if (!inst || !inst.id) return;
  installmentFormError.value = null;
  installmentActionLoadingId.value = inst.id;

  const payload = { status: newStatus };

  try {
    const res = await fetch(`${API_BASE}/api/installments/${inst.id}/status`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) {
      console.error(
        "[student-profile] updateInstallmentStatus error",
        res.status,
        data
      );
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "بروزرسانی وضعیت قسط ناموفق بود");
    }

    await fetchStudentInstallments(true);
    await fetchStudentFinanceSummary(true);
  } catch (err) {
    console.error("[student-profile] updateInstallmentStatus exception", err);
    if (err && err.message !== "unauthorized") {
      installmentFormError.value =
        err.message || "بروزرسانی وضعیت قسط ناموفق بود";
    }
  } finally {
    installmentActionLoadingId.value = null;
  }
}

function markInstallmentPaid(inst) {
  updateInstallmentStatus(inst, "PAID");
}

function revertInstallmentToPending(inst) {
  updateInstallmentStatus(inst, "PENDING");
}

// ===================== Finance Tab =====================
const financeSummary = ref({
  items: [],
  totals: {
    total_face: 0,
    total_discount: 0,
    total_received: 0,
    total_receivables: 0,
  },
});
const financeLoading = ref(false);
const financeError = ref(null);

const payments = ref([]);
const paymentsLoading = ref(false);
const paymentsError = ref(null);

const paymentTitle = ref("");
const paymentAmount = ref(null);
const paymentType = ref("INCOME"); // INCOME / REFUND
const paymentCourseId = ref("");
const paymentSaving = ref(false);

const enrolledCourseOptions = ref([]);
const enrolledCoursesLoading = ref(false);

// دوره‌هایی که اقساط دارند → برای فیلتر لیست دوره‌ها در فرم پرداخت
const installmentCourseIds = computed(() => {
  const set = new Set();
  (installmentItems.value || []).forEach((inst) => {
    if (inst.course_id) set.add(Number(inst.course_id));
  });
  (installmentPlans.value || []).forEach((plan) => {
    if (plan.course_id) set.add(Number(plan.course_id));
  });
  return set;
});

// لیست دوره‌های مجاز برای پرداخت (بدون اقساط)
const paymentCourseOptions = computed(() => {
  const all = enrolledCourseOptions.value || [];
  const blocked = installmentCourseIds.value;
  return all.filter((c) => !blocked.has(Number(c.id || c.value)));
});

// خلاصه مالی برای کارت‌های تب مالی
const financeTotals = computed(() => {
  // از خلاصه اقساط
  const inst = installmentSummary.value || {};
  const sumTotal = Number(inst.sum_total || 0);
  const sumPaidFromInstallments = Number(inst.sum_paid || 0);

  // از لیست تراکنش‌ها
  const paymentsList = payments.value || [];
  const sumPaidFromPayments = paymentsList.reduce((acc, p) => {
    if (!p) return acc;
    const amt = Number(p.amount || 0);
    if (Number.isNaN(amt)) return acc;

    // اگر نوع تراکنش داری (INCOME / REFUND)، اینجا می‌تونی منفی/مثبت کنی
    const kind = (p.type || p.kind || "INCOME").toString().toUpperCase();
    if (kind === "REFUND") {
      return acc - amt;
    }
    return acc + amt;
  }, 0);

  // فعلاً فرض می‌کنیم تمام شهریه‌ی دانشجو در اقساط آمده
  const total_face = sumTotal;

  // هر کدوم از دو منبع پرداخت بیشتر بود، مبنا می‌گیریم (برای هم‌خوانی)
  const total_paid = Math.max(sumPaidFromInstallments, sumPaidFromPayments);

  const total_remain = Math.max(total_face - total_paid, 0);

  return {
    total_face,
    total_paid,
    total_remain,
  };
});

async function fetchStudentFinanceSummary(force = false) {
  if (!studentId.value) return;
  if (!force && financeSummary.value && financeSummary.value.items?.length) {
    return;
  }

  financeLoading.value = true;
  financeError.value = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/finance/summary`,
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
        "[student-profile] fetchStudentFinanceSummary error",
        res.status,
        data
      );
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "خطا در دریافت خلاصه مالی دانشجو");
    }

    financeSummary.value = {
      items: data.items || [],
      totals: data.totals ||
        data || {
          total_face: 0,
          total_discount: 0,
          total_received: 0,
          total_receivables: 0,
        },
    };
  } catch (err) {
    console.error(
      "[student-profile] fetchStudentFinanceSummary exception",
      err
    );
    if (err && err.message !== "unauthorized") {
      financeError.value = err.message || "خطا در دریافت خلاصه مالی دانشجو";
    }
  } finally {
    financeLoading.value = false;
  }
}

async function fetchEnrolledCourseOptions(force = false) {
  if (!studentId.value) return;
  if (!force && enrolledCourseOptions.value.length) return;

  enrolledCoursesLoading.value = true;
  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/courses`,
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
        "[student-profile] fetchEnrolledCourseOptions error",
        res.status,
        data
      );
      handleUnauthorized(res, data, router);
      throw new Error(
        data?.error || "خطا در دریافت لیست دوره‌های ثبت‌نام‌شدهٔ دانشجو"
      );
    }

    const items = data.items || data.courses || [];
    const map = {};
    for (const row of items) {
      const cid = row.course_id;
      if (!cid) continue;
      if (!map[cid]) {
        map[cid] = {
          id: cid,
          title: row.course_title || `دوره #${cid}`,
          mentor_name: row.mentor_name || null,
        };
      }
    }

    enrolledCourseOptions.value = Object.values(map);
  } catch (err) {
    console.error(
      "[student-profile] fetchEnrolledCourseOptions exception",
      err
    );
  } finally {
    enrolledCoursesLoading.value = false;
  }
}

async function fetchStudentPayments(force = false) {
  if (!studentId.value) return;
  if (!force && payments.value.length) return;

  paymentsLoading.value = true;
  paymentsError.value = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/payments`,
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
      console.error("[student-profile] fetchStudentPayments error", data);
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "خطا در دریافت تراکنش‌های دانشجو");
    }

    payments.value = data.items || data.payments || [];
  } catch (err) {
    console.error("[student-profile] fetchStudentPayments exception", err);
    if (err && err.message !== "unauthorized") {
      paymentsError.value = err.message || "خطا در دریافت لیست تراکنش‌ها";
    }
  } finally {
    paymentsLoading.value = false;
  }
}

async function createPayment() {
  if (!studentId.value || !paymentTitle.value || !paymentAmount.value) return;

  paymentsError.value = null;
  paymentSaving.value = true;

  const payload = {
    title: paymentTitle.value,
    amount: Number(paymentAmount.value),
    type: paymentType.value,
    course_id: paymentCourseId.value || null,
  };

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/payments`,
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
    if (!res.ok || data?.ok === false) {
      console.error("[student-profile] createPayment error", res.status, data);
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "ثبت تراکنش ناموفق بود");
    }

    payments.value.unshift(data.payment || payload);

    paymentTitle.value = "";
    paymentAmount.value = null;
    paymentCourseId.value = "";
    paymentType.value = "INCOME";

    await fetchStudentFinanceSummary(true);
    await fetchStudentInstallments(true);
  } catch (err) {
    console.error("[student-profile] createPayment exception", err);
    if (err && err.message !== "unauthorized") {
      paymentsError.value = err.message || "ثبت تراکنش ناموفق بود";
    }
  } finally {
    paymentSaving.value = false;
  }
}

async function deletePayment(paymentId, index) {
  if (!studentId.value || !paymentId) return;
  paymentsError.value = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/students/${studentId.value}/payments/${paymentId}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) {
      console.error("[student-profile] deletePayment error", res.status, data);
      handleUnauthorized(res, data, router);
      throw new Error(data?.error || "حذف تراکنش ناموفق بود");
    }

    payments.value.splice(index, 1);

    await fetchStudentFinanceSummary(true);
    await fetchStudentInstallments(true);
  } catch (err) {
    console.error("[student-profile] deletePayment exception", err);
    if (err && err.message !== "unauthorized") {
      paymentsError.value = err.message || "حذف تراکنش ناموفق بود";
    }
  }
}

// ===================== summary aside (خلاصه وضعیت کنار صفحه) =====================
const summaryStats = computed(() => {
  // تعداد دوره‌ها
  const coursesCount = Array.isArray(courses.value)
    ? courses.value.length
    : courses.value?.items?.length || 0;

  // تعداد مهارت‌ها
  const skillsCount =
    (skillsTech.value?.length || 0) + (skillsSoft.value?.length || 0);

  // مانده حساب از خلاصه مالی
  const balance = financeTotals.value?.total_remain || 0;

  return {
    coursesCount,
    skillsCount,
    balance,
  };
});

// ===================== tab watcher & lifecycle =====================
watch(
  () => activeTab.value,
  (val) => {
    if (val === "courses") {
      fetchStudentCourses();
    } else if (val === "skills") {
      fetchStudentSkills();
    } else if (val === "finance") {
      fetchEnrolledCourseOptions(true);
      fetchStudentFinanceSummary(true);
      fetchStudentPayments(true);
      fetchStudentInstallments(true);
    } else if (val === "installments") {
      fetchStudentInstallments(true);
      fetchEnrolledCourseOptions();
    }
  }
);

onMounted(() => {
  fetchStudentProfile();
  // اگر می‌خوای از اول خلاصه وضعیت درست باشه:
  fetchStudentCourses();
  fetchStudentSkills();
  fetchStudentFinanceSummary(true);
  fetchStudentInstallments(true);
});
// ===================== Edit student (دکمه ویرایش پروفایل) =====================
function _navigateToEditStudent() {
  const id = student.value?.id || studentId.value;
  if (!id) {
    console.warn("[student-profile] edit: no student id");
    return;
  }

  // می‌فرستیمت به صفحه ساخت با query id برای ویرایش
  router.push({
    path: "/students/create",
    query: { id: String(id) },
  });
}

// چند تا alias برای سازگاری با template
const goToEditStudent = _navigateToEditStudent;
const onClickEditStudent = _navigateToEditStudent;
const editStudent = _navigateToEditStudent;
</script>
