<script setup lang="ts">
const { t } = useI18n()

const items = [
  { key: '0', icon: 'i-lucide-workflow' },
  { key: '1', icon: 'i-lucide-database' },
  { key: '2', icon: 'i-lucide-timer-reset' },
  { key: '3', icon: 'i-lucide-smartphone' },
  { key: '4', icon: 'i-lucide-line-chart' }
]
</script>

<template>
  <section class="relative overflow-hidden bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="gold-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />

    <div class="relative mx-auto max-w-[1216px]">
      <div class="mx-auto mb-10 max-w-[660px] text-center md:mb-14">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1 font-inter text-[11px] uppercase tracking-[0.16em] text-[var(--accent-gold)]"
        >
          {{ t('crm_offer.benefits.label') }}
        </span>
        <h2
          class="section-title mt-5 font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] sm:text-3xl md:text-[32px]"
          v-html="t('crm_offer.benefits.title')"
        />
        <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          {{ t('crm_offer.benefits.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(item, index) in items"
          :key="item.key"
          class="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[var(--card-shadow)] transition-all duration-300 hover:border-[var(--border-color)]"
          :class="{ 'sm:col-span-2 lg:col-span-1': index === items.length - 1 }"
        >
          <span
            class="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--accent-gold)]"
          >
            <UIcon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
          </span>

          <h3 class="mt-5 font-manrope text-lg font-semibold text-[var(--text-primary)]">
            {{ t(`crm_offer.benefits.items.${item.key}.title`) }}
          </h3>
          <p class="mt-2 font-inter text-sm leading-[1.7] text-[var(--text-secondary)]">
            {{ t(`crm_offer.benefits.items.${item.key}.description`) }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
