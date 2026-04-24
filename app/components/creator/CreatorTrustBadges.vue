<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import gsap from 'gsap'

const { t, tm, rt } = useI18n()

const rotatingStats = computed(() => {
  const stats = tm('hero.badges.rotating_stats')
  return Object.values(stats || {}).map(s => rt(s))
})

const locationNames = computed(() => {
  const locs = tm('hero.badges.location')
  return Object.values(locs || {}).map(l => rt(l))
})

const rotatingServices = computed(() => {
  const services = tm('hero.badges.rotating_services')
  return Object.values(services || {}).map(s => rt(s))
})

const statsIndex = ref(0)
const proofIndex = ref(0)
const servicesIndex = ref(0)
const statsWrapper = ref(null)
const proofWrapper = ref(null)
const servicesWrapper = ref(null)

const currentStat = computed(() => rotatingStats.value[statsIndex.value] || '')
const currentService = computed(() => rotatingServices.value[servicesIndex.value] || '')
const currentProof = computed(() => locationNames.value[proofIndex.value] || '')

let mainInterval = null

const animateAll = () => {
  const wrappers = [statsWrapper.value, servicesWrapper.value, proofWrapper.value].filter(Boolean)
  
  gsap.to(wrappers, {
    yPercent: -100,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
    stagger: 0,
    onComplete: () => {
      statsIndex.value = (statsIndex.value + 1) % rotatingStats.value.length
      servicesIndex.value = (servicesIndex.value + 1) % rotatingServices.value.length
      proofIndex.value = (proofIndex.value + 1) % locationNames.value.length
      
      gsap.set(wrappers, { yPercent: 100 })
      
      gsap.to(wrappers, {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        stagger: 0
      })
    }
  })
}

onMounted(() => {
  mainInterval = setInterval(animateAll, 2500)
})

onUnmounted(() => {
  if (mainInterval) clearInterval(mainInterval)
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-9 mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-2 sm:px-4 w-full max-w-[400px] sm:max-w-none">
    
    <!-- Badge 1: Rotating Stats -->
    <div class="badge-fixed flex items-center justify-center gap-1.5 sm:gap-2 h-7 sm:h-8 md:h-9 py-1 sm:py-1.5 px-2.5 sm:px-3 md:px-4 bg-white border border-[#f0bf6c] rounded-md sm:rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(240,191,108,0.2)]">
      <svg class="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <div class="text-container w-[145px] sm:w-[170px]">
        <span ref="statsWrapper" class="text-content font-medium text-[11px] sm:text-xs md:text-sm text-[#474747] whitespace-nowrap text-center">
          {{ currentStat }}
        </span>
      </div>
    </div>

    <!-- Badge 2: Rotating Services -->
    <div class="badge-fixed flex items-center justify-center gap-1.5 sm:gap-2 h-7 sm:h-8 md:h-9 py-1 sm:py-1.5 px-2.5 sm:px-3 md:px-4 bg-white border border-[#f0bf6c] rounded-md sm:rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(240,191,108,0.2)]">
      <svg class="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <div class="text-container w-[140px] sm:w-[165px]">
        <span ref="servicesWrapper" class="text-content font-medium text-[11px] sm:text-xs md:text-sm text-[#474747] whitespace-nowrap text-center">
          {{ currentService }}
        </span>
      </div>
    </div>
    
    <!-- Badge 3: Proof -->
    <div class="badge-fixed flex items-center justify-center gap-1.5 sm:gap-2 h-7 sm:h-8 md:h-9 py-1 sm:py-1.5 px-2.5 sm:px-3 md:px-4 bg-white border border-[#f0bf6c] rounded-md sm:rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(240,191,108,0.2)]">
      <svg class="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <div class="text-container w-[145px] sm:w-[170px]">
        <span ref="proofWrapper" class="text-content font-medium text-[11px] sm:text-xs md:text-sm text-[#474747] whitespace-nowrap text-center">
          {{ currentProof }}
        </span>
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

@media (min-width: 640px) {
  .text-container {
    height: 18px;
  }
}
</style>
