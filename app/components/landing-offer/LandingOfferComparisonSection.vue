<script setup lang="ts">
const { t } = useI18n()

const rowKeys = ['0', '1', '2', '3', '4', '5', '6']
const otherColumns = ['agency', 'freelance'] as const
</script>

<template>
  <section class="bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="mx-auto max-w-[1216px]">
      <div class="mx-auto mb-10 max-w-[640px] text-center md:mb-14">
        <h2
          class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] sm:text-3xl md:text-[32px]"
          v-html="t('landing_offer.comparison.title')"
        />
        <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          {{ t('landing_offer.comparison.subtitle') }}
        </p>
      </div>

      <!-- Desktop: real table -->
      <div
        class="hidden overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--card-shadow)] md:block"
      >
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-[var(--border-subtle)]">
              <th
                class="w-[22%] px-6 py-5 font-inter text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
              >
                {{ t('landing_offer.comparison.columns.criteria') }}
              </th>
              <th
                v-for="column in otherColumns"
                :key="column"
                class="px-6 py-5 font-inter text-sm font-medium text-[var(--text-secondary)]"
              >
                {{ t(`landing_offer.comparison.columns.${column}`) }}
              </th>
              <th class="bg-[var(--bg-primary)] px-6 py-5">
                <span class="flex items-center gap-2 font-manrope text-base font-semibold text-[var(--text-primary)]">
                  <UIcon name="i-lucide-sparkles" class="h-4 w-4 text-[var(--accent-gold)]" aria-hidden="true" />
                  {{ t('landing_offer.comparison.columns.studio') }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="key in rowKeys"
              :key="key"
              class="border-b border-[var(--border-subtle)] last:border-b-0"
            >
              <th
                scope="row"
                class="px-6 py-4 font-inter text-sm font-medium text-[var(--text-primary)]"
              >
                {{ t(`landing_offer.comparison.rows.${key}.label`) }}
              </th>
              <td
                v-for="column in otherColumns"
                :key="column"
                class="px-6 py-4 font-inter text-sm text-[var(--text-secondary)]"
              >
                {{ t(`landing_offer.comparison.rows.${key}.${column}`) }}
              </td>
              <td class="bg-[var(--bg-primary)] px-6 py-4">
                <span class="flex items-start gap-2 font-inter text-sm font-medium text-[var(--text-primary)]">
                  <UIcon
                    name="i-lucide-check"
                    class="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]"
                    aria-hidden="true"
                  />
                  {{ t(`landing_offer.comparison.rows.${key}.studio`) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: stacked cards, one per criteria -->
      <div class="flex flex-col gap-4 md:hidden">
        <article
          v-for="key in rowKeys"
          :key="key"
          class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-[var(--card-shadow)]"
        >
          <h3 class="font-inter text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {{ t(`landing_offer.comparison.rows.${key}.label`) }}
          </h3>

          <dl class="mt-3 flex flex-col gap-2">
            <div v-for="column in otherColumns" :key="column" class="flex items-start justify-between gap-4">
              <dt class="font-inter text-xs text-[var(--text-muted)]">
                {{ t(`landing_offer.comparison.columns.${column}`) }}
              </dt>
              <dd class="text-right font-inter text-sm text-[var(--text-secondary)]">
                {{ t(`landing_offer.comparison.rows.${key}.${column}`) }}
              </dd>
            </div>

            <div
              class="mt-1 flex items-start justify-between gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2"
            >
              <dt class="font-inter text-xs font-semibold text-[var(--accent-gold)]">
                {{ t('landing_offer.comparison.columns.studio') }}
              </dt>
              <dd class="text-right font-inter text-sm font-medium text-[var(--text-primary)]">
                {{ t(`landing_offer.comparison.rows.${key}.studio`) }}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </div>
  </section>
</template>
