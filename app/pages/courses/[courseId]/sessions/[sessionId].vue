<template>
  <section class="haf-page" dir="rtl">
    <!-- Header -->
    <header class="haf-header">
      <button class="haf-btn haf-btn--ghost" @click="goBack">
        ← بازگشت
      </button>

      <div class="haf-title-wrap">
        <h1 class="haf-title">جزئیات جلسه</h1>
        <p class="haf-subtitle">شناسه جلسه: {{ session?.id || "—" }}</p>
      </div>
    </header>

    <!-- Loading / Error -->
    <div v-if="loading" class="haf-card haf-card--soft haf-mt">
      در حال بارگذاری جلسه...
    </div>
    <div v-else-if="error" class="haf-card haf-card--danger haf-mt">
      {{ error }}
    </div>

    <template v-else>
      <!-- کارت اطلاعات جلسه -->
      <div class="haf-card haf-grid2">
        <!-- ستون ۱: موضوع و تاریخ -->
        <div>
          <div class="muted">موضوع کلاس</div>
          <div class="strong">
            {{ topic || "برای این جلسه موضوعی ثبت نشده است." }}
          </div>
        </div>

        <div>
          <div class="muted">تاریخ</div>
          <div class="strong">
            {{ formatDateTime(session.session_date || session.date) }}
          </div>
        </div>

        <!-- توضیحات -->
        <div class="haf-col-full">
          <div class="muted">توضیحات کلاس</div>
          <div class="strong">
            {{ description || "برای این جلسه توضیحاتی ثبت نشده است." }}
          </div>
        </div>

        <!-- دکمه‌های عملیاتی -->
        <div class="haf-col-full haf-flex haf-gap-sm">
          <button class="haf-btn haf-btn--primary" @click="goToAttendance">
            حضور و غیاب این جلسه
          </button>

          <button class="haf-btn haf-btn--secondary" @click="goToEditSession">
            ویرایش جلسه
          </button>
        </div>
      </div>

      <!-- گرید: ویرایش + فایل‌ها -->
      <div class="haf-grid2 haf-mt">
        <!-- فرم موضوع و توضیحات -->
        <div class="haf-card">
          <h3 class="haf-card__title">موضوع و توضیحات جلسه</h3>

          <form @submit.prevent="saveSessionMeta" class="haf-upload-form">
            <label class="muted haf-mb-xs">موضوع کلاس</label>
            <input
              v-model="topic"
              class="haf-input"
              placeholder="مثلاً: جلسه معارفه و مرور سرفصل‌ها"
            />

            <label class="muted haf-mt-sm haf-mb-xs">توضیحات کلاس</label>
            <textarea
              v-model="description"
              class="haf-input"
              rows="3"
              placeholder="توضیحات تکمیلی درباره محتوای این جلسه..."
            ></textarea>

            <button
              class="haf-btn haf-btn--primary haf-mt-sm"
              type="submit"
              :disabled="savingMeta"
            >
              {{ savingMeta ? "در حال ذخیره..." : "ذخیره اطلاعات جلسه" }}
            </button>

            <p v-if="metaMessage" class="haf-mt-xs muted">
              {{ metaMessage }}
            </p>
          </form>
        </div>

        <!-- فایل‌ها + آپلود -->
        <div class="haf-card">
          <h3 class="haf-card__title">فایل‌های این جلسه</h3>

          <!-- لیست فایل‌ها -->
          <template v-if="files.length">
            <div
              v-for="f in files"
              :key="f.id"
              class="haf-file-row"
            >
              <div>
                <div class="strong">{{ f.description || "فایل" }}</div>
                <div class="muted">{{ f.file_path }}</div>
              </div>

              <div class="haf-file-actions">
                <a
                  class="haf-btn haf-btn--ghost"
                  :href="fileUrl(f.file_path)"
                  target="_blank"
                >
                  دانلود / نمایش
                </a>

                <button
                  class="haf-btn haf-btn--ghost haf-text-danger"
                  @click="deleteFile(f.id)"
                >
                  حذف
                </button>
              </div>
            </div>
          </template>
          <p v-else class="muted">فایلی بارگذاری نشده است.</p>

          <!-- فرم آپلود -->
          <hr class="haf-divider" />

          <h4 class="haf-card__subtitle">بارگذاری فایل جدید</h4>

          <form @submit.prevent="uploadFile" class="haf-upload-form">
            <!-- file input بدون v-model -->
            <input
              :key="fileInputKey"
              type="file"
              @change="onFileChange"
              required
            />

            <input
              v-model="upload.description"
              class="haf-input"
              placeholder="توضیح فایل (اختیاری)"
            />

            <button
              class="haf-btn haf-btn--primary"
              type="submit"
              :disabled="uploading"
            >
              {{ uploading ? "در حال آپلود..." : "آپلود" }}
            </button>
          </form>

          <p v-if="uploadError" class="haf-text-danger haf-mt-xs">
            {{ uploadError }}
          </p>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCookie } from "#app";

