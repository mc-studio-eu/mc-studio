<script setup lang="ts">
const { t } = useI18n()

const reviews = computed(() => [
  { name: 'Nouri Yahi', avatar: '/img/testimonials/nouri-shika-consulting.png', quote: t('testimonials.items.shika_consulting.content') },
  { name: 'Yazid C.', avatar: '/img/testimonials/yazid-ra-energy.jpeg', quote: t('testimonials.items.ra_energy.content') },
  { name: 'Nelson M.', avatar: '/img/testimonials/nelson-souji-nova.jpg', quote: t('testimonials.items.souji_nova.content') },
  { name: 'Mario C.', avatar: '/img/testimonials/mario-fontaines-vtc.png', quote: t('testimonials.items.fontaines_vtc.content') },
  { name: 'Pierre J.', avatar: '/img/testimonials/pierre jean.jpg', quote: t('testimonials.items.liquid_scan.content') },
  { name: 'Jean francois Fialaire', avatar: '/img/testimonials/jean-francois-fialaire.svg', quote: t('testimonials.items.amg_promotion.content') }
])

const activeIndex = ref(0)
const isPaused = ref(false)
const activeReview = computed(() => reviews.value[activeIndex.value])
let rotationTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  rotationTimer = window.setInterval(() => {
    if (!isPaused.value) activeIndex.value = (activeIndex.value + 1) % reviews.value.length
  }, 6000)
})

onUnmounted(() => {
  if (rotationTimer) window.clearInterval(rotationTimer)
})
</script>

<template>
  <div
    class="hero-testimonial"
    aria-live="off"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
    @focusin="isPaused = true"
    @focusout="isPaused = false"
  >
    <Transition name="hero-review" mode="out-in">
      <figure :key="activeIndex" class="hero-testimonial__review">
        <blockquote class="hero-testimonial__quote">“{{ activeReview.quote }}”</blockquote>
        <figcaption class="hero-testimonial__author">
          <img :src="activeReview.avatar" :alt="activeReview.name" width="30" height="30">
          <span class="hero-testimonial__name">{{ activeReview.name }}</span>
          <span class="hero-testimonial__divider" aria-hidden="true" />
          <span class="hero-testimonial__stars" :aria-label="t('testimonials.five_stars')">★★★★★</span>
        </figcaption>
      </figure>
    </Transition>
  </div>
</template>

<style scoped>
.hero-testimonial { width: min(620px, calc(100vw - 40px)); min-height: 104px; }
.hero-testimonial__review { display: flex; min-height: 104px; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin: 0; }
.hero-testimonial__quote { display: -webkit-box; max-width: 560px; margin: 0; overflow: hidden; color: rgba(255,255,255,.88); font: 400 clamp(14px,1.15vw,16px)/1.45 Inter,sans-serif; text-align: center; white-space: pre-line; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.hero-testimonial__author { display: flex; align-items: center; justify-content: center; gap: 10px; color: rgba(255,255,255,.85); font: 500 13px/1.2 Inter,sans-serif; }
.hero-testimonial__author img { width: 30px; height: 30px; flex: none; border-radius: 50%; object-fit: cover; }
.hero-testimonial__name { white-space: nowrap; }
.hero-testimonial__divider { width: 1px; height: 16px; margin-inline: 2px; background: rgba(255,255,255,.25); }
.hero-testimonial__stars { color: #f0bf6c; font-size: 15px; letter-spacing: 1px; white-space: nowrap; }
.hero-review-enter-active, .hero-review-leave-active { transition: opacity 280ms ease, transform 280ms ease; }
.hero-review-enter-from { opacity: 0; transform: translateY(7px); }
.hero-review-leave-to { opacity: 0; transform: translateY(-7px); }
@media (min-width: 641px) and (max-height: 700px) {
  .hero-testimonial { min-height: 88px; }
  .hero-testimonial__review { min-height: 88px; gap: 8px; }
  .hero-testimonial__quote { font-size: 13px; }
  .hero-testimonial__author img { width: 26px; height: 26px; }
}
@media (max-width: 640px) {
  .hero-testimonial { min-height: 124px; }
  .hero-testimonial__review { min-height: 124px; gap: 12px; }
  .hero-testimonial__quote { max-width: 360px; font-size: 13px; }
  .hero-testimonial__author { gap: 7px; font-size: 12px; }
  .hero-testimonial__stars { font-size: 12px; letter-spacing: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-review-enter-active, .hero-review-leave-active { transition: none; }
}
</style>
