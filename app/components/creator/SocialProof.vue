<script setup lang="ts">
const { t } = useI18n()

// Figma renders every logo in a 48px-tall box; widths keep each glyph's own ratio.
const platforms = [
  { name: 'Instagram', src: '/assets/creator/social/instagram.png', width: 106 },
  { name: 'YouTube', src: '/assets/creator/social/youtube.png', width: 81 },
  { name: 'TikTok', src: '/assets/creator/social/tiktok.png', width: 84 },
  { name: 'X (Twitter)', src: '/assets/creator/social/twitter.png', width: 24 },
  { name: 'LinkedIn', src: '/assets/creator/social/linkedin.png', width: 83 }
]
</script>

<template>
  <div class="social-proof flex w-full flex-col items-center">
    <p class="m-0 max-w-[575px] text-center text-[clamp(13px,1.3vw,18px)] leading-[1.5] text-[var(--color-ink)]">
      {{ t('home.socialProof.tagline') }}
    </p>

    <ul
      class="m-0 mt-[18px] flex list-none flex-wrap items-center justify-center gap-x-[calc(48px_*_var(--logo-scale))] gap-y-4 p-0"
      :aria-label="t('home.socialProof.listLabel')"
    >
      <li v-for="platform in platforms" :key="platform.name" class="flex items-center">
        <img
          class="block object-contain"
          :src="platform.src"
          :alt="platform.name"
          :width="platform.width"
          :height="48"
          :style="{
            width: `calc(${platform.width}px * var(--logo-scale))`,
            height: `calc(48px * var(--logo-scale))`
          }"
          loading="lazy"
          decoding="async"
        >
      </li>
    </ul>
  </div>
</template>

<style scoped>
.social-proof {
  --logo-scale: 1;
}
@media (max-width: 1024px) {
  .social-proof {
    --logo-scale: 0.8;
  }
}
@media (max-width: 640px) {
  .social-proof {
    --logo-scale: 0.6;
  }
}
</style>
