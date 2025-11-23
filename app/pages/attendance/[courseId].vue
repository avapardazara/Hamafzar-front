<template>
  <div class="haf-page" dir="rtl">
    <div class="haf-card haf-flex haf-between haf-align-center haf-mb-sm">
      <div>
        <div class="haf-title">حضور و غیاب دوره</div>
        <div class="haf-muted haf-mt-xs">{{ course?.title || "—" }}</div>
      </div>

      <NuxtLink class="haf-btn haf-btn--ghost" :to="`/courses/${courseId}`">
        بازگشت به دوره
      </NuxtLink>
    </div>

    <div class="haf-card haf-mb-sm">
      <label class="haf-label">انتخاب جلسه</label>
      <select v-model="selectedSessionId" class="haf-input">
        <option value="">— انتخاب —</option>
        <option v-for="s in sessions" :key="s.id" :value="s.id">
          {{ formatDate(s.session_date || s.date) }} | {{ s.topic || "جلسه" }}
        </option>
      </select>
    </div>

    <div class="haf-card">
      <div v-if="loading" class="haf-empty-state">در حال بارگذاری…</div>
      <div v-else-if="!selectedSessionId" class="haf-empty-state">یک جلسه انتخاب کن.</div>
      <div v-else>
        <table class="haf-table">
          <thead>
            <tr>
              <th>#</th>
              <th>نام دانشجو</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(st, i) in enrolledStudents" :key="st.id">
              <td>{{ i+1 }}</td>
              <td>
                <div class="haf-strong">{{ st.full_name || st.name }}</div>
                <div class="haf-muted haf-small">{{ st.phone || st.username || "" }}</div>
              </td>
              <td>
                <div class="haf-flex haf-gap-xs">
                  <label class="haf-pill">
                    <input type="radio" :name="`s_${st.id}`" value="PRESENT" v-model="attendanceMap[st.id]" />
                    حاضر
                  </label>
                  <label class="haf-pill">
                    <input type="radio" :name="`s_${st.id}`" value="ABSENT" v-model="attendanceMap[st.id]" />
                    غایب
                  </label>
                  <label class="haf-pill">
                    <input type="radio" :name="`s_${st.id}`" value="LATE" v-model="attendanceMap[st.id]" />
                    تأخیری
                  </label>
                  <label class="haf-pill">
                    <input type="radio" :name="`s_${st.id}`" value="REMOTE" v-model="attendanceMap[st.id]" />
                    آنلاین
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="haf-flex haf-end haf-mt-sm">
          <button class="haf-btn haf-btn--primary" :disabled="saving" @click="saveAttendance">
            {{ saving ? "در حال ذخیره…" : "ذخیره حضور و غیاب" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const API_BASE = "http://localhost:5000";
const route = useRoute();

const courseId = computed(() => route.params.courseId);

const loading = ref(false);
const saving = ref(false);

const course = ref(null);
const sessions = ref([]);
const enrolledStudents = ref([]);

const selectedSessionId = ref(route.query.session || "");
const attendanceMap = ref({}); // {student_id: status}

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

async function fetchCourseAndSessions() {
  const [courseRes, sessRes] = await Promise.all([
    fetch(`${API_BASE}/api/courses/${courseId.value}`, { headers: getAuthHeaders(), credentials:"include" }),
    fetch(`${API_BASE}/api/courses/${courseId.value}/sessions`, { headers: getAuthHeaders(), credentials:"include" }),
  ]);

  const cData = await courseRes.json().catch(()=> ({}));
  const sData = await sessRes.json().catch(()=> ({}));

  course.value = cData.course || cData || null;
  sessions.value = sData.items || sData.sessions || sData || [];
}

// enrolled students
async function fetchEnrolledStudents() {
  const res = await fetch(`${API_BASE}/api/courses/${courseId.value}/students`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  const data = await res.json().catch(()=> ({}));
  enrolledStudents.value = data.enrolled || data.students || [];
}

// load current attendance for a session
async function fetchAttendance(sessionId) {
  if (!sessionId) return;

  const res = await fetch(
    `${API_BASE}/api/courses/${courseId.value}/attendance?session_id=${sessionId}`,
    { headers: getAuthHeaders(), credentials:"include" }
  );
  const data = await res.json().catch(()=> ({}));

  // data.items expected: [{student_id, status}]
  const items = data.items || data.attendances || [];
  const map = {};
  for (const it of items) {
    map[it.student_id] = it.status;
  }
  // default for missing -> ABSENT? (مثل فرم قدیمی)
  for (const st of enrolledStudents.value) {
    if (!map[st.id]) map[st.id] = "ABSENT";
  }
  attendanceMap.value = map;
}

async function saveAttendance() {
  saving.value = true;
  try {
    const items = enrolledStudents.value.map(st => ({
      student_id: st.id,
      status: attendanceMap.value[st.id] || "ABSENT",
    }));

    const res = await fetch(`${API_BASE}/api/courses/${courseId.value}/attendance`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type":"application/json" },
      credentials: "include",
      body: JSON.stringify({
        session_id: selectedSessionId.value,
        items
      }),
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data?.error || "خطا در ذخیره حضور و غیاب");
    }
    alert("✅ حضور و غیاب ذخیره شد.");
  } catch (e) {
    alert(e?.message || "خطا در ذخیره");
  } finally {
    saving.value = false;
  }
}

async function reloadAll() {
  loading.value = true;
  try {
    await Promise.all([fetchCourseAndSessions(), fetchEnrolledStudents()]);
    if (selectedSessionId.value) {
      await fetchAttendance(selectedSessionId.value);
    }
  } finally {
    loading.value = false;
  }
}

watch(selectedSessionId, (v) => {
  if (v) fetchAttendance(v);
});

onMounted(reloadAll);
</script>
