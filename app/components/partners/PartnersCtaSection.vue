<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const platformUrl = computed(() => String(config.public.partnerPlatformUrl || ''))
</script>

<template>
  <section
    id="rejoindre-programme"
    class="py-16 px-0 sm:px-4 bg-[var(--bg-primary)] transition-colors duration-300"
  >
    <div
      class="max-w-[1216px] mx-auto px-4 sm:px-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 overflow-hidden relative"
    >
      <div class="relative z-10 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-center p-6 sm:p-8">
        <div class="space-y-4">
          <p class="font-inter text-[11px] uppercase tracking-[0.16em] text-[var(--color-gold)]">
            {{ t('partners.cta.eyebrow') }}
          </p>
          <div class="space-y-4">
          <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-3 transition-colors duration-300 text-gradient">
            {{ t('partners.cta.title') }}
          </h2>
          <p
            class="font-inter text-sm sm:text-base max-w-xl leading-relaxed transition-colors duration-300 text-[var(--text-secondary)]"
            v-html="t('partners.cta.subtitle')"
          ></p>
        </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mt-6">
            <a
              :href="platformUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="cta-primary inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-inter text-sm font-medium text-[#0f0f0f] no-underline cursor-pointer hover:brightness-105 transition-all duration-200"
            >
              {{ t('partners.cta.primary') }}
            </a>
            <p class="font-inter text-xs text-[var(--text-secondary)] max-w-[260px]">
              {{ t('partners.cta.helper') }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div
            class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[var(--card-shadow)] backdrop-blur-xl px-4 py-4 flex items-center gap-3"
          >
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
                {{ t('partners.cta.card_title') }}
              </span>
              <span class="font-inter text-[11px] text-[var(--text-secondary)]">
                {{ t('partners.cta.card_text') }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-3">
              <p class="font-inter text-[11px] text-[var(--text-secondary)]">
                {{ t('partners.cta.commission_label') }}
              </p>
              <p class="font-manrope text-lg font-semibold text-[var(--color-gold)]">
                10&nbsp;%
              </p>
            </div>
            <div class="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-3">
              <p class="font-inter text-[11px] text-[var(--text-secondary)]">
                {{ t('partners.cta.tracking_label') }}
              </p>
              <p class="font-manrope text-lg font-semibold text-[var(--text-primary)]">
                {{ t('partners.cta.tracking_value') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      >
        <div class="absolute -top-16 -right-10 w-64 h-64 bg-[var(--color-gold)]/15 blur-3xl rounded-full"></div>
      </div>
    </div>
  </section>
</template>

