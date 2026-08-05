<script setup lang="ts">
import Navbar from "../layouts/Navbar.vue"
import GoogleBadge from "./GoogleBadge.vue"
import HeroContent from "./HeroContent.vue"
import HeroButtons from "./HeroButtons.vue"
import TrustBadges from "./TrustBadges.vue"
import ScrollingMarquee from "./ScrollingMarquee.vue"

const colorMode = useColorMode()
</script>

<template>
  <section class="relative w-full rounded-lg overflow-hidden min-h-[calc(85svh-10px)] sm:min-h-[600px] md:min-h-[620px] lg:min-h-[643px]">
    <!-- Background: CSS ivory/gold wash in light mode, bronze raster in dark mode -->
    <div class="hero-backdrop absolute inset-0 rounded-lg"></div>
    <ClientOnly>
      <NuxtImg
        v-if="colorMode.value === 'dark'"
        src="/img/main/background.svg"
        alt="Hero background"
        format="svg"
        class="absolute inset-0 w-full h-full object-cover object-center rounded-lg"
      />
    </ClientOnly>
    
    <!-- Content Container -->
    <div class="relative z-10 flex flex-col items-center h-full px-4 sm:px-6 pb-0 sm:pb-16 md:pb-10">
      <Navbar />
      <GoogleBadge />
      <HeroContent />
      <HeroButtons />
      <TrustBadges />
    </div>

    <ScrollingMarquee />
  </section>
</template>
