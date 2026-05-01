<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-20 px-6 bg-[var(--bg-primary)] transition-colors duration-300">
    <div class="max-w-[1000px] mx-auto">
      <!-- Badge -->
      <div class="flex justify-center mb-6">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full bg-[#f0bf6c]/10 border border-[#f0bf6c]/20 text-[#f0bf6c] font-inter text-xs font-medium tracking-wide">
          {{ t('case_study.badge') }}
        </span>
      </div>

      <!-- Title -->
      <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] text-center mb-4 transition-colors duration-300 text-[var(--text-primary)]" v-html="t('case_study.title')">
      </h2>
      <p class="text-sm sm:text-base max-w-xl mx-auto text-center leading-relaxed transition-colors duration-300 text-[var(--text-secondary)] mb-12">
        {{ t('case_study.subtitle') }}
      </p>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div v-for="(stat, key) in { followers: t('case_study.stats.followers.value'), users: t('case_study.stats.users.value'), conversion: t('case_study.stats.conversion.value') }" :key="key" class="text-center p-6 rounded-2xl bg-white border border-[#1a1a1a]/8 shadow-[0_4px_20px_rgba(26,26,26,0.05)]">
          <p class="text-3xl sm:text-4xl font-manrope font-bold text-gradient mb-2">{{ stat }}</p>
          <p class="text-sm text-[var(--text-secondary)]">
            {{ key === 'followers' ? t('case_study.stats.followers.label') : key === 'users' ? t('case_study.stats.users.label') : t('case_study.stats.conversion.label') }}
          </p>
        </div>
      </div>

      <!-- Quote -->
      <div class="max-w-[700px] mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-[#1a1a1a]/8 shadow-[0_4px_20px_rgba(26,26,26,0.05)]">
        <p class="font-inter text-sm sm:text-base leading-relaxed text-[#1a1a1a]/85 italic mb-6">
          "{{ t('case_study.quote') }}"
        </p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg overflow-hidden">
            <NuxtImg src="/img/main/founder.png" alt="Mohamed Chettah" class="w-full h-full object-cover" />
          </div>
          <div>
            <p class="font-inter text-sm font-semibold text-[var(--text-primary)]">{{ t('case_study.author') }}</p>
            <p class="font-inter text-xs text-[var(--text-secondary)]">{{ t('case_study.author_role') }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
