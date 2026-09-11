<script setup lang="ts">
import HeroContent from "./HeroContent.vue"
import HeroButtons from "./HeroButtons.vue"
import TrustBadges from "./TrustBadges.vue"
import ScrollingMarquee from "./ScrollingMarquee.vue"
</script>

<template>
  <section class="relative w-full rounded-lg overflow-hidden min-h-[calc(85svh-10px)] sm:min-h-[600px] md:min-h-[620px] lg:min-h-[643px]">
    <!-- Background Image -->
    <NuxtImg
      src="/img/main/business-hero-bg.png"
      alt=""
      aria-hidden="true"
      format="webp"
      preload
      class="absolute inset-0 w-full h-full object-cover object-center rounded-lg"
    />
    <div class="hero-vignette absolute inset-0 rounded-lg pointer-events-none" aria-hidden="true"></div>

    <!-- Content Container -->
    <div class="relative z-10 flex flex-col items-center h-full px-4 sm:px-6 pb-14 sm:pb-24 md:pb-20 lg:pb-24">
      <HeroContent />
      <HeroButtons />
      <TrustBadges />
    </div>

    <ScrollingMarquee />
  </section>
</template>

<style scoped>
.hero-vignette {
  background: linear-gradient(180deg, rgba(15, 15, 15, 0) 0%, rgba(15, 15, 15, 0) 60%, rgba(15, 15, 15, 0.7) 100%);
}
</style>
