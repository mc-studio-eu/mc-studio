<script setup lang="ts">
const { t, tm, rt } = useI18n()

// A custom CRM has no fixed package price, so the deliverables live in this page's
// namespace instead of the shared `pricing.plans` list used by the fixed offers.
const features = computed(() =>
  Object.values((tm('crm_offer.pricing.features') as Record<string, unknown>) || {}).map((feature) =>
    rt(feature)
  )
)

const factors = [
  { key: '0', icon: 'i-lucide-layers' },
  { key: '1', icon: 'i-lucide-plug' },
  { key: '2', icon: 'i-lucide-users' },
  { key: '3', icon: 'i-lucide-database-backup' }
]

const alternatives = ['0', '1']
</script>

<template>
  <section id="tarif" class="relative overflow-hidden bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="gold-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />

    <div class="relative mx-auto max-w-[1216px]">
      <div class="mx-auto mb-10 max-w-[640px] text-center md:mb-14">
        <h2
          class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] sm:text-3xl md:text-[32px]"
          v-html="t('crm_offer.pricing.title')"
        />
        <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          {{ t('crm_offer.pricing.subtitle') }}
        </p>
      </div>

      <article
        class="mx-auto max-w-[900px] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[var(--card-shadow)]"
      >
        <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <!-- Deliverables -->
          <div class="order-2 border-t border-[var(--border-subtle)] p-7 md:order-1 md:border-r md:border-t-0 md:p-9">
            <p class="font-inter text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]">
              {{ t('pricing.included') }}
            </p>
            <ul class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <li
                v-for="feature in features"
                :key="feature"
                class="flex items-start gap-2.5 font-inter text-[13px] leading-[1.5] text-[var(--text-primary)]"
              >
                <span
                  class="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--accent-gold)]"
                >
                  <UIcon name="i-lucide-check" class="h-3 w-3" aria-hidden="true" />
                </span>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- Price + CTA -->
          <div class="order-1 flex flex-col justify-center bg-[var(--bg-primary)] p-7 md:order-2 md:p-9">
            <span
              class="w-fit rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1 font-inter text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--accent-gold)]"
            >
              {{ t('crm_offer.pricing.badge') }}
            </span>

            <h3 class="mt-5 font-manrope text-xl font-medium text-[var(--text-primary)]">
              {{ t('crm_offer.pricing.plan_title') }}
            </h3>

            <p class="mt-3 font-manrope text-[42px] font-medium leading-none tracking-[-0.04em] text-[var(--text-primary)]">
              {{ t('pricing.custom.price') }}
            </p>
            <p class="mt-2 font-inter text-xs text-[var(--text-muted)]">
              {{ t('crm_offer.pricing.price_note') }}
            </p>

            <p class="mt-4 font-inter text-sm leading-[1.65] text-[var(--text-secondary)]">
              {{ t('crm_offer.pricing.description') }}
            </p>

            <div
              class="mt-5 flex w-fit items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 py-1.5 font-inter text-xs text-[var(--text-secondary)]"
            >
              <UIcon name="i-lucide-clock-3" class="h-4 w-4 text-[var(--accent-gold)]" aria-hidden="true" />
              <span>{{ t('pricing.delay_label') }}</span>
              <strong class="font-bold text-[var(--text-primary)]">{{ t('crm_offer.pricing.delay_value') }}</strong>
            </div>

            <a
              href="#contact"
              class="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(to_right,#ffffff_50%,#f0bf6c)] px-4 font-inter text-sm font-semibold text-[#0f0f0f] no-underline shadow-[0_4px_4px_rgba(0,0,0,0.16),0_10px_10px_rgba(11,32,103,0.05)] transition-all duration-200 hover:brightness-105"
            >
              {{ t('crm_offer.pricing.cta') }}
              <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href="#contact"
              class="mt-3 text-center font-inter text-xs text-[var(--text-secondary)] underline-offset-4 transition-colors duration-200 hover:text-[var(--text-primary)]"
            >
              {{ t('crm_offer.pricing.secondary_cta') }}
            </a>
          </div>
        </div>
      </article>

      <!-- What moves the quote up or down -->
      <div class="mx-auto mt-10 max-w-[900px]">
        <p class="mb-4 text-center font-inter text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          {{ t('crm_offer.pricing.factors_title') }}
        </p>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article
            v-for="factor in factors"
            :key="factor.key"
            class="flex gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-[var(--card-shadow)]"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--accent-gold)]"
            >
              <UIcon :name="factor.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <div class="min-w-0">
              <h3 class="font-manrope text-base font-semibold text-[var(--text-primary)]">
                {{ t(`crm_offer.pricing.factors.${factor.key}.title`) }}
              </h3>
              <p class="mt-1.5 font-inter text-sm leading-[1.65] text-[var(--text-secondary)]">
                {{ t(`crm_offer.pricing.factors.${factor.key}.description`) }}
              </p>
            </div>
          </article>
        </div>
      </div>

      <!-- Other formats -->
      <div class="mx-auto mt-10 max-w-[900px]">
        <p class="mb-4 text-center font-inter text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          {{ t('crm_offer.pricing.alternatives_title') }}
        </p>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article
            v-for="key in alternatives"
            :key="key"
            class="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[var(--card-shadow)]"
          >
            <div class="flex items-baseline justify-between gap-4">
              <h3 class="font-manrope text-lg font-semibold text-[var(--text-primary)]">
                {{ t(`crm_offer.pricing.alternatives.${key}.title`) }}
              </h3>
              <span class="font-manrope text-lg font-medium text-[var(--accent-gold)]">
                {{ t(`crm_offer.pricing.alternatives.${key}.price`) }}
              </span>
            </div>
            <p class="mt-2 font-inter text-sm leading-[1.65] text-[var(--text-secondary)]">
              {{ t(`crm_offer.pricing.alternatives.${key}.description`) }}
            </p>
          </article>
        </div>
      </div>

      <p class="mt-8 flex items-center justify-center gap-2 text-center font-inter text-xs text-[var(--text-secondary)]">
        <UIcon name="i-lucide-shield-check" class="h-4 w-4 shrink-0 text-[var(--accent-gold)]" aria-hidden="true" />
        {{ t('crm_offer.pricing.note') }}
      </p>
    </div>
  </section>
</template>
