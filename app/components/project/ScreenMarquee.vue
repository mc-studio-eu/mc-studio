<script setup lang="ts">

const props = defineProps<{
  reverse?: boolean
}>()

const screenProject = [
  '/img/project/mc-studio-creator/cover.png',
  '/img/project/amgprom.png',
  '/img/project/fontaines-vtc-dark.jpeg',
  '/img/project/logo-raenergy.png',
  '/img/project/ra-energy.jpeg',
  '/img/project/souji-nova.jpeg',
  '/img/project/mc-studio-creator/billboard-logo.png',
  '/img/project/arises-tablet.jpeg',
  '/img/project/ra-energy-v2.png',
  '/img/project/mc-studio-creator/sign-logo.png',
  '/img/project/souji-nova-desktop.png',
]
</script>

<template>

  <div class="w-full px-[1px] xl:px-[51px] overflow-hidden">
    <div class="marquee-container relative">
      <!-- Fade overlays -->
      <div class="fade-left"></div>
      <div class="fade-right"></div>
      
      <UMarquee pause-on-hover class="" :overlay="false" :reverse="props.reverse" :ui="{
          root: '[--duration:60s]'
        }">
        <div v-for="screen in screenProject" :key="screen">
          <div class="w-[300px] md:w-[480px] lg:w-[600px] h-[190px] md:h-[300px] lg:h-[375px] rounded-2xl overflow-hidden bg-[#1a1a1a] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10">
            <NuxtImg
                :src="screen"
                alt="Project Screen"
                width="700"
                height="400"
                class="shadow-lg w-full h-full rounded-xl object-cover"
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
