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
  <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-9 md:gap-x-12 lg:gap-x-16 mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-2 sm:px-4 w-full">
    <!-- Stat -->
    <div class="flex items-center justify-center gap-2 text-white/80">
      <svg class="shrink-0 w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span class="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">
        {{ currentStat }}
      </span>
    </div>

    <!-- Service -->
    <div class="flex items-center justify-center gap-2 text-white/80">
      <svg class="shrink-0 w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span class="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">
        {{ currentService }}
      </span>
    </div>

    <!-- Location -->
    <div class="flex items-center justify-center gap-2 text-white/80">
      <svg class="shrink-0 w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/>
        <circle cx="12" cy="10" r="2.5"/>
      </svg>
      <span class="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">
        {{ currentLocation.city }}
      </span>
    </div>
  </div>
</template>
