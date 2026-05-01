<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section
    class="py-16 px-0 sm:px-4 bg-[var(--bg-primary)] transition-colors duration-300"
  >
    <div
      class="max-w-[1216px] mx-auto px-4 sm:px-0 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-center"
    >
      <div class="space-y-4">
        <div class="space-y-4">
          <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-3 transition-colors duration-300 text-gradient">
            {{ t('partners.example.title') }}
          </h2>
          <p
            class="font-inter text-sm sm:text-base max-w-xl leading-relaxed transition-colors duration-300 text-[var(--text-secondary)]"
            v-html="t('partners.example.subtitle')"
          ></p>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="theme-bg-card theme-border rounded-xl border px-4 py-4">
            <p class="font-inter text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {{ t('partners.example.amount_label') }}
            </p>
            <p class="font-manrope text-2xl font-semibold text-[var(--text-primary)] mt-1">
              <span v-html="t('partners.example.amount_value')"></span>
            </p>
          </div>

          <div class="theme-bg-card theme-border rounded-xl border px-4 py-4">
            <p class="font-inter text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {{ t('partners.example.rate_label') }}
            </p>
            <p class="font-manrope text-2xl font-semibold text-[var(--text-primary)] mt-1">
              <span v-html="t('partners.example.rate_value')"></span>
            </p>
          </div>

          <div class="theme-bg-card theme-border rounded-xl border px-4 py-4">
            <p class="font-inter text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {{ t('partners.example.commission_label') }}
            </p>
            <p class="font-manrope text-2xl font-semibold text-[var(--color-gold)] mt-1">
              <span v-html="t('partners.example.commission_value')"></span>
            </p>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/70 px-6 py-6 flex flex-col gap-4"
      >
        <p class="font-inter text-sm text-[var(--text-primary)]">
          {{ t('partners.example.quote') }}
        </p>
        <div class="flex items-center gap-3">
          <div
            class="w-[44px] h-[44px] rounded-lg bg-[linear-gradient(135deg,var(--color-gold)_0%,#e8a84c_100%)] flex items-center justify-center font-inter font-bold text-sm text-black shrink-0 relative overflow-hidden"
          >
            <NuxtImg
              src="/img/main/founder.jpeg"
              alt="Avatar de Mohamed Chettah"
              width="44"
              height="44"
              class="rounded-md object-cover absolute inset-0 w-full h-full"
            />
          </div>
          <div class="flex flex-col">
            <span class="font-inter text-xs font-semibold text-[var(--text-primary)]">
              {{ t('partners.example.founder_name') }}
            </span>
            <span class="font-inter text-[11px] text-[var(--text-secondary)]">
              {{ t('partners.example.founder_role') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

