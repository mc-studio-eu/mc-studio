<script setup lang="ts">
import { computed } from 'vue'

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const offerKeys = ['branding', 'website', 'applications'] as const

const offers = computed(() =>
  offerKeys.map((key) => ({
    key,
    title: t(`offers.items.${key}.title`),
    description: t(`offers.items.${key}.description`),
    cta: t(`offers.items.${key}.cta`),
    features: Object.values(
      (tm(`offers.items.${key}.features`) as Record<string, unknown>) || {}
    ).map((feature) => rt(feature)),
  }))
)
</script>

<template>
  <section
    id="offres"
    class="offers-section bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20"
    :aria-label="$t('offers.aria_label')"
  >
    <div class="mx-auto max-w-[1216px]">
      <div class="offers-heading">
        <h2
          class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] transition-colors duration-300 sm:text-3xl md:text-[32px]"
          v-html="$t('offers.title')"
        />
        <p class="offers-subtitle">{{ $t('offers.subtitle') }}</p>
      </div>

      <div class="offers-grid">
        <article
          v-for="offer in offers"
          :key="offer.key"
          class="offers-card"
          :class="{ 'offers-card--featured': offer.key === 'branding' }"
        >
          <div class="offers-card__content">
            <div>
              <div class="offers-card__header">
                <h3 class="offers-card__title">{{ offer.title }}</h3>
              </div>
              <p class="offers-card__description">{{ offer.description }}</p>
            </div>

            <NuxtLink :to="localePath('/contact')" class="offers-card__cta">
              <span class="offers-cta__text-container">
                <span class="offers-cta__text-wrapper">
                  <span class="offers-cta__text">{{ offer.cta }}</span>
                  <span class="offers-cta__text" aria-hidden="true">{{ offer.cta }}</span>
                </span>
              </span>
              <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" aria-hidden="true" />
            </NuxtLink>

            <div class="offers-card__divider" />

            <p class="offers-card__included">{{ $t('offers.included') }}</p>
            <ul class="offers-card__features">
              <li v-for="feature in offer.features" :key="feature">
                <span class="offers-card__check">
                  <UIcon name="i-lucide-check" class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.offers-heading {
  max-width: 640px;
  margin: 0 auto 48px;
  text-align: center;
}

.offers-subtitle {
  max-width: 620px;
  margin: 18px auto 0;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.7;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 16px;
}

.offers-card {
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

.offers-card--featured {
  border-color: var(--border-subtle);
  background:
    radial-gradient(700px 250px at 50% 0%, rgba(240, 191, 108, 0.11), transparent 54%),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent 36%),
    color-mix(in srgb, var(--bg-secondary) 76%, transparent);
}

.offers-card__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 30px;
}

.offers-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.offers-card__title {
  color: var(--text-primary);
  font-family: 'Manrope', sans-serif;
  font-size: 19px;
  font-weight: 500;
}

.offers-card__description {
  min-height: 96px;
  margin-top: 18px;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.65;
}

.offers-card__cta {
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

.offers-card__cta:hover {
  filter: brightness(1.05);
}

.offers-cta__text-container {
  display: block;
  height: 20px;
  overflow: hidden;
}

.offers-cta__text-wrapper {
  display: flex;
  flex-direction: column;
  transition: transform 0.35s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.offers-cta__text {
  display: block;
  height: 20px;
  line-height: 20px;
  white-space: nowrap;
}

.offers-card__cta:hover .offers-cta__text-wrapper {
  transform: translateY(-50%);
}

.offers-card__divider {
  width: 100%;
  height: 1px;
  margin: 30px 0 24px;
  background: var(--border-subtle);
}

.offers-card__included {
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.offers-card__features {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-top: 18px;
}

.offers-card__features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.5;
}

.offers-card__check {
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

@media (max-width: 900px) {
  .offers-grid {
    grid-template-columns: 1fr;
    max-width: 620px;
    margin: 0 auto;
  }

  .offers-card__description {
    min-height: 0;
  }

}

@media (max-width: 640px) {
  .offers-heading {
    margin-bottom: 36px;
  }

  .offers-card__content {
    padding: 26px 22px 28px;
  }


}
</style>
