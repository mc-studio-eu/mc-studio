<script setup lang="ts">

const defaultScreens = [
  '/img/project/alertes-infos.png',
  '/img/project/arises-saas.png',
  '/img/project/hero-raenergy.png',
  '/img/project/how-it-work-ra.png',
  '/img/project/logo-raenergy.png',
  '/img/project/souji-nova-section.png',
  '/img/project/arises-login.png',
  '/img/project/arises-before-after.png',
]

// Offer pages pass their own set so the marquee shows work matching the offer.
// The default lives in the fallback rather than in `withDefaults`, which cannot
// reference a variable declared inside `<script setup>`.
const props = defineProps<{ screens?: string[] }>()

const screenProject = computed(() => props.screens ?? defaultScreens)
</script>

<template>

  <div class="w-full px-[1px] xl:px-[51px] overflow-hidden">
    <div class="marquee-container relative">
      <!-- Fade overlays -->
      <div class="fade-left"></div>
      <div class="fade-right"></div>
      
      <UMarquee pause-on-hover class="" :overlay="false" :ui="{
          root: '[--duration:40s]'
        }">
        <div v-for="screen in screenProject">
          <div class="w-[300px] md:w-[480px] lg:w-[600px] h-[190px] md:h-[300px] lg:h-[375px] rounded-2xl overflow-hidden bg-[#1a1a1a] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10">
            <NuxtImg
                :src="screen"
                alt="Project Screen"
                width="700"
                height="400"
                class="shadow-lg w-full h-full rounded-xl"
                :lazy="true"
            />
          </div>
        </div>
      </UMarquee>
    </div>
  </div>


</template>

<style scoped>
.marquee-container {
  position: relative;
}

.fade-left,
.fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  z-index: 5;
  pointer-events: none;
}

.fade-left {
  left: 0;
  background: linear-gradient(to right, var(--bg-primary) 0%, transparent 30%);
}

.fade-right {
  right: 0;
  background: linear-gradient(to left, var(--bg-primary) 0%, transparent 30%);
}

@media (min-width: 768px) {
  .fade-left,
  .fade-right {
    width: 60px;
  }
}
</style>