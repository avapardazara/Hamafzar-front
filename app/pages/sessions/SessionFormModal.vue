<template>
  <Teleport to="body">
    <div v-if="open" class="haf-modal-backdrop" @click.self="close">
      <div class="haf-modal" dir="rtl">
        <div class="haf-modal-header">
          <div class="haf-title">
            {{ readonly ? "نمایش جلسه" : (isEdit ? "ویرایش جلسه" : "جلسه جدید") }}
          </div>
          <button class="haf-btn haf-btn--ghost" @click="close">✕</button>
        </div>

        <form @submit.prevent="submit">
          <div class="haf-grid2 haf-gap-sm">
            <div>
              <label class="haf-label">تاریخ جلسه *</label>
              <input v-model="form.session_date" type="date" class="haf-input" required :disabled="readonly" />
            </div>

            <div>
              <label class="haf-label">عنوان جلسه</label>
              <input v-model.trim="form.topic" class="haf-input" placeholder="جلسه آموزشی" :disabled="readonly" />
            </div>

            <div>
              <label class="haf-label">ساعت شروع</label>
              <input v-model="form.start_time" type="time" class="haf-input" :disabled="readonly" />
            </div>

            <div>
              <label class="haf-label">ساعت پایان</label>
              <input v-model="form.end_time" type="time" class="haf-input" :disabled="readonly" />
            </div>

            <div class="haf-col-span-2">
              <label class="haf-label">توضیحات جلسه</label>
              <textarea v-model.trim="form.description" class="haf-input" rows="3" :disabled="readonly" />
            </div>
          </div>

          <!-- ✅ فایل‌های جلسه -->
          <div v-if="isEdit" class="haf-card haf-mt-sm haf-files-box">
            <div class="haf-course-section-title">فایل‌های جلسه</div>

            <!-- upload (not readonly) -->
            <div v-if="!readonly" class="haf-grid2 haf-gap-sm haf-mt-xs">
              <div class="haf-col-span-2">
                <input type="file" @change="onPickFile" class="haf-input" />
              </div>
              <div class="haf-col-span-2">
                <input v-model.trim="newFileDesc" placeholder="توضیح فایل (اختیاری)" class="haf-input" />
              </div>
              <div class="haf-col-span-2 haf-flex haf-end">
                <button
                  type="button"
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
              <div v-else-if="files.length===0" class="haf-empty-state">فایلی برای این جلسه ثبت نشده.</div>

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

                    <button
                      v-if="!readonly"
                      type="button"
                      class="haf-btn haf-btn--danger"
                      @click="removeFile(f)"
                    >
                      حذف
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="haf-flex haf-end haf-gap-sm haf-mt-sm">
            <button
              v-if="!readonly"
              class="haf-btn haf-btn--primary"
              type="submit"
              :disabled="saving"
            >
              {{ saving ? "در حال ذخیره…" : "ذخیره" }}
            </button>

            <button class="haf-btn haf-btn--ghost" type="button" @click="close">
              {{ readonly ? "بستن" : "انصراف" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, watch, ref } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  courseId: { type: [String, Number], required: true },
  editingSession: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});
const emit = defineEmits(["update:open", "saved"]);

const API_BASE = "http://localhost:5000";

const saving = ref(false);
const uploading = ref(false);
const filesLoading = ref(false);

const isEdit = computed(() => !!props.editingSession?.id);

const form = reactive({
  session_date: "",
  topic: "",
  start_time: "",
  end_time: "",
  description: "",
});

// -------- files state --------
const files = ref([]);
const newFile = ref(null);
const newFileDesc = ref("");

function getAuthHeaders() {
  const token = useCookie("ha_token", { path: "/" });
  const h = {};
  if (token.value) h.Authorization = `Bearer ${token.value}`;
  return h;
}

function hydrate(s) {
  form.session_date = s?.session_date || (s?.date ? String(s.date).slice(0,10) : "");
  form.topic = s?.topic || "";
  form.start_time = s?.start_time ? String(s.start_time).slice(0,5) : "";
  form.end_time = s?.end_time ? String(s.end_time).slice(0,5) : "";
  form.description = s?.description || "";
}

watch(() => props.editingSession, (s) => {
  hydrate(s);
  if (s?.id) fetchFiles();
}, { immediate: true });

watch(() => props.open, (v) => {
  if (v && props.editingSession?.id) fetchFiles();
});

function close() {
  emit("update:open", false);
}

async function submit() {
  if (props.readonly) return;

  saving.value = true;
  try {
    const payload = { ...form };

    let url, method;
    if (isEdit.value) {
      url = `${API_BASE}/api/sessions/${props.editingSession.id}`;
      method = "PUT";
    } else {
      url = `${API_BASE}/api/courses/${props.courseId}/sessions`;
      method = "POST";
    }

    const res = await fetch(url, {
      method,
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(()=> ({}));

    if (!res.ok || data.ok === false) {
      throw new Error(data?.error || "خطا در ذخیره جلسه");
    }

    emit("saved");
    close();
  } catch (e) {
    alert(e?.message || "خطا در ذخیره جلسه");
  } finally {
    saving.value = false;
  }
}

// -------- files API --------
async function fetchFiles() {
  if (!props.editingSession?.id) return;
  filesLoading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/sessions/${props.editingSession.id}/files`, {
      headers: { ...getAuthHeaders() },
      credentials: "include",
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok) throw new Error(data?.error || "خطا در دریافت فایل‌ها");
    files.value = data.items || data.files || [];
  } catch (e) {
    files.value = [];
  } finally {
    filesLoading.value = false;
  }
}

function onPickFile(e) {
  newFile.value = e.target.files?.[0] || null;
}

async function uploadFile() {
  if (!newFile.value || !props.editingSession?.id) return;

  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append("file", newFile.value);
    if (newFileDesc.value) fd.append("description", newFileDesc.value);

    const res = await fetch(`${API_BASE}/api/sessions/${props.editingSession.id}/files`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      credentials: "include",
      body: fd,
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data?.error || "خطا در آپلود فایل");
    }

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
      headers: { ...getAuthHeaders() },
      credentials: "include",
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data?.error || "خطا در حذف فایل");
    }
    await fetchFiles();
  } catch (e) {
    alert(e?.message || "خطا در حذف فایل");
  }
}

// helpers
function fileName(path) {
  if (!path) return "file";
  return path.split("/").pop();
}
function fileUrl(f) {
  return f.url || (f.file_path ? `${API_BASE}/uploads/${f.file_path}` : "#");
}
function formatDateTime(val) {
  try { return new Date(val).toLocaleString("fa-IR"); }
  catch { return val; }
}
</script>

<style scoped>
.haf-files-box { background: #F6FAF9; border: 1px dashed #e6efec; }
.haf-file-list { list-style:none; padding:0; margin:0; display:grid; gap:8px; }
.haf-file-item {
  background:#fff; border:1px solid #e6efec; border-radius:10px;
  padding:8px 10px; display:flex; justify-content:space-between; align-items:center;
}
</style>
