<script setup lang="ts">
const { tm, rt } = useI18n();

const keywords = computed(() => Object.values(tm('services.marquee') as Record<string, any> || {}).map(i => rt(i)));
</script>

<template>
  <div class="relative overflow-hidden py-4 bg-[#F0BF6C] mx-auto w-full md:max-w-[calc(100%-146px)] rounded-xl">
    <div class="marquee flex gap-12 w-max">
      <span v-for="(word, index) in [...keywords, ...keywords, ...keywords, ...keywords]" :key="index" class="font-medium text-sm sm:text-base text-[#1a1a1a] whitespace-nowrap">
        {{ word }}
      </span>
    </div>

    <div class="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-[#F0BF6C] to-transparent pointer-events-none"></div>
    <div class="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-[#F0BF6C] to-transparent pointer-events-none"></div>
  </div>
</template>

<style scoped>
.marquee {
  animation: scroll 40s linear infinite;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.33%);
  }
}
</style>
