<script setup lang="ts">
import { computed, ref } from 'vue'

const { t, tm, rt } = useI18n()

const accordionItems = [
  { key: 'website', image: '/img/project/souji-nova-desktop.png' },
  { key: 'product_design', image: '/img/project/arises-figma.png' },
  { key: 'product', image: '/img/project/crm-ra/crm-hero-mockup.png' },
]

const offers = computed(() =>
  accordionItems.map((item) => ({
    ...item,
    title: t(`services.accordion.${item.key}.title`),
    description: t(`services.accordion.${item.key}.description`),
    items: Object.values(tm(`services.accordion.${item.key}.items`) as object || {}).map(i => rt(i)),
  }))
)

const openIndex = ref(0)

function toggleOffer(index: number) {
  openIndex.value = openIndex.value === index ? -1 : index
}
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

      <!-- Offers Accordion -->
      <div class="mb-8 md:mb-10">
        <div
          v-for="(offer, index) in offers"
          :key="offer.key"
          class="offer-row"
        >
          <!-- Row header -->
          <button
            type="button"
            class="offer-row-header group"
            :aria-expanded="openIndex === index"
            @click="toggleOffer(index)"
          >
            <span class="offer-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <h3 class="offer-row-title">
              {{ offer.title }}
            </h3>
            <span class="offer-toggle" :class="{ 'offer-toggle--open': openIndex === index }">
              <span class="offer-toggle-bar"></span>
              <span class="offer-toggle-bar offer-toggle-bar--vertical"></span>
            </span>
          </button>

          <!-- Expandable content -->
          <div class="offer-row-content" :class="{ 'offer-row-content--open': openIndex === index }">
            <div class="overflow-hidden">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 pb-10 md:pb-14 pt-2">
                <!-- Image -->
                <div class="offer-visual self-start">
                  <img
                    :src="offer.image"
                    :alt="offer.title"
                    class="w-full h-auto block"
                    loading="lazy"
                  >
                </div>

                <!-- Texte -->
                <div class="flex flex-col">
                  <p class="text-sm sm:text-[15px] leading-[1.8] mb-8 transition-colors duration-300 text-[var(--text-primary)]/90">
                    {{ offer.description }}
                  </p>

                  <!-- Inclus -->
                  <div>
                    <h4 class="offer-label">
                      {{ $t('services.common.included') }}
                    </h4>
                    <ul class="space-y-2.5">
                      <li v-for="item in offer.items" :key="item" class="flex items-start gap-2.5 text-[13px] sm:text-sm text-[var(--text-primary)]">
                        <UIcon name="i-heroicons-check-circle-solid" class="w-4 h-4 mt-[2px] flex-shrink-0 text-[#F0BF6C]" />
                        <span>{{ item }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ─── Accordion row ─── */
.offer-row {
  border-top: 1px solid var(--border-subtle);
}

.offer-row:last-child {
  border-bottom: 1px solid var(--border-subtle);
}

/* ─── Row header ─── */
.offer-row-header {
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 28px 0;
  cursor: pointer;
  text-align: left;
  background: none;
  border: none;
}

@media (min-width: 640px) {
  .offer-row-header {
    gap: 48px;
    padding: 36px 0;
  }
}

.offer-number {
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: rgba(240, 191, 108, 0.6);
  flex-shrink: 0;
  transition: color 0.3s ease;
}

@media (min-width: 640px) {
  .offer-number {
    font-size: 32px;
  }
}

.offer-row-title {
  font-family: 'Manrope', sans-serif;
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  transition: color 0.3s ease;
}

@media (min-width: 640px) {
  .offer-row-title {
    font-size: 38px;
  }
}

.offer-row-header:hover .offer-row-title {
  color: var(--color-gold-readable);
}

.offer-row-header:hover .offer-number {
  color: var(--color-gold-readable);
}

/* ─── Toggle (+/−) ─── */
.offer-toggle {
  position: relative;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.offer-toggle-bar {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  margin-top: -1px;
  background: var(--color-gold-readable);
  border-radius: 2px;
  transition: transform 0.3s ease;
}

.offer-toggle-bar--vertical {
  transform: rotate(90deg);
}

.offer-toggle--open .offer-toggle-bar--vertical {
  transform: rotate(0deg);
}

/* ─── Expandable content ─── */
.offer-row-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.offer-row-content--open {
  grid-template-rows: 1fr;
}

/* ─── Visual ─── */
.offer-visual {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  background: var(--bg-soft);
  box-shadow: var(--shadow-soft);
}

/* ─── Section labels ─── */
.offer-label {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-gold-readable);
  margin-bottom: 12px;
}

</style>
