<script setup lang="ts">
const { tm, rt } = useI18n();
const keywords = computed(() => Object.values(tm('hero.marquee') as Record<string, any> || {}).map(i => rt(i)));
</script>

<template>
  <div class="absolute bottom-0 left-0 right-0 overflow-hidden py-2.5 z-0">
    <div class="marquee flex gap-8 w-max">
      <span v-for="(word, index) in [...keywords, ...keywords]" :key="index" class="font-medium text-sm sm:text-base text-white whitespace-nowrap">
        {{ word }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  animation: scroll 30s linear infinite;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>

