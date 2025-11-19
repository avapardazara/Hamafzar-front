<template>
  <div class="min-h-screen grid md:grid-cols-2 bg-surface text-text">
    <!-- Left: Illustration Panel -->
    <section class="hidden md:flex items-center justify-center p-10">
      <div class="relative w-full max-w-3xl">
        <div
          class="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent"
        >
        </div>
        <div
          class="relative rounded-3xl border border-border/60 dark:border-white/10 bg-white/70 dark:bg-[#111928]/40 backdrop-blur-md p-6"
        >
          <!-- تصویر الهام‌بخش: جایگزین کن با تصویر خودت -->
          <img
            src="/images/login-illustration.svg"
            alt="Analytics illustration"
            class="w-full h-auto rounded-2xl object-contain"
          />
        </div>
      </div>
    </section>

    <!-- Right: Form Panel -->
    <section class="flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <!-- top actions -->
        <div class="flex items-center justify-between mb-8">
          <NuxtLink
            to="/"
            class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary inline-flex items-center gap-1"
          >
            <span>بازگشت به سایت</span>
            <span>⟵</span>
          </NuxtLink>
          <ThemeToggle />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
</script>
