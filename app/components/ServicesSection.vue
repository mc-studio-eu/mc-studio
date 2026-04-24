<script setup lang="ts">
import { computed } from 'vue'
import { offers as offerData } from '../data/offers'

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

const offers = computed(() =>
  offerData.map((offer) => ({
    ...offer,
    title: t(`services.cards.${offer.key}.title`),
    description: t(`services.cards.${offer.key}.description`),
    forWho: Object.values(tm(`services.cards.${offer.key}.for_who`) as object || {}).map(i => rt(i)),
    idealIf: Object.values(tm(`services.cards.${offer.key}.ideal_if`) as object || {}).map(i => rt(i)),
  }))
)

const otherServices = computed(() => Object.values(tm('services.other_services.list') as object || {}).map(i => rt(i)))
const isSingleOffer = computed(() => offers.value.length === 1)
</script>

<template>
  <section id="services" class="py-5 md:py-10 lg:py-12 px-6 transition-colors duration-300 bg-[var(--bg-primary)]">
    <div class="max-w-[1216px] mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 md:mb-16">
        <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-3 transition-colors duration-300 text-[var(--text-primary)]" v-html="$t('services.title')">
        </h2>
        <p class="text-sm sm:text-base max-w-xl mx-auto leading-relaxed transition-colors duration-300 text-[var(--text-secondary)]" v-html="$t('services.subtitle')">
        </p>
      </div>

      <!-- Offer Cards Grid -->
      <div
        class="grid grid-cols-1 gap-6 lg:gap-5 mb-8 md:mb-10 items-stretch"
        :class="isSingleOffer ? 'max-w-[820px] mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'"
      >
        <NuxtLink
          v-for="offer in offers" 
          :key="offer.key"
          :to="localePath(`/services/${offer.slug}`)"
          class="offer-card group relative rounded-2xl overflow-hidden flex flex-col no-underline"
          :class="{ 'offer-card--featured': offer.featured }"
        >
          <div class="p-6 sm:p-7 h-full flex flex-col">
            <!-- Header: Icon + Title -->
            <div class="flex items-center gap-3.5 mb-4">
              <div class="offer-icon-wrapper" :class="{ 'offer-icon-wrapper--featured': offer.featured }">
                <UIcon :name="offer.icon" class="w-5 h-5" :class="offer.featured ? 'text-[#0f0f0f]' : 'text-[#F0BF6C]'" />
              </div>
              <h3 class="font-manrope font-semibold text-xl sm:text-[22px] transition-colors duration-300 text-[var(--text-primary)] group-hover:text-white">
                {{ offer.title }}
              </h3>
            </div>

            <!-- Description -->
            <p class="text-[13px] leading-[1.7] mb-6 transition-colors duration-300 text-[var(--text-primary)]/90">
              {{ offer.description }}
            </p>

            <!-- Divider -->
            <div class="offer-divider mb-5"></div>

            <!-- Pour qui -->
            <div class="mb-5">
              <h4 class="offer-label">
                {{ $t('services.common.for_who') }}
              </h4>
              <ul class="space-y-2">
                <li v-for="item in offer.forWho" :key="item" class="flex items-start gap-2.5 text-[13px] text-[var(--text-primary)]">
                  <span class="offer-bullet mt-[3px]">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Idéal si -->
            <div class="mb-6">
              <h4 class="offer-label">
                {{ $t('services.common.ideal_if') }}
              </h4>
              <ul class="space-y-2.5">
                <li v-for="item in offer.idealIf" :key="item" class="flex items-start gap-2.5 text-[13px] text-[var(--text-primary)]">
                  <UIcon name="i-heroicons-check-circle-solid" class="w-4 h-4 mt-[1px] flex-shrink-0" :class="offer.featured ? 'text-[#F0BF6C]' : 'text-[#F0BF6C]/60'" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div class="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-[var(--color-gold)]">
              <span>{{ $t('services.common.details') }}</span>
              <UIcon name="i-heroicons-arrow-right-20-solid" class="h-4 w-4" />
            </div>

          </div>
        </NuxtLink>
      </div>

      <!-- Other Services -->
      <div class="other-services-card p-6 sm:p-8 rounded-2xl overflow-hidden">
        <div class="mb-5">
          <h4 class="font-manrope font-semibold text-lg mb-1 transition-colors duration-300 text-[var(--text-primary)]">{{ $t('services.other_services.title') }}</h4>
          <p class="text-sm transition-colors duration-300 text-[var(--text-secondary)]">{{ $t('services.other_services.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap gap-2 sm:gap-2.5">
          <span 
            v-for="svc in otherServices" 
            :key="svc"
            class="other-service-tag"
          >
            {{ svc }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ─── Card base ─── */
.offer-card {
  background: #161616;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

/* ─── Featured card ─── */
.offer-card--featured {
  background: linear-gradient(180deg, #1c1a15 0%, #161616 100%);
  border-color: rgba(240, 191, 108, 0.24);
  box-shadow:
    0 0 0 1px rgba(240, 191, 108, 0.08),
    0 20px 50px -10px rgba(240, 191, 108, 0.06);
}

/* ─── Icon wrapper ─── */
.offer-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(240, 191, 108, 0.08);
  border: 1px solid rgba(240, 191, 108, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.offer-icon-wrapper--featured {
  background: linear-gradient(135deg, #F0BF6C 0%, #e0a84d 100%);
  border-color: transparent;
}

/* ─── Section labels ─── */
.offer-label {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(240, 191, 108, 0.7);
  margin-bottom: 10px;
}

/* ─── Divider ─── */
.offer-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%);
}

.offer-card--featured .offer-divider {
  background: linear-gradient(90deg, rgba(240, 191, 108, 0.15) 0%, rgba(240, 191, 108, 0.03) 100%);
}

.offer-card--featured .offer-label {
  color: #F0BF6C;
}

/* ─── Bullet ─── */
.offer-bullet {
  color: rgba(240, 191, 108, 0.45);
  font-size: 14px;
  line-height: 1;
}

.offer-card--featured .offer-bullet {
  color: rgba(240, 191, 108, 0.7);
}


/* ─── Other services ─── */
.other-services-card {
  background: #161616;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.other-service-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: default;
  transition: border-color 0.2s ease, color 0.2s ease;
}
</style>
