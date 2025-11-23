// app/pages/courses/courses.page.js
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCookie } from "#app";

const API_BASE = "http://localhost:5000";

// ----------------------------
// Auth helpers
// ----------------------------
function getAuthHeaders() {
  const token = useCookie("ha_token", { path: "/" });
  const headers = {};
  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`;
  }
  return headers;
}

function handleUnauthorized(res, data, router) {
  if (!res) return;
  if (res.status === 401 || data?.error === "unauthorized") {
    const token = useCookie("ha_token", { path: "/" });
    token.value = null;
    if (process.client && router) {
      // مسیر لاگین ما /auth/login است
      router.push("/auth/login");
    }
    throw new Error("unauthorized");
  }
}

// ----------------------------
// Course normalizer
// ----------------------------
function normalizeCourse(raw) {
  if (!raw) return null;

  const id = raw.id ?? raw.course_id ?? raw.pk ?? null;
  const title = (raw.title || "").trim();

  // Mentor name (from related object or flat fields)
  let mentor_name =
    raw.mentor_name ||
    raw.mentor_full_name ||
    (raw.mentor &&
      (raw.mentor.full_name ||
        `${raw.mentor.first_name || ""} ${
          raw.mentor.last_name || ""
        }`.trim())) ||
    "";

  mentor_name = (mentor_name || "").trim() || null;

  const status = (raw.status || "").toUpperCase() || "ACTIVE";

  const cover_path = raw.cover_image || raw.cover_path || null;
  let cover_url = raw.cover_url || null;
  if (!cover_url && cover_path) {
    // بک‌اند معمولاً فایل‌ها را در /uploads قرار می‌دهد
    cover_url = `/uploads/${cover_path}`;
  }

  return {
    ...raw,
    id,
    title,
    mentor_name,
    status,
    cover_path,
    cover_url,
  };
}

// ----------------------------
// 1) لیست دوره‌ها
// ----------------------------
export function useCourses() {
  const router = useRouter();
  const route = useRoute();

  const loading = ref(false);
  const error = ref(null);
  const courses = ref([]);
  const total = ref(0);

  const filters = reactive({
    q: (route.query.q || "").toString(),
    status: (route.query.status || "").toString(),
  });

  const pagination = reactive({
    page: Number(route.query.page || 1),
    pageSize: 20,
  });

  const hasRows = computed(() => courses.value.length > 0);

  function formatStatusLabel(s) {
    const v = (s || "").toUpperCase();
    if (v === "ARCHIVED") return "آرشیو";
    if (v === "DRAFT") return "پیش‌نویس";
    return "فعال";
  }

  async function fetchCourses() {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.status) params.set("status", filters.status);
      params.set("page", String(pagination.page));
      params.set("per_page", String(pagination.pageSize));

      const query = params.toString();
      const url = query
        ? `${API_BASE}/api/courses?${query}`
        : `${API_BASE}/api/courses`;

      console.log("[courses] fetch URL:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[courses] fetch error", res.status, data);
        handleUnauthorized(res, data, router);
        throw new Error(data?.error || "خطا در دریافت لیست دوره‌ها");
      }

      const items = data?.items || data?.courses || data?.results || [];
      const normalized = (Array.isArray(items) ? items : [])
        .map(normalizeCourse)
        .filter(Boolean);

      courses.value = normalized;
      total.value = data?.total ?? normalized.length;
    } catch (err) {
      console.error("[courses] fetch exception", err);
      if (err.message !== "unauthorized") {
        error.value = err?.message || "خطا در دریافت لیست دوره‌ها";
      }
    } finally {
      loading.value = false;
    }
  }

  function syncQueryToRoute() {
    const query = { ...route.query };

    if (filters.q) query.q = filters.q;
    else delete query.q;

    if (filters.status) query.status = filters.status;
    else delete query.status;

    query.page = String(pagination.page);

    router.replace({ query }).catch(() => {});
  }

  function applyFilters() {
    pagination.page = 1;
    syncQueryToRoute();
    fetchCourses();
  }

  function resetFilters() {
    filters.q = "";
    filters.status = "";
    pagination.page = 1;
    syncQueryToRoute();
    fetchCourses();
  }

  function goToCreate() {
    router.push("/courses/create");
  }

  function goToEdit(course) {
    if (!course?.id) return;
    // مثل دانشجو: صفحه create با id
    router.push(`/courses/create?id=${course.id}`);
  }

  function goToProfile(course) {
    if (!course?.id) return;
    router.push(`/courses/${course.id}`);
  }

  async function archiveCourse(course) {
    if (!course?.id) return;
    const ok = window.confirm(
      `آیا از بایگانی دوره «${course.title || course.id}» مطمئن هستید؟`
    );
    if (!ok) return;

    try {
      const url = `${API_BASE}/api/courses/${course.id}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "ARCHIVED",
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[courses] archive error", res.status, data);
        handleUnauthorized(res, data, router);
        throw new Error(data?.error || "خطا در بایگانی دوره");
      }

      // optimistic update
      courses.value = courses.value.map((c) =>
        c.id === course.id ? { ...c, status: "ARCHIVED" } : c
      );
    } catch (err) {
      console.error("[courses] archive exception", err);
      if (err.message !== "unauthorized") {
        window.alert(err?.message || "خطا در بایگانی دوره");
      }
    }
  }

  onMounted(() => {
    fetchCourses();
  });

  return {
    loading,
    error,
    courses,
    total,
    filters,
    pagination,
    hasRows,
    formatStatusLabel,
    fetchCourses,
    applyFilters,
    resetFilters,
    goToCreate,
    goToEdit,
    goToProfile,
    archiveCourse,
  };
}