definePageMeta({
  middleware: ["auth"],
});

const API = "http://localhost:5000";
const route = useRoute();
const router = useRouter();

const courseId = route.params.courseId;
const sessionId = route.params.sessionId;

const loading = ref(false);
const error = ref("");

const session = ref({});
const files = ref([]);

// موضوع و توضیحات جلسه
const topic = ref("");
const description = ref("");
const savingMeta = ref(false);
const metaMessage = ref("");

// آپلود فایل
const uploading = ref(false);
const uploadError = ref("");

const upload = ref({
  file: null,
  description: "",
});

// برای ریست file input بعد از آپلود
const fileInputKey = ref(0);

function getAuth() {
  const t = useCookie("ha_token");
  const headers = {};
  if (t.value) headers.Authorization = `Bearer ${t.value}`;
  return headers;
}

async function loadSession() {
  loading.value = true;
  error.value = "";
  metaMessage.value = "";

  try {
    const r = await fetch(`${API}/api/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        ...getAuth(),
      },
      credentials: "include",
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      throw new Error(data?.error || "خطا در دریافت جلسه");
    }

    session.value = data.session || data;
    files.value = data.files || [];

    // مقداردهی اولیه موضوع و توضیحات از داده‌های جلسه
    topic.value = session.value.topic || "";
    description.value = session.value.description || "";
  } catch (e) {
    error.value = e?.message || "خطای غیرمنتظره";
  } finally {
    loading.value = false;
  }
}

function formatDateTime(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("fa-IR");
  } catch {
    return v;
  }
}

function fileUrl(path) {
  return `${API}/uploads/${path}`;
}

// گرفتن فایل با change
function onFileChange(e) {
  const file = e?.target?.files?.[0];
  upload.value.file = file || null;
}

async function deleteFile(id) {
  if (!confirm("فایل حذف شود؟")) return;
  try {
    const r = await fetch(`${API}/api/sessions/file/${id}`, {
      method: "DELETE",
      headers: {
        ...getAuth(),
      },
      credentials: "include",
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "خطا در حذف فایل");

    await loadSession();
  } catch (e) {
    alert(e?.message || "خطا در حذف فایل");
  }
}

async function uploadFile() {
  uploadError.value = "";
  if (!upload.value.file) {
    uploadError.value = "لطفاً یک فایل انتخاب کن.";
    return;
  }

  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append("file", upload.value.file);
    if (upload.value.description) {
      fd.append("description", upload.value.description);
    }

    const r = await fetch(`${API}/api/sessions/${sessionId}/upload`, {
      method: "POST",
      body: fd,
      headers: {
        ...getAuth(), // بدون Content-Type دستی
      },
      credentials: "include",
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "خطا در آپلود فایل");

    // ریست فرم
    upload.value.file = null;
    upload.value.description = "";
    fileInputKey.value++;

    await loadSession();
  } catch (e) {
    uploadError.value = e?.message || "خطا در آپلود فایل";
  } finally {
    uploading.value = false;
  }
}

// ذخیره موضوع و توضیحات جلسه (PATCH /api/sessions/<id>)
async function saveSessionMeta() {
  metaMessage.value = "";
  try {
    savingMeta.value = true;

    const r = await fetch(`${API}/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: {
        ...getAuth(),
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        topic: topic.value,
        description: description.value,
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(data?.error || "خطا در ذخیره اطلاعات جلسه");
    }

    session.value = data.session || data;
    topic.value = session.value.topic || "";
    description.value = session.value.description || "";

    metaMessage.value = "اطلاعات جلسه ذخیره شد.";
  } catch (e) {
    metaMessage.value = e?.message || "خطای غیرمنتظره در ذخیره اطلاعات جلسه";
  } finally {
    savingMeta.value = false;
  }
}

function goBack() {
  router.push(`/courses/${courseId}`);
}

// حضور و غیاب (روی ماژول Attendance فرانت خودت)
function goToAttendance() {
  router.push(`/attendance/${courseId}?session=${sessionId}`);
}

// اگر بعداً صفحه ویرایش جزئیات جلسه ساختی
function goToEditSession() {
  router.push(`/courses/${courseId}/sessions/${sessionId}/edit`);
}

onMounted(loadSession);
</script>
