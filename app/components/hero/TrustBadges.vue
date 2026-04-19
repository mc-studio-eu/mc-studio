<script setup>
import { computed } from 'vue'

const { tm, rt } = useI18n()

// Get rotating stats from i18n
const rotatingStats = computed(() => {
  const stats = tm('hero.badges.rotating_stats')
  return Object.values(stats || {}).map(s => rt(s))
})

// Get locations from i18n
const locationNames = computed(() => {
  const locs = tm('hero.badges.location')
  return Object.values(locs || {}).map(l => rt(l))
})

// Get rotating services from i18n
const rotatingServices = computed(() => {
  const services = tm('hero.badges.rotating_services')
  return Object.values(services || {}).map(s => rt(s))
})

const locations = computed(() => [
  { city: locationNames.value[0] || 'Lyon', flag: 'france' }
])

const currentStat = computed(() => rotatingStats.value[0] || '')
const currentLocation = computed(() => locations.value[0])
const currentService = computed(() => rotatingServices.value[0] || '')
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-9 mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-2 sm:px-4 w-full max-w-[400px] sm:max-w-none">
    
    <!-- Badge 1: Stats -->
    <div class="badge-fixed flex items-center justify-center gap-1.5 sm:gap-2 h-7 sm:h-8 md:h-9 py-1 sm:py-1.5 px-2.5 sm:px-3 md:px-4 bg-white border border-[#f0bf6c] rounded-md sm:rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(240,191,108,0.2)]">
      <svg class="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <div class="text-container w-[120px] sm:w-[140px]">
        <span class="text-content font-medium text-[11px] sm:text-xs md:text-sm text-[#474747] whitespace-nowrap text-center">
          {{ currentStat }}
        </span>
      </div>
    </div>

    <!-- Badge 2: Services -->
    <div class="badge-fixed flex items-center justify-center gap-1.5 sm:gap-2 h-7 sm:h-8 md:h-9 py-1 sm:py-1.5 px-2.5 sm:px-3 md:px-4 bg-white border border-[#f0bf6c] rounded-md sm:rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(240,191,108,0.2)]">
      <svg class="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <div class="text-container w-[90px] sm:w-[100px]">
        <span class="text-content font-medium text-[11px] sm:text-xs md:text-sm text-[#474747] whitespace-nowrap text-center">
          {{ currentService }}
        </span>
      </div>
    </div>
    
    <!-- Badge 3: Location -->
    <div class="badge-fixed flex items-center justify-center h-7 sm:h-8 md:h-9 py-1 sm:py-1.5 px-2.5 sm:px-3 md:px-4 bg-white border border-[#f0bf6c] rounded-md sm:rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(240,191,108,0.2)]">
      <div class="text-container w-[75px] sm:w-[90px]">
        <div class="location-content">
          <!-- France Flag -->
          <div v-if="currentLocation.flag === 'france'" class="flex w-5 h-3 sm:w-6 sm:h-4 rounded-[2px] overflow-hidden shadow-sm shrink-0">
            <div class="w-1/3 bg-[#002395]"></div>
            <div class="w-1/3 bg-white border-y border-gray-200"></div>
            <div class="w-1/3 bg-[#ED2939]"></div>
          </div>
          <!-- City name -->
          <span class="font-medium text-[11px] sm:text-xs md:text-sm text-[#474747] whitespace-nowrap">
            {{ currentLocation.city }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-container {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 16px;
}

.text-content {
  display: block;
  width: 100%;
  text-align: center;
}

.location-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

@media (min-width: 640px) {
  .text-container {
    height: 18px;
  }
  .location-content {
    gap: 8px;
  }
}
</style>