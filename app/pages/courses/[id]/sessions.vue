<template>
  <div class="haf-page" dir="rtl">
    <!-- Header -->
    <div class="haf-card haf-flex haf-between haf-align-center haf-mb-sm">
      <div>
        <div class="haf-title">جلسات دوره</div>
        <div class="haf-muted haf-mt-xs">{{ course?.title || "—" }}</div>
      </div>

      <div class="haf-flex haf-gap-sm">
        <NuxtLink class="haf-btn haf-btn--ghost" :to="`/courses/${courseId}`">
          پروفایل دوره
        </NuxtLink>

        <button
          class="haf-btn haf-btn--soft"
          :disabled="!todaySession"
          @click="goToTodaySession"
        >
          🌤️ جلسه امروز
        </button>

        <NuxtLink class="haf-btn haf-btn--primary" :to="`/courses/${courseId}/sessions/create`">
          ➕ جلسه جدید
        </NuxtLink>
      </div>
    </div>

    <!-- Table -->
    <div class="haf-card">
      <div v-if="loading" class="haf-empty-state">در حال بارگذاری…</div>
      <div v-else-if="error" class="haf-empty-state haf-text-danger">{{ error }}</div>

      <table v-else class="haf-table">
        <thead>
          <tr>
            <th>#</th>
            <th>تاریخ</th>
            <th>شروع</th>
            <th>پایان</th>
            <th>عنوان</th>
            <th style="width:220px">عملیات</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(s, i) in sessions" :key="s.id">
            <td>{{ i + 1 }}</td>
            <td>{{ formatDate(s.session_date || s.date) }}</td>
            <td>{{ formatTime(s.start_time) }}</td>
            <td>{{ formatTime(s.end_time) }}</td>
            <td>
              <div class="haf-strong">{{ s.topic || "جلسه آموزشی" }}</div>
              <div v-if="s.description" class="haf-muted haf-small haf-mt-2">
                {{ s.description }}
              </div>
            </td>
            <td>
              <div class="haf-flex haf-gap-xs">
                <NuxtLink
                  class="haf-btn haf-btn--soft"
                  :to="`/courses/${courseId}/sessions/${s.id}`"
                >
                  نمایش
                </NuxtLink>

                <NuxtLink
                  class="haf-btn haf-btn--soft"
                  :to="`/attendance/${courseId}?session=${s.id}`"
                >
                  حضورغیاب
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!sessions.length && !loading" class="haf-empty-state">
        هنوز جلسه‌ای ثبت نشده.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCookie } from "#app";

const API_BASE = "http://localhost:5000";
const route = useRoute();
const router = useRouter();
const courseId = computed(() => route.params.id);

const loading = ref(false);
const error = ref("");
const course = ref(null);
const sessions = ref([]);

// ---------------- Auth
function getAuthHeaders() {
  const token = useCookie("ha_token", { path: "/" });
  const h = {};
  if (token.value) h.Authorization = `Bearer ${token.value}`;
  return h;
}

// ---------------- formatters
function formatDate(val) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return d.toLocaleDateString("fa-IR");
  } catch {
    return val;
  }
}
function formatTime(val) {
  if (!val) return "—";
  return String(val).slice(0, 5);
}

const todayISO = () => new Date().toISOString().slice(0, 10);

// جلسه امروز
const todaySession = computed(() => {
  const t = todayISO();
  return (sessions.value || []).find(s => {
    const sd = (s.session_date || s.date || "").toString().slice(0, 10);
    return sd === t;
  }) || null;
});

function goToTodaySession() {
  if (!todaySession.value) {
    alert("برای امروز جلسه‌ای ثبت نشده.");
    return;
  }
  router.push(`/courses/${courseId.value}/sessions/${todaySession.value.id}`);
}

// ---------------- fetchers
async function fetchCourse() {
  const res = await fetch(`${API_BASE}/api/courses/${courseId.value}`, {
    headers: { ...getAuthHeaders() },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  course.value = data.course || data || null;
}

async function fetchSessions() {
  const res = await fetch(`${API_BASE}/api/courses/${courseId.value}/sessions`, {
    headers: { ...getAuthHeaders() },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  sessions.value = data.items || data.sessions || data || [];
}

async function reload() {
  loading.value = true;
  error.value = "";
  try {
    await Promise.all([fetchCourse(), fetchSessions()]);
  } catch (e) {
    error.value = e?.message || "خطا در دریافت اطلاعات جلسات";
  } finally {
    loading.value = false;
  }
}

onMounted(reload);
</script>
