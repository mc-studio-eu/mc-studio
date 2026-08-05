<script setup lang="ts">
const { t } = useI18n()

const items = [
  { key: '0', icon: 'i-lucide-help-circle' },
  { key: '1', icon: 'i-lucide-route-off' },
  { key: '2', icon: 'i-lucide-shield-alert' },
  { key: '3', icon: 'i-lucide-chart-no-axes-column' }
]
</script>

<template>
  <section id="pourquoi" class="bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="mx-auto max-w-[1216px]">
      <div class="mx-auto mb-10 max-w-[640px] text-center md:mb-14">
        <h2
          class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] sm:text-3xl md:text-[32px]"
          v-html="t('landing_offer.problem.title')"
        />
        <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          {{ t('landing_offer.problem.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article
          v-for="item in items"
          :key="item.key"
          class="flex gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[var(--card-shadow)] transition-colors duration-300"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--accent-gold)]"
          >
            <UIcon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
          </span>

          <div class="min-w-0">
            <h3 class="font-manrope text-lg font-semibold text-[var(--text-primary)]">
              {{ t(`landing_offer.problem.items.${item.key}.title`) }}
            </h3>
            <p class="mt-2 font-inter text-sm leading-[1.7] text-[var(--text-secondary)]">
              {{ t(`landing_offer.problem.items.${item.key}.description`) }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
