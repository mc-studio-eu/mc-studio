<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../layouts/Navbar.vue'
import HeroContent from './HeroContent.vue'
import HeroButtons from './HeroButtons.vue'

const { locale } = useI18n()
const hero = ref<HTMLElement | null>(null)
const heroImage = ref<HTMLElement | null>(null)
const heroCenter = ref<HTMLElement | null>(null)
const preview = ref<HTMLElement | null>(null)
const previewFrame = ref<HTMLElement | null>(null)
const previewLabel = computed(() => locale.value === 'fr' ? 'Produit sélectionné' : 'Featured product')

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.registerPlugin(ScrollTrigger)

  const context = gsap.context(() => {
    const reveal = gsap.timeline({ defaults: { ease: 'power3.out' } })

    reveal
      .fromTo(heroImage.value, {
        scale: 1.13,
        filter: 'blur(12px) saturate(.7) brightness(.72)',
      }, {
        scale: 1.03,
        filter: 'blur(0px) saturate(.9) brightness(.92)',
        duration: 2.1,
      })
      .from('.air-nav', {
        y: -18,
        opacity: 0,
        duration: .85,
      }, .08)
      .from([
        '.air-hero-copy__eyebrow',
        '.air-hero-copy__title',
        '.air-hero-copy__subtitle',
        '.air-hero-copy__rating',
        '.air-hero-actions',
      ], {
        y: 34,
        opacity: 0,
        filter: 'blur(14px)',
        duration: 1,
        stagger: .11,
      }, .2)
      .from(preview.value, {
        y: 150,
        scale: .88,
        rotateX: 8,
        opacity: 0,
        duration: 1.35,
      }, .66)
      .from('.air-hero__rail span', {
        y: 12,
        opacity: 0,
        stagger: .07,
        duration: .6,
      }, .9)

    gsap.to(previewFrame.value, {
      y: -12,
      duration: 4.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.8,
    })

    gsap.to(heroImage.value, {
      yPercent: 12,
      scale: 1.1,
      ease: 'none',
      scrollTrigger: {
        trigger: hero.value,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.1,
      },
    })

    gsap.to(heroCenter.value, {
      yPercent: -9,
      opacity: .28,
      ease: 'none',
      scrollTrigger: {
        trigger: hero.value,
        start: 'top top',
        end: '82% top',
        scrub: .8,
      },
    })
  }, hero.value)

  onUnmounted(() => context.revert())
})
</script>

<template>
  <section ref="hero" class="air-hero">
    <img
      ref="heroImage"
      src="/img/main/mc-air-glass-hero.webp"
      alt="Sculpture de verre au-dessus d'un ciel nocturne"
      fetchpriority="high"
      class="air-hero__image"
    >
    <div class="air-hero__veil" aria-hidden="true"></div>
    <div class="air-hero__light" aria-hidden="true"></div>

    <div class="air-hero__content">
      <Navbar />
      <div ref="heroCenter" class="air-hero__center">
        <HeroContent />
        <HeroButtons />

        <div ref="preview" class="air-hero-preview">
          <div ref="previewFrame" class="air-hero-preview__frame">
            <div class="air-hero-preview__bar">
              <div class="air-hero-preview__identity">
                <span class="air-hero-preview__status" aria-hidden="true"></span>
                <span>{{ previewLabel }}</span>
              </div>
              <span>Arises · Product design</span>
              <span class="air-hero-preview__live">Live</span>
            </div>
            <NuxtImg
              src="/img/project/arises-figma.png"
              alt="Interface produit Arises conçue par MC Studio"
              class="air-hero-preview__image"
              loading="eager"
            />
          </div>
        </div>
      </div>

      <div class="air-hero__rail" aria-label="Expertises MC Studio">
        <span>01 — Branding</span>
        <span>02 — Product design</span>
        <span>03 — Development</span>
        <span>04 — Launch</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.air-hero {
  position: relative;
  isolation: isolate;
  min-height: max(960px, 112svh);
  overflow: hidden;
  background: #02060c;
}

.air-hero__image,
.air-hero__veil,
.air-hero__light {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.air-hero__image { z-index: -3; object-fit: cover; object-position: 52% center; will-change: transform, filter; }
.air-hero__veil { z-index: -1; background: rgba(2,6,12,.24); }
.air-hero__light { z-index: -2; top: auto; right: 6%; bottom: 4%; left: auto; width: 28vw; height: 28vw; border-radius: 50%; background: #f0bf6c; filter: blur(120px); opacity: .08; animation: gold-breathe 6s ease-in-out infinite alternate; }
.air-hero__content { display: flex; min-height: max(960px, 112svh); flex-direction: column; }
.air-hero__center { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: flex-start; padding: clamp(46px, 7vh, 82px) 24px 54px; perspective: 1400px; will-change: transform, opacity; }
.air-hero__rail {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 18px 24px;
  border-top: 1px solid rgba(255,255,255,.18);
  color: rgba(255,255,255,.72);
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
}
.air-hero__rail span:not(:first-child) { text-align: center; }
.air-hero__rail span:last-child { text-align: right; }

.air-hero-preview { width: min(900px, calc(100vw - 48px)); margin-top: clamp(46px, 7vh, 72px); transform-origin: 50% 0; will-change: transform, opacity; }
.air-hero-preview__frame { overflow: hidden; border: 1px solid rgba(240,191,108,.55); border-radius: 12px; background: #f5f5f5; will-change: transform; }
.air-hero-preview__bar { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; min-height: 42px; padding: 0 14px; border-bottom: 1px solid rgba(27,27,27,.12); color: rgba(27,27,27,.55); font: 500 11px/1 Inter, system-ui, sans-serif; }
.air-hero-preview__identity { display: flex; align-items: center; gap: 8px; }
.air-hero-preview__status { width: 7px; height: 7px; border-radius: 50%; background: #f0bf6c; }
.air-hero-preview__live { justify-self: end; padding: 5px 9px; border: 1px solid rgba(27,27,27,.14); border-radius: 999px; color: #1b1b1b; }
.air-hero-preview__image { display: block; width: 100%; height: auto; aspect-ratio: 2/1; object-fit: cover; }

@keyframes gold-breathe {
  from { opacity: .045; transform: scale(.86); }
  to { opacity: .11; transform: scale(1.08); }
}

@media (max-width: 720px) {
  .air-hero { min-height: 860px; }
  .air-hero__content { min-height: 860px; }
  .air-hero__image { object-position: 62% center; }
  .air-hero__center { padding: 42px 18px 48px; }
  .air-hero-preview { width: calc(100vw - 28px); margin-top: 40px; }
  .air-hero-preview__bar { grid-template-columns: 1fr auto; }
  .air-hero-preview__bar > span:nth-child(2) { display: none; }
  .air-hero__rail { grid-template-columns: repeat(2, 1fr); row-gap: 12px; }
  .air-hero__rail span:nth-child(n) { text-align: left; }
}

@media (prefers-reduced-motion: reduce) {
  .air-hero__light { animation: none; }
}
</style>
