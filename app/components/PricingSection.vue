<script setup lang="ts">
import { computed } from 'vue'

const { t, tm, rt } = useI18n()

const planKeys = ['landing', 'showcase'] as const

const plans = computed(() =>
  planKeys.map((key) => ({
    key,
    title: t(`pricing.plans.${key}.title`),
    price: t(`pricing.plans.${key}.price`),
    description: t(`pricing.plans.${key}.description`),
    delay: t(`pricing.plans.${key}.delay`),
    cta: t(`pricing.plans.${key}.cta`),
    featured: key === 'landing',
    features: Object.values(
      (tm(`pricing.plans.${key}.features`) as Record<string, unknown>) || {}
    ).map((feature) => rt(feature)),
  }))
)

const customServices = computed(() =>
  Object.values(
    (tm('pricing.custom.services') as Record<string, unknown>) || {}
  ).map((service) => rt(service))
)
</script>

<template>
  <section
    id="tarifs"
    class="pricing-section bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20"
    :aria-label="$t('pricing.aria_label')"
  >
    <div class="mx-auto max-w-[1216px]">
      <div class="pricing-heading">
        <h2
          class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] transition-colors duration-300 sm:text-3xl md:text-[32px]"
          v-html="$t('pricing.title')"
        />
        <p class="pricing-subtitle">
          {{ $t('pricing.subtitle') }}
        </p>
      </div>

      <div class="pricing-grid">
        <article
          v-for="plan in plans"
          :key="plan.key"
          class="pricing-card"
          :class="{ 'pricing-card--featured': plan.featured }"
        >
          <div class="pricing-card__content">
            <div>
              <div class="pricing-card__header">
                <h3 class="pricing-card__title">{{ plan.title }}</h3>
                <span v-if="plan.featured" class="pricing-popular">
                  {{ $t('pricing.popular') }}
                </span>
              </div>
              <div class="pricing-card__price-row">
                <span class="pricing-card__price">{{ plan.price }}</span>
              </div>
              <p class="pricing-card__description">{{ plan.description }}</p>
              <div class="pricing-card__delivery">
                <UIcon name="i-lucide-clock-3" class="h-4 w-4" aria-hidden="true" />
                <span>{{ $t('pricing.delay_label') }}</span>
                <strong>{{ plan.delay }}</strong>
              </div>
            </div>

            <a
              href="#contact"
              class="pricing-card__cta"
              :class="{ 'pricing-card__cta--featured': plan.featured }"
            >
              <span class="pricing-cta__text-container">
                <span class="pricing-cta__text-wrapper">
                  <span class="pricing-cta__text">{{ plan.cta }}</span>
                  <span class="pricing-cta__text" aria-hidden="true">{{ plan.cta }}</span>
                </span>
              </span>
              <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" aria-hidden="true" />
            </a>

            <div class="pricing-card__divider" />

            <p class="pricing-card__included">{{ $t('pricing.included') }}</p>
            <ul class="pricing-card__features">
              <li v-for="feature in plan.features" :key="feature">
                <span class="pricing-card__check">
                  <UIcon name="i-lucide-check" class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </article>

        <article class="pricing-card">
          <div class="pricing-card__content">
            <div>
              <div class="pricing-card__header">
                <h3 class="pricing-card__title">{{ $t('pricing.custom.title') }}</h3>
              </div>
              <div class="pricing-card__price-row">
                <span class="pricing-card__price">{{ $t('pricing.custom.price') }}</span>
              </div>
              <p class="pricing-card__description">{{ $t('pricing.custom.description') }}</p>
              <div class="pricing-card__delivery">
                <UIcon name="i-lucide-layers-3" class="h-4 w-4" aria-hidden="true" />
                <span>{{ $t('pricing.custom.scope_label') }}</span>
              </div>
            </div>

            <a href="#contact" class="pricing-card__cta">
              <span class="pricing-cta__text-container">
                <span class="pricing-cta__text-wrapper">
                  <span class="pricing-cta__text">{{ $t('pricing.custom.cta') }}</span>
                  <span class="pricing-cta__text" aria-hidden="true">{{ $t('pricing.custom.cta') }}</span>
                </span>
              </span>
              <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" aria-hidden="true" />
            </a>

            <div class="pricing-card__divider" />

            <p class="pricing-card__included">{{ $t('pricing.included') }}</p>
            <ul class="pricing-card__features">
              <li v-for="service in customServices" :key="service">
                <span class="pricing-card__check">
                  <UIcon name="i-lucide-check" class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{{ service }}</span>
              </li>
            </ul>
          </div>
        </article>
      </div>

      <div class="pricing-note">
        <UIcon name="i-lucide-shield-check" class="h-4 w-4" aria-hidden="true" />
        <span>{{ $t('pricing.note') }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-heading {
  max-width: 640px;
  margin: 0 auto 48px;
  text-align: center;
}

.pricing-subtitle {
  max-width: 620px;
  margin: 18px auto 0;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.7;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 16px;
}

.pricing-card {
  position: relative;
  overflow: hidden;
  min-width: 0;
  border: 1px solid var(--border-subtle);
  border-radius: 28px;
  background:
    radial-gradient(700px 220px at 18% 0%, rgba(240, 191, 108, 0.07), transparent 54%),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04), transparent 34%),
    color-mix(in srgb, var(--bg-secondary) 72%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 30px rgba(0, 0, 0, 0.24);
}

