<script setup lang="ts">
const { t } = useI18n()

const steps = [
  { key: '0', icon: 'i-lucide-phone-call' },
  { key: '1', icon: 'i-lucide-figma' },
  { key: '2', icon: 'i-lucide-code-2' },
  { key: '3', icon: 'i-lucide-rocket' }
]
</script>

<template>
  <section id="process" class="bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="mx-auto max-w-[1216px]">
      <div class="mx-auto mb-10 max-w-[640px] text-center md:mb-14">
        <h2
          class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] sm:text-3xl md:text-[32px]"
          v-html="t('crm_offer.process.title')"
        />
        <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          {{ t('crm_offer.process.subtitle') }}
        </p>
      </div>

      <ol class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(step, index) in steps"
          :key="step.key"
          class="relative flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[var(--card-shadow)]"
        >
          <!-- Connector between steps on large screens -->
          <span
            v-if="index < steps.length - 1"
            class="absolute right-[-10px] top-1/2 hidden h-px w-5 -translate-y-1/2 bg-[var(--border-color)] lg:block"
            aria-hidden="true"
          />

          <div class="flex items-center justify-between gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--accent-gold)]"
            >
              <UIcon :name="step.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="font-inter text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {{ t(`crm_offer.process.steps.${step.key}.day`) }}
            </span>
          </div>

          <h3 class="mt-5 font-manrope text-lg font-semibold text-[var(--text-primary)]">
            {{ t(`crm_offer.process.steps.${step.key}.title`) }}
          </h3>
          <p class="mt-2 font-inter text-sm leading-[1.7] text-[var(--text-secondary)]">
            {{ t(`crm_offer.process.steps.${step.key}.description`) }}
          </p>
        </li>
      </ol>

      <p class="mt-8 flex items-center justify-center gap-2 text-center font-inter text-xs text-[var(--text-secondary)]">
        <UIcon name="i-lucide-info" class="h-4 w-4 shrink-0 text-[var(--accent-gold)]" aria-hidden="true" />
        {{ t('crm_offer.process.note') }}
      </p>
    </div>
  </section>
</template>
