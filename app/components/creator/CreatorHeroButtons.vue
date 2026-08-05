<script setup>
import { ref } from 'vue'

const { t } = useI18n()

const primaryBtn = ref(null)
const primaryWrapper1 = ref(null)
const primaryWrapper2 = ref(null)
const secondaryBtn = ref(null)
const secondaryWrapper = ref(null)

useTextSlideAnimation(primaryBtn, [primaryWrapper1, primaryWrapper2])
useTextSlideAnimation(secondaryBtn, secondaryWrapper)
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-12 mt-6 sm:mt-7 md:mt-8 lg:mt-9 w-full px-4 sm:px-0">
    <!-- Primary CTA -->
    <a ref="primaryBtn" href="#contact" class="cta-primary gap-2 flex items-center justify-center px-3 py-2 rounded-lg font-medium text-[15px] sm:text-sm md:text-[15px]
    lg:text-base text-[#0f0f0f] cursor-pointer backdrop-blur-md transition-all
    duration-200 no-underline">
     <NuxtImg src="/img/main/founder.jpeg" alt="MC Studio" class="w-6 h-6 md:w-8 md:h-8 object-contain rounded-lg flex items-center justify-center font-inter font-semibold text-[10px] text-[#0f0f0f]" />
      <div class="flex flex-col items-start gap-px">
        <span class="text-slide-container h-[18px]">
          <span ref="primaryWrapper1" class="text-slide-wrapper">
            <span class="text-slide-text h-[18px] leading-[18px] font-inter text-sm font-semibold">{{ t('hero.cta.book') }}</span>
            <span class="text-slide-text h-[18px] leading-[18px] font-inter text-sm font-semibold">{{ t('hero.cta.book') }}</span>
          </span>
        </span>
        <span class="text-slide-container h-[12px]">
          <span ref="primaryWrapper2" class="text-slide-wrapper">
            <span class="text-slide-text h-[12px] leading-[12px] font-inter font-normal text-[9px]">{{ t('nav.free_call') }}</span>
            <span class="text-slide-text h-[12px] leading-[12px] font-inter font-normal text-[9px]">{{ t('nav.free_call') }}</span>
          </span>
        </span>
      </div>
    </a>
    
    <!-- Secondary CTA -->
    <a 
      ref="secondaryBtn"
      href="https://api.whatsapp.com/send/?phone=%2B33781724683&text&type=phone_number&app_absent=0" 
      target="_blank" 
      class="secondary-btn group flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] cursor-pointer transition-all duration-300 no-underline hover:brightness-95"
    >
      <span class="text-slide-container h-[20px]">
        <span ref="secondaryWrapper" class="text-slide-wrapper">
          <span class="text-slide-text h-[20px] leading-[20px]">{{ t('hero.cta.whatsapp') }}</span>
          <span class="text-slide-text h-[20px] leading-[20px]">{{ t('hero.cta.whatsapp') }}</span>
        </span>
      </span>
    </a>
  </div>
</template>

<style scoped>
.text-slide-container {
  display: block;
  position: relative;
  overflow: hidden;
}

.text-slide-wrapper {
  display: flex;
  flex-direction: column;
}

.text-slide-text {
  display: block;
}
</style>
