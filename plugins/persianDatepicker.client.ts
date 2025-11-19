import { defineNuxtPlugin } from 'nuxt/app'
import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker'
import 'vue3-persian-datetime-picker/dist/vue3-persian-datetime-picker.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('PersianDatePicker', Vue3PersianDatetimePicker)
})
