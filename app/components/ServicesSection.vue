<script setup lang="ts">
import { computed } from 'vue';

const { t, tm, rt } = useI18n();

const offers = computed(() => [
  {
    key: 'entrepreneur',
    title: t('services.cards.entrepreneur.title'),
    description: t('services.cards.entrepreneur.description'),
    icon: 'i-heroicons-rocket-launch',
    forWho: Object.values(tm('services.cards.entrepreneur.for_who') as object || {}).map(i => rt(i)),
    idealIf: Object.values(tm('services.cards.entrepreneur.ideal_if') as object || {}).map(i => rt(i)),
    budget: t('services.cards.entrepreneur.budget'),
  },
  {
    key: 'creator',
    title: t('services.cards.creator.title'),
    description: t('services.cards.creator.description'),
    icon: 'i-heroicons-sparkles',
    forWho: Object.values(tm('services.cards.creator.for_who') as object || {}).map(i => rt(i)),
    idealIf: Object.values(tm('services.cards.creator.ideal_if') as object || {}).map(i => rt(i)),
    budget: t('services.cards.creator.budget'),
  },
  {
    key: 'enterprise',
    title: t('services.cards.enterprise.title'),
    description: t('services.cards.enterprise.description'),
    icon: 'i-heroicons-building-office-2',
    forWho: Object.values(tm('services.cards.enterprise.for_who') as object || {}).map(i => rt(i)),
    idealIf: Object.values(tm('services.cards.enterprise.ideal_if') as object || {}).map(i => rt(i)),
    budget: t('services.cards.enterprise.budget'),
  },
]);

const otherServices = computed(() => Object.values(tm('services.other_services.list') as object || {}).map(i => rt(i)));
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 md:mb-10 items-stretch">
        <div 
          v-for="offer in offers" 
          :key="offer.key"
          class="offer-card rounded-2xl overflow-hidden transition-all duration-300"
        >
          <div class="p-6 sm:p-7 h-full flex flex-col">
            <!-- Header: Title + Icon -->
            <div class="flex items-start justify-between mb-4">
              <h3 class="font-semibold text-xl sm:text-[22px] transition-colors duration-300 text-[var(--text-primary)]">
                {{ offer.title }}
              </h3>
              <div class="offer-icon-wrapper flex-shrink-0 ml-3">
                <UIcon :name="offer.icon" class="w-5 h-5 text-[#F0BF6C]" />
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm leading-relaxed mb-6 transition-colors duration-300 text-[var(--text-secondary)]">
              {{ offer.description }}
            </p>

            <!-- Pour qui -->
            <div class="mb-5">
              <h4 class="offer-label text-[11px] font-bold uppercase tracking-wider mb-3 text-[#F0BF6C]">
                {{ $t('services.common.for_who') }}
              </h4>
              <ul class="space-y-1.5">
                <li v-for="item in offer.forWho" :key="item" class="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span class="text-[#F0BF6C] mt-0.5 text-xs">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Idéal si -->
            <div class="mb-6">
              <h4 class="offer-label text-[11px] font-bold uppercase tracking-wider mb-3 text-[#F0BF6C]">
                {{ $t('services.common.ideal_if') }}
              </h4>
              <ul class="space-y-1.5">
                <li v-for="item in offer.idealIf" :key="item" class="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span class="text-[#F0BF6C] mt-0.5 text-xs">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Budget -->
            <div class="mt-auto pt-4">
              <h4 class="offer-label text-[11px] font-bold uppercase tracking-wider mb-1 text-[#F0BF6C]">
                {{ $t('services.common.budget') }}
              </h4>
              <p class="text-sm font-medium transition-colors duration-300 text-[var(--text-primary)]">
                {{ offer.budget }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Services -->
      <div class="p-6 sm:p-8 rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10">
        <div class="mb-5">
          <h4 class="font-manrope font-semibold text-lg mb-1 transition-colors duration-300 text-[var(--text-primary)]">{{ $t('services.other_services.title') }}</h4>
          <p class="text-sm transition-colors duration-300 text-[var(--text-secondary)]">{{ $t('services.other_services.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap gap-2 sm:gap-3">
          <span 
            v-for="svc in otherServices" 
            :key="svc"
            class="inline-flex items-center px-3 sm:px-4 py-2 bg-white text-black border rounded-lg text-xs sm:text-sm transition-colors cursor-default"
          >
            {{ svc }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.offer-card {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.offer-card:hover {
  border-color: rgba(240, 191, 108, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

.offer-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(240, 191, 108, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.offer-label {
  letter-spacing: 0.08em;
}
</style>
