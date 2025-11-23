<template>
  <div class="haf-page" dir="rtl">
    <!-- Header -->
    <div class="haf-card haf-flex haf-between haf-align-center haf-mb-sm">
      <div>
        <div class="haf-title">جزئیات جلسه</div>
        <div class="haf-muted haf-mt-xs">
          {{ course?.title || "—" }}
        </div>
      </div>

      <div class="haf-flex haf-gap-sm">
        <NuxtLink class="haf-btn haf-btn--ghost" :to="`/courses/${courseId}`">پروفایل دوره</NuxtLink>
        <NuxtLink class="haf-btn haf-btn--ghost" :to="`/courses/${courseId}/sessions`">لیست جلسات</NuxtLink>
        <NuxtLink class="haf-btn haf-btn--primary" :to="`/attendance/${courseId}?session=${sessionId}`">
          حضورغیاب
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="haf-card haf-empty-state">در حال بارگذاری…</div>
    <div v-else-if="error" class="haf-card haf-empty-state haf-text-danger">{{ error }}</div>

    <div v-else class="haf-grid2 haf-gap-sm">
      <!-- Session info -->
      <div class="haf-card">
        <div class="haf-course-section-title">اطلاعات جلسه</div>

        <div class="haf-kv haf-mt-sm">
          <div class="haf-kv__row">
            <div class="haf-muted">تاریخ جلسه</div>
            <div class="haf-strong">{{ formatDate(session.session_date || session.date) }}</div>
          </div>
          <div class="haf-kv__row">
            <div class="haf-muted">زمان</div>
            <div class="haf-strong">
              {{ formatTime(session.start_time) }} تا {{ formatTime(session.end_time) }}
            </div>
          </div>
          <div class="haf-kv__row">
            <div class="haf-muted">عنوان</div>
            <div class="haf-strong">{{ session.topic || "جلسه آموزشی" }}</div>
          </div>
        </div>

        <div class="haf-mt-sm">
          <div class="haf-muted">توضیحات</div>
          <div class="haf-box haf-mt-xs">
            {{ session.description || "—" }}
          </div>
        </div>
      </div>

      <!-- Files -->
      <div class="haf-card haf-files-box">
        <div class="haf-course-section-title">فایل‌های جلسه</div>

        <!-- upload -->
        <div class="haf-mt-sm">
          <div class="haf-grid2 haf-gap-sm">
            <div class="haf-col-span-2">
              <input type="file" @change="onPickFile" class="haf-input" />
            </div>
            <div class="haf-col-span-2">
              <input v-model.trim="newFileDesc" class="haf-input" placeholder="توضیح فایل (اختیاری)" />
            </div>
          </div>

          <div class="haf-flex haf-end haf-mt-xs">
            <button
              class="haf-btn haf-btn--primary"
              :disabled="!newFile || uploading"
              @click="uploadFile"
            >
              {{ uploading ? "در حال آپلود…" : "آپلود فایل" }}
            </button>
          </div>
        </div>

        <!-- list -->
        <div class="haf-mt-sm">
          <div v-if="filesLoading" class="haf-empty-state">در حال دریافت فایل‌ها…</div>
          <div v-else-if="files.length===0" class="haf-empty-state">فایلی ثبت نشده.</div>

          <ul v-else class="haf-file-list">
            <li v-for="f in files" :key="f.id" class="haf-file-item">
              <div>
                <div class="haf-strong">
                  {{ f.description || fileName(f.file_path) }}
                </div>
                <div class="haf-muted haf-small">
                  {{ f.uploaded_at ? formatDateTime(f.uploaded_at) : "" }}
                </div>
              </div>

              <div class="haf-flex haf-gap-xs">
                <a
                  class="haf-btn haf-btn--soft"
                  :href="fileUrl(f)"
                  target="_blank"
                >
                  دانلود / نمایش
                </a>
                <button class="haf-btn haf-btn--danger" @click="removeFile(f)">حذف</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const API_BASE = "http://localhost:5000";
const route = useRoute();

const courseId = computed(() => route.params.courseId);
const sessionId = computed(() => route.params.sessionId);

const loading = ref(false);
const error = ref("");

const course = ref(null);
const session = ref({});

const files = ref([]);
const filesLoading = ref(false);
const uploading = ref(false);

const newFile = ref(null);
const newFileDesc = ref("");

function getAuthHeaders() {
  const token = useCookie("ha_token", { path: "/" });
  const h = {};
  if (token.value) h.Authorization = `Bearer ${token.value}`;
  return h;
}

function formatDate(val) {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("fa-IR"); }
  catch { return val; }
}
function formatTime(val) {
  if (!val) return "—";
  return String(val).slice(0,5);
}
function formatDateTime(val) {
  try { return new Date(val).toLocaleString("fa-IR"); }
  catch { return val; }
}

async function fetchCourse() {
  const res = await fetch(`${API_BASE}/api/courses/${courseId.value}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  const data = await res.json().catch(()=> ({}));
  course.value = data.course || data || null;
}

async function fetchSession() {
  // فرض رایج: GET /api/sessions/:id
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId.value}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(data?.error || "خطا در دریافت جلسه");
  session.value = data.session || data || {};
}

async function fetchFiles() {
  filesLoading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/sessions/${sessionId.value}/files`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok) throw new Error(data?.error || "خطا در دریافت فایل‌ها");
    files.value = data.items || data.files || [];
  } finally {
    filesLoading.value = false;
  }
}

function onPickFile(e) {
  newFile.value = e.target.files?.[0] || null;
}

async function uploadFile() {
  if (!newFile.value) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append("file", newFile.value);
    if (newFileDesc.value) fd.append("description", newFileDesc.value);

    const res = await fetch(`${API_BASE}/api/sessions/${sessionId.value}/files`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: fd,
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.ok === false) throw new Error(data?.error || "خطا در آپلود فایل");

    newFile.value = null;
    newFileDesc.value = "";
    await fetchFiles();
  } catch (e) {
    alert(e?.message || "خطا در آپلود فایل");
  } finally {
    uploading.value = false;
  }
}

async function removeFile(f) {
  if (!confirm("این فایل حذف شود؟")) return;
  try {
    const res = await fetch(`${API_BASE}/api/session-files/${f.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.ok === false) throw new Error(data?.error || "خطا در حذف فایل");
    await fetchFiles();
  } catch (e) {
    alert(e?.message || "خطا در حذف فایل");
  }
}

function fileName(path) {
  if (!path) return "file";
  return path.split("/").pop();
}
function fileUrl(f) {
  return f.url || (f.file_path ? `${API_BASE}/uploads/${f.file_path}` : "#");
}

async function reload() {
  loading.value = true;
  error.value = "";
  try {
    await Promise.all([fetchCourse(), fetchSession()]);
    await fetchFiles();
  } catch (e) {
    error.value = e?.message || "خطا در بارگذاری";
  } finally {
    loading.value = false;
  }
}

onMounted(reload);
</script>

<style scoped>
.haf-files-box { background:#F6FAF9; border:1px dashed #e6efec; }
.haf-file-list { list-style:none; padding:0; margin:0; display:grid; gap:8px; }
.haf-file-item {
  background:#fff; border:1px solid #e6efec; border-radius:10px;
  padding:8px 10px; display:flex; justify-content:space-between; align-items:center;
}
.haf-kv__row{ display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #e5e7eb; }
.haf-box{ background:#fff; border:1px solid #e6efec; padding:8px 10px; border-radius:10px; min-height:48px; }
</style>