// ----------------------------
// 2) فرم ساخت / ویرایش دوره
// ----------------------------
export function useCourseForm() {
  const router = useRouter();
  const route = useRoute();

  const loading = ref(false);
  const submitting = ref(false);
  const error = ref(null);

  const courseId = computed(() => {
    const raw = route.query.id;
    return raw ? Number(raw) : null;
  });
  const isEdit = computed(() => !!courseId.value);

  // فرم اصلی (بدون حذف هیچ فیلد قبلی)
  const form = reactive({
    title: "",
    mentor_id: "",
    capacity: "",
    status: "ACTIVE",
    category: "",
    level: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    description: "",
    fee_per_student: "",
    mentor_share_percent: "",

    // ✅ جدید: نوع زمان‌بندی (سازگار با Jinja)
    schedule_type: "CUSTOM", // CUSTOM | WEEKLY
  });

  // ✅ جدید: state زمان‌بندی
  const sessions = ref([]); // [{date:"yyyy-mm-dd"}]
  const weeklyDays = ref([]); // ["SA","MO",...]
  const pairOdd = ref(""); // "" | "PAIR" | "ODD"
  const customDateInput = ref("");

  const WEEK_DAYS = [
    { code: "SA", label: "شنبه" },
    { code: "SU", label: "یکشنبه" },
    { code: "MO", label: "دوشنبه" },
    { code: "TU", label: "سه‌شنبه" },
    { code: "WE", label: "چهارشنبه" },
    { code: "TH", label: "پنجشنبه" },
    { code: "FR", label: "جمعه" },
  ];

  function addCustomDate() {
    const d = customDateInput.value;
    if (!d) return;
    if (!sessions.value.find((x) => x.date === d)) {
      sessions.value.push({ date: d });
    }
    customDateInput.value = "";
  }

  function removeCustomDate(i) {
    sessions.value.splice(i, 1);
  }

  function toggleWeeklyDay(code) {
    if (pairOdd.value) return; // مثل Jinja: وقتی زوج/فرد فعاله، روزها قفل میشن
    if (weeklyDays.value.includes(code)) {
      weeklyDays.value = weeklyDays.value.filter((x) => x !== code);
    } else {
      weeklyDays.value.push(code);
    }
  }

  function setPairOdd(val) {
    pairOdd.value = val || "";
    if (pairOdd.value) {
      weeklyDays.value = []; // مثل Jinja: زوج/فرد → روزها خالی
    }
  }

  watch(weeklyDays, (arr) => {
    if (arr.length > 0) pairOdd.value = "";
  });

  // ✅ payload زمان‌بندی مثل hiddenهای Jinja
  const schedulePayload = computed(() => {
    const payload = {
      schedule_type: form.schedule_type,
      sessions_json: JSON.stringify(sessions.value),
      weekly_days_json: JSON.stringify(weeklyDays.value),
      schedule_days: "",
      schedule_pattern: "",
      pair_odd: pairOdd.value || null,
    };

    if (form.schedule_type === "WEEKLY") {
      if (pairOdd.value === "PAIR") payload.schedule_pattern = "EVEN";
      else if (pairOdd.value === "ODD") payload.schedule_pattern = "ODD";
      payload.schedule_days = weeklyDays.value.join(",");
    }

    return payload;
  });

  // کاور
  const coverFile = ref(null);
  const coverPreview = ref(null);

  function onCoverChange(evt) {
    const file = evt?.target?.files?.[0];
    coverFile.value = file || null;
    if (file) {
      coverPreview.value = URL.createObjectURL(file);
    } else {
      coverPreview.value = null;
    }
  }

  // 🔹 لیست منتورها برای سلکت
  const mentorsOptions = ref([]);

  async function fetchMentorsForSelect() {
    try {
      const url = `${API_BASE}/api/mentors`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[course-form] mentors fetch error", res.status, data);
        handleUnauthorized(res, data, router);
        throw new Error(data?.error || "خطا در دریافت لیست منتورها");
      }

      const items = data.items || data.mentors || data.results || [];
      mentorsOptions.value = (Array.isArray(items) ? items : [])
        .filter((m) => !m.is_deleted)
        .map((m) => ({
          id: m.id,
          full_name:
            m.full_name ||
            `${m.first_name || ""} ${m.last_name || ""}`.trim() ||
            `منتور #${m.id}`,
        }));
    } catch (err) {
      console.error("[course-form] mentors fetch exception", err);
      if (err.message !== "unauthorized") {
        // فقط لاگ
      }
    }
  }

  // 🔹 لود دوره در حالت ویرایش
  async function loadCourse() {
    if (!isEdit.value || !courseId.value) return;

    loading.value = true;
    error.value = null;

    try {
      const url = `${API_BASE}/api/courses/${courseId.value}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[course-form] load error", res.status, data);
        handleUnauthorized(res, data, router);
        throw new Error(data?.error || "خطا در دریافت اطلاعات دوره");
      }

      const raw = data?.course || data;
      const c = normalizeCourse(raw);

      form.title = c.title || "";
      form.mentor_id = c.mentor_id || c.mentor?.id || "";
      form.capacity = c.capacity ?? "";
      form.status = c.status || "ACTIVE";
      form.category = c.category || "";
      form.level = c.level || "";
      form.start_date = c.start_date || c.start_date_gregorian || "";
      form.end_date = c.end_date || c.end_date_gregorian || "";
      form.start_time = c.start_time || "";
      form.end_time = c.end_time || "";
      form.description = c.description || "";
      form.fee_per_student = c.fee_per_student ?? "";
      form.mentor_share_percent = c.mentor_share_percent ?? "";

      // ✅ جدید: hydrate زمان‌بندی از بک‌اند
      form.schedule_type =
        c.schedule_type || (c.schedule_days ? "WEEKLY" : "CUSTOM");

      try {
        sessions.value = c.sessions_json
          ? JSON.parse(c.sessions_json)
          : Array.isArray(c.sessions)
          ? c.sessions
          : [];
      } catch {
        sessions.value = [];
      }

      try {
        weeklyDays.value = c.weekly_days_json
          ? JSON.parse(c.weekly_days_json)
          : (c.schedule_days || "").split(",").filter(Boolean);
      } catch {
        weeklyDays.value = [];
      }

      if (c.pair_odd) pairOdd.value = c.pair_odd;
      else if (c.schedule_pattern === "EVEN") pairOdd.value = "PAIR";
      else if (c.schedule_pattern === "ODD") pairOdd.value = "ODD";
      else pairOdd.value = "";

      coverPreview.value = c.cover_url || null;
    } catch (err) {
      console.error("[course-form] load exception", err);
      if (err.message !== "unauthorized") {
        error.value = err?.message || "خطا در دریافت اطلاعات دوره";
      }
    } finally {
      loading.value = false;
    }
  }

  // 🔹 سابمیت فرم
  async function onSubmit() {
    submitting.value = true;
    error.value = null;

    try {
      const isUpdate = isEdit.value && courseId.value;
      const url = isUpdate
        ? `${API_BASE}/api/courses/${courseId.value}`
        : `${API_BASE}/api/courses`;
      const method = isUpdate ? "PUT" : "POST";

      const fd = new FormData();

      // فیلدهای اصلی
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          fd.append(key, value);
        }
      });

      // ✅ جدید: فیلدهای زمان‌بندی (مثل hidden‌های Jinja)
      Object.entries(schedulePayload.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          fd.append(key, value);
        }
      });

      if (coverFile.value) {
        fd.append("cover_image", coverFile.value);
      }

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[course-form] submit error", res.status, data);
        handleUnauthorized(res, data, router);
        throw new Error(data?.error || "خطا در ذخیره اطلاعات دوره");
      }

      const id = data?.id || data?.course?.id || courseId.value;
      if (id) {
        router.push(`/courses/${id}`);
      } else {
        router.push("/courses");
      }
    } catch (err) {
      console.error("[course-form] submit exception", err);
      if (err.message !== "unauthorized") {
        error.value = err?.message || "خطا در ذخیره اطلاعات دوره";
      }
    } finally {
      submitting.value = false;
    }
  }

  function goBack() {
    router.push("/courses");
  }

  onMounted(() => {
    fetchMentorsForSelect();
    if (isEdit.value) {
      loadCourse();
    }
  });

  return {
    loading,
    submitting,
    error,
    form,
    isEdit,
    courseId,

    coverPreview,
    onCoverChange,
    onSubmit,
    goBack,
    mentorsOptions,

    // ✅ زمان‌بندی
    WEEK_DAYS,
    sessions,
    weeklyDays,
    pairOdd,
    customDateInput,
    addCustomDate,
    removeCustomDate,
    toggleWeeklyDay,
    setPairOdd,
  };
}

// ----------------------------
// 3) پروفایل دوره + تب‌ها
// ----------------------------
export function useCourseProfile() {
  const route = useRoute();
  const router = useRouter();

  const loading = ref(false);
  const error = ref("");

  const course = ref(null);
  const sessions = ref([]);
  const students = ref([]);
  const studentsOptions = ref([]);
  const finance = ref(null);

  const studentToEnroll = ref("");
  const enrolling = ref(false);
  const unenrollingId = ref(null);
  const generatingSessions = ref(false);

  async function fetchCourse() {
    loading.value = true;
    error.value = "";
    const id = route.params.id;

    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[course-profile] detail error", res.status, data);
        handleUnauthorized(res, data, router);
        throw new Error(data?.error || "خطا در دریافت اطلاعات دوره");
      }

      course.value = data.course || data || null;
      if (Array.isArray(data.students)) {
        students.value = data.students;
      }
      finance.value = data.finance || null;
    } catch (err) {
      console.error("[course-profile] fetchCourse exception", err);
      if (err.message !== "unauthorized") {
        error.value = err.message || "خطایی رخ داد";
      }
    } finally {
      loading.value = false;
    }
  }
  function formatStatusLabel(s) {
    const v = (s || "").toUpperCase();
    if (v === "ARCHIVED") return "آرشیو";
    if (v === "DRAFT") return "پیش‌نویس";
    return "فعال";
  }
  async function fetchSessions() {
    const id = route.params.id;
    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}/sessions`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[course-profile] sessions error", res.status, data);
        handleUnauthorized(res, data, router);
        return;
      }

      sessions.value = data.items || data.sessions || [];
    } catch (err) {
      console.error("[course-profile] fetchSessions exception", err);
    }
  }

  async function fetchStudentsForCourse() {
    const id = route.params.id;
    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}/students`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[course-profile] students error", res.status, data);
        handleUnauthorized(res, data, router);
        return;
      }

      const enrolled = data.enrolled || data.students || [];
      const available = data.available || [];

      students.value = enrolled;
      studentsOptions.value = available;
    } catch (err) {
      console.error("[course-profile] fetchStudentsForCourse exception", err);
    }
  }

  async function enrollSelectedStudent() {
    const id = route.params.id;
    const sid = Number(studentToEnroll.value || 0);
    if (!sid || !id) return;
    if (!window.confirm("این دانشجو در این دوره ثبت‌نام شود؟")) return;

    enrolling.value = true;
    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}/students/enroll`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ student_id: sid }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        console.error("[course-profile] enroll error", res.status, data);
        handleUnauthorized(res, data, router);
        window.alert(data?.error || "خطا در ثبت‌نام دانشجو در دوره");
        return;
      }

      studentToEnroll.value = "";
      await fetchStudentsForCourse();
    } catch (err) {
      console.error("[course-profile] enroll exception", err);
      window.alert("خطای غیرمنتظره در ثبت‌نام دانشجو");
    } finally {
      enrolling.value = false;
    }
  }

  async function unenrollStudent(st) {
    const id = route.params.id;
    const sid = st?.id;
    if (!id || !sid) return;

    const ok = window.confirm(
      `دانشجو «${st.full_name || st.name || sid}» از دوره حذف شود؟`
    );
    if (!ok) return;

    unenrollingId.value = sid;
    try {
      const res = await fetch(
        `${API_BASE}/api/courses/${id}/students/unenroll`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ student_id: sid }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        console.error("[course-profile] unenroll error", res.status, data);
        handleUnauthorized(res, data, router);
        window.alert(data?.error || "خطا در حذف دانشجو از دوره");
        return;
      }

      await fetchStudentsForCourse();
    } catch (err) {
      console.error("[course-profile] unenroll exception", err);
      window.alert("خطای غیرمنتظره در حذف دانشجو");
    } finally {
      unenrollingId.value = null;
    }
  }

  async function generateSessionsAndOpen() {
    const id = route.params.id;
    if (!id) return;
    generatingSessions.value = true;

    try {
      const payload = {
        schedule_type: course.value?.schedule_type || null,
        sessions_json: course.value?.sessions_json || null,
        weekly_days_json: course.value?.weekly_days_json || null,
        schedule_days: course.value?.schedule_days || null,
        schedule_pattern: course.value?.schedule_pattern || null,
        pair_odd: course.value?.pair_odd || null,
        start_date:
          course.value?.start_date ||
          course.value?.start_date_gregorian ||
          null,
        end_date:
          course.value?.end_date || course.value?.end_date_gregorian || null,
        start_time: course.value?.start_time || null,
        end_time: course.value?.end_time || null,
      };

      const res = await fetch(
        `${API_BASE}/api/courses/${id}/sessions/generate`,
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

      if (!res.ok && res.status !== 409) {
        console.error(
          "[course-profile] generate sessions error",
          res.status,
          data
        );
        handleUnauthorized(res, data, router);
        throw new Error(data?.error || "خطا در تولید جلسات");
      }

      if (res.status === 409) {
        window.alert(data?.error || "جلسات قبلاً ساخته شده‌اند.");
      }

      await fetchSessions();

      // مثل قبل: رفتن به حضور و غیاب بک‌اند (جدیدش بعداً)
      const courseId = course.value?.id || id;
      window.open(`${API_BASE}/courses/${courseId}/attendance`, "_blank");
    } catch (err) {
      console.error("[course-profile] generateSessionsAndOpen exception", err);
      if (err.message !== "unauthorized") {
        window.alert(err?.message || "خطا در تولید جلسات");
      }
    } finally {
      generatingSessions.value = false;
    }
  }

  async function reloadAll() {
    await Promise.all([
      fetchCourse(),
      fetchSessions(),
      fetchStudentsForCourse(),
    ]);
  }

  onMounted(() => {
    reloadAll();
  });

  watch(
    () => route.params.id,
    () => reloadAll()
  );

  const kpis = computed(() => {
    const sess = sessions.value || [];
    const totalSessions = sess.length;
    const totalStudents = Array.isArray(students.value)
      ? students.value.length
      : 0;

    let totalPresent = 0;
    let totalAbsent = 0;

    for (const s of sess) {
      const st = s.stats || {};
      totalPresent += st.present || 0;
      totalAbsent += st.absent || 0;
    }

    return {
      totalSessions,
      totalStudents,
      totalPresent,
      totalAbsent,
      formatStatusLabel,
    };
  });

  function formatDate(val) {
    if (!val) return "—";
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return val;
      return d.toLocaleDateString("fa-IR");
    } catch {
      return val;
    }
  }

  function formatTime(val) {
    if (!val) return "—";
    return String(val).slice(0, 5);
  }

  function formatNumber(n) {
    if (n == null) return "۰";
    try {
      return Number(n).toLocaleString("fa-IR");
    } catch {
      return String(n);
    }
  }

  function goBack() {
    router.push("/courses");
  }

  function getInitials() {
    const t = course.value?.title || "";
    if (!t) return "دوره";
    return t.trim().substring(0, 2);
  }

  // ============================
  // ✅ جدید: جلسه امروز + نمایش جلسه (روی بک‌اند)
  // ============================
