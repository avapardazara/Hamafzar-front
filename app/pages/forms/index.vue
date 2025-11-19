<script setup lang="ts">
import Card from '../../../components/ui/atoms/Card.vue'
import FormField from '../../../components/ui/molecules/FormField.vue'
import DatePickerJalali from '../../../components/ui/molecules/DatePickerJalali.vue'
import { jalaliToGregorianStr } from '../../../utils/jalali-lite'

const form = reactive({
  start_date_jalali: null as string | null, // "1404/08/19"
  start_date_greg:   null as string | null, // "2025-11-10"
})

watch(() => form.start_date_jalali, (j) => {
  form.start_date_greg = j ? jalaliToGregorianStr(j) : null
})
</script>

<template>
  <div class="grid gap-6">
    <Card>
      <template #header>
        <h2 class="text-lg font-bold">تست پرشین دیت‌پیکر</h2>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <FormField label="تاریخ شروع (جلالی)" required>
          <DatePickerJalali v-model="form.start_date_jalali" />
        </FormField>

        <FormField label="تاریخ شروع (میلادی برای API)" help="فقط برای تست تبدیل نمایش داده می‌شود">
          <input
            class="w-full h-10 rounded-xl px-3 text-sm bg-white dark:bg-[#0f172a] border border-border/60 dark:border-white/15"
            :value="form.start_date_greg || ''"
            readonly
          />
        </FormField>
      </div>
    </Card>
  </div>
</template>
