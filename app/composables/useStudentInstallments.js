// app/composables/useStudentInstallments.js
import { ref } from "vue";
import { useRuntimeConfig, useCookie } from "#app";

function getAuthHeaders() {
  const token = useCookie("ha_token");
  const headers = {};
  if (token.value) {
    headers["Authorization"] = `Bearer ${token.value}`;
  }
  return headers;
}

function formatMoneyFa(value) {
  const n = Number(value || 0);
  return n.toLocaleString("fa-IR");
}

export function useStudentInstallments() {
  const loading = ref(false);
  const error = ref("");

  const items = ref([]);   // تک‌تک اقساط
  const plans = ref([]);   // خلاصه پلن‌ها
  const summary = ref({
    sum_total: 0,
    sum_paid: 0,
    sum_remain: 0,
  });

  async function fetchStudentInstallments(studentId) {
    if (!studentId) return;

    loading.value = true;
    error.value = "";
    try {
      const config = useRuntimeConfig();
      const apiBase = config.public?.apiBase || "http://localhost:5000";

      const res = await fetch(
        `${apiBase}/api/students/${studentId}/installments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "خطایی در دریافت اطلاعات اقساط رخ داد."
        );
      }

      items.value = data.items || [];
      plans.value = data.plans || [];
      summary.value = data.summary || {
        sum_total: 0,
        sum_paid: 0,
        sum_remain: 0,
      };
    } catch (e) {
      console.error("[installments] fetch error", e);
      error.value = e?.message || "خطا در دریافت اقساط دانشجو";
    } finally {
      loading.value = false;
    }
  }

  function formatStatus(status) {
    const v = (status || "").toUpperCase();
    if (v === "PAID") return "تسویه شده";
    if (v === "OVERDUE") return "معوق";
    if (v === "CANCELLED") return "لغو شده";
    return "در انتظار پرداخت";
  }

  return {
    // state
    loading,
    error,
    items,
    plans,
    summary,

    // actions
    fetchStudentInstallments,

    // helpers
    formatMoneyFa,
    formatStatus,
  };
}