.pricing-card--featured {
  border-color: var(--border-subtle);
  background:
    radial-gradient(700px 250px at 50% 0%, rgba(240, 191, 108, 0.11), transparent 54%),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent 36%),
    color-mix(in srgb, var(--bg-secondary) 76%, transparent);
}

.pricing-popular {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 9px;
  border: 1px solid rgba(240, 191, 108, 0.22);
  border-radius: 999px;
  background: rgba(240, 191, 108, 0.09);
  color: #f0bf6c;
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.pricing-card__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 30px;
}

.pricing-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pricing-card__title {
  color: var(--text-primary);
  font-family: 'Manrope', sans-serif;
  font-size: 19px;
  font-weight: 500;
}

.pricing-card__price-row {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 54px;
  margin-top: 20px;
}

.pricing-card__price {
  color: var(--text-primary);
  font-family: 'Manrope', sans-serif;
  font-size: clamp(34px, 3vw, 42px);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.04em;
}

.pricing-card__description {
  min-height: 72px;
  margin-top: 18px;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.65;
}

.pricing-card__delivery {
  display: flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  margin-top: 18px;
  padding: 7px 10px;
  border: 1px solid color-mix(in srgb, var(--border-subtle) 80%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg-primary) 58%, transparent);
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
}

.pricing-card__delivery :deep(svg) {
  color: #f0bf6c;
}

.pricing-card__delivery strong {
  color: var(--text-primary);
  font-weight: 700;
}

.pricing-card__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 42px;
  margin-top: 26px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, #ffffff 50%, #f0bf6c);
  color: #0f0f0f;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  box-shadow:
    0 4px 4px rgba(0, 0, 0, 0.2),
    0 10px 10px rgba(11, 32, 103, 0.05);
  transition: filter 0.2s ease;
}

.pricing-card__cta:hover {
  filter: brightness(1.05);
}

.pricing-cta__text-container {
  display: block;
  height: 20px;
  overflow: hidden;
}

.pricing-cta__text-wrapper {
  display: flex;
  flex-direction: column;
  transition: transform 0.35s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.pricing-cta__text {
  display: block;
  height: 20px;
  line-height: 20px;
  white-space: nowrap;
}

.pricing-card__cta:hover .pricing-cta__text-wrapper {
  transform: translateY(-50%);
}

.pricing-card__cta--featured {
  background: linear-gradient(to right, #ffffff 50%, #f0bf6c);
}

.pricing-card__cta--featured:hover {
  filter: brightness(1.05);
}

.pricing-card__divider {
  width: 100%;
  height: 1px;
  margin: 30px 0 24px;
  background: var(--border-subtle);
}

.pricing-card__included {
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.pricing-card__features {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-top: 18px;
}

.pricing-card__features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.5;
}

.pricing-card__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-primary) 58%, transparent);
  border: 1px solid rgba(240, 191, 108, 0.16);
  color: #f0bf6c;
}

.pricing-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 26px;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 900px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 620px;
    margin: 0 auto;
  }

  .pricing-card__description {
    min-height: 0;
  }

}

@media (max-width: 640px) {
  .pricing-heading {
    margin-bottom: 36px;
  }

  .pricing-card__content {
    padding: 26px 22px 28px;
  }

  .pricing-card__price {
    font-size: 38px;
  }

}
</style>
