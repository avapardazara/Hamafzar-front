<template>
  <div class="ha-auth rtl" dir="rtl">
    <div class="ha-shell" role="main" aria-label="صفحه ورود هم‌افزار">
      <!-- LEFT: Marketing slider 70% -->
      <section class="ha-left" aria-label="اسلایدر معرفی">
        <div class="ha-slider" :class="{ 'is-playing': autoplay }">
          <div
            v-for="(s, i) in slides"
            :key="i"
            class="ha-slide"
            :aria-hidden="current !== i"
            :style="{ backgroundImage: s.bg ? `url(${s.bg})` : '' }"
            :class="{ 'is-active': current === i }"
          >
            <div class="ha-slide__inner">
              <h2 class="ha-slide__title">{{ s.title }}</h2>
              <p class="ha-slide__desc">{{ s.desc }}</p>
            </div>
          </div>

          <div class="ha-slider__bullets" role="tablist" aria-label="پیمایش اسلاید">
            <button
              v-for="(s, i) in slides"
              :key="'b'+i"
              class="dot"
              :class="{ active: current === i }"
              :aria-selected="current === i"
              @click="go(i)"
            ></button>
          </div>

          <div class="ha-slider__controls" aria-label="کنترل‌های اسلایدر">
            <button class="ctrl" @click="prev" aria-label="قبلی">‹</button>
            <button class="ctrl" @click="next" aria-label="بعدی">›</button>
          </div>
        </div>
      </section>

      <!-- RIGHT: Login 30% -->
      <aside class="ha-right" aria-labelledby="loginTitle">
        <div class="ha-right__inner">
          <h1 id="loginTitle" class="ha-title">خوش آمدید به سامانه هم‌افزار</h1>
          <p class="ha-subtitle">
            لطفاً برای ورود به پنل آموزشی و مدیریتی، نام‌کاربری و رمز عبور خود را وارد کنید.
          </p>

          <form class="ha-form" @submit.prevent="onSubmit">
            <label class="ha-field">
              <span class="ha-label">نام‌کاربری</span>
              <input
                v-model.trim="form.username"
                type="text"
                autocomplete="username"
                required
                class="ha-input"
                placeholder="username"
              />
            </label>

            <label class="ha-field">
              <span class="ha-label">رمز عبور</span>
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="ha-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="ha-toggle"
                @click="togglePass"
                :aria-pressed="showPass"
              >
                {{ showPass ? 'مخفی' : 'نمایش' }}
              </button>
            </label>

            <button type="submit" class="ha-btn ha-btn--primary" :disabled="loading">
              <span v-if="!loading">ورود</span>
              <span v-else>درحال بررسی…</span>
            </button>
          </form>

          <p class="ha-foot">
            با ورود شما با <a href="#" class="ha-link">قوانین استفاده</a> موافقت می‌کنید.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: ['guest']
})
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import './login.css'
import useLogin from './login.page.js'

const { form, loading, showPass, togglePass, onSubmit } = useLogin()

const slides = ref([
  { title: 'یادگیری عملی، در مقیاس سازمانی', desc: 'دوره‌ها و مسیرهای منتورینگ برای رشد سریع تیم‌ها', bg: '' },
  { title: 'حضور و غیاب هوشمند', desc: 'ردیابی ساده و دقیق جلسات و عملکرد', bg: '' },
  { title: 'مالی و اقساط شفاف', desc: 'پرداخت‌ها و گزارش‌ها در یک نگاه', bg: '' },
])

const current = ref(0)
const autoplay = ref(true)   // همچنان خودکار پلی می‌شود، اما دکمه‌ی توقف نداریم
let timer = null

function go(i){ current.value = i }
function next(){ current.value = (current.value + 1) % slides.value.length }
function prev(){ current.value = (current.value - 1 + slides.value.length) % slides.value.length }
function play(){ stop(); timer = setInterval(next, 4500) }
function stop(){ if(timer){ clearInterval(timer); timer = null } }

onMounted(() => { if(autoplay.value) play() })
onBeforeUnmount(() => stop())
</script>