const todayISO = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const todaySession = computed(() => {
  const t = todayISO()
  const list = sessions.value || []

  return list.find(s => {
    const raw = s.session_date || s.date
    if (!raw) return false
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return false

    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const isoLocal = `${y}-${m}-${day}`

    return isoLocal === t
  }) || null
})

  function goToTodaySession() {
    if (!todaySession.value) {
      window.alert("برای امروز جلسه‌ای ثبت نشده.");
      return;
    }
    const cid = course.value?.id || route.params.id;
    const sid = todaySession.value.id;
    if (!cid || !sid) return;

    // ✅ مسیر درست صفحه جلسه
    router.push(`/attendance/${cid}/session/${sid}`);
  }

  function viewSession(s) {
    const cid = course.value?.id || route.params.id;
    const sid = s?.id;
    if (!cid || !sid) return;

    // ✅ مسیر درست صفحه جلسه
    router.push(`/attendance/${cid}/session/${sid}`);
  }

  return {
    loading,
    error,
    course,
    sessions,
    students,
    studentsOptions,
    finance,

    kpis,
    formatDate,
    formatTime,
    formatNumber,
    getInitials,
    goBack,
    reloadAll,

    studentToEnroll,
    enrolling,
    unenrollingId,
    enrollSelectedStudent,
    unenrollStudent,
    generatingSessions,
    generateSessionsAndOpen,

    // ✅ جدید
    todaySession,
    goToTodaySession,
    viewSession,
  };
}
