<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

const { t } = useI18n()

const root = ref<HTMLElement | null>(null)
const texture = ref<HTMLImageElement | null>(null)
let ctx: gsap.Context | undefined

const lines = computed(() => [
  t('home.manifesto.line1'),
  t('home.manifesto.line2'),
  `${t('home.manifesto.line3Lead')} ${t('home.manifesto.line3Rest')}`,
  t('home.manifesto.line4'),
  t('home.manifesto.line5')
])

onMounted(() => {
  if (!root.value) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    const phraseElements = gsap.utils.toArray<HTMLElement>('.manifesto-line')
    const timeline = gsap.timeline({
      defaults: { ease: 'power1.inOut' },
      scrollTrigger: {
        trigger: root.value,
        start: 'top 12%',
        end: () => {
          const pace = window.innerWidth < 768 ? 0.4 : 0.48
          return `+=${Math.max(window.innerHeight * phraseElements.length * pace, 1400)}`
        },
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    })

    gsap.set(phraseElements, {
      autoAlpha: 0,
      y: 8
    })
    gsap.set(phraseElements[0], { autoAlpha: 0.12 })

    phraseElements.forEach((phrase, index) => {
      timeline
        .to(phrase, {
          autoAlpha: 1,
          y: 0,
          duration: 0.38
        })
        .to(phrase, { duration: 0.72 })

      if (index < phraseElements.length - 1) {
        timeline.to(phrase, {
          autoAlpha: 0,
          y: -8,
          duration: 0.32
        })
      }
    })

    if (texture.value) {
      const isMobile = window.innerWidth < 768

      timeline.fromTo(
        texture.value,
        {
          scale: isMobile ? 1 : 1.01,
          xPercent: isMobile ? 0 : -0.5
        },
        {
          scale: isMobile ? 1.02 : 1.07,
          xPercent: isMobile ? 0 : 0.5,
          duration: timeline.duration(),
          ease: 'none'
        },
        0
      )
    }
  }, root.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="root" class="manifesto-stage relative mx-auto w-[min(1447px,calc(100%-24px))] overflow-hidden rounded-[var(--radius-frame)]">
    <img
      ref="texture"
      class="manifesto-texture pointer-events-none absolute inset-0 !h-full !w-full object-fill md:object-cover"
      src="/assets/creator/purple-texture.png"
      alt=""
      aria-hidden="true"
    >

    <div class="manifesto-content relative z-10 mx-auto w-[min(1346px,calc(100%-48px))] text-center">
      <p
        v-for="line in lines"
        :key="line"
        class="manifesto-line"
      >
        {{ line }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.manifesto-stage {
  height: clamp(460px, 72svh, 680px);
}

.manifesto-content {
  display: grid;
  height: 100%;
  place-items: center;
}

.manifesto-line {
  grid-area: 1 / 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 1120px;
  padding: clamp(32px, 6vw, 92px);
  font-family: Inter, var(--font-body);
  font-size: clamp(27px, 3.2vw, 48px);
  font-weight: 500;
  line-height: 1.14;
  letter-spacing: -0.025em;
  text-wrap: balance;
  opacity: 0;
}

.manifesto-line:first-child {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .manifesto-stage {
    height: auto;
  }

  .manifesto-content {
    display: flex;
    height: auto;
    flex-direction: column;
    gap: clamp(28px, 4vw, 48px);
    padding-block: clamp(56px, 8vw, 100px);
  }

  .manifesto-line {
    position: static;
    display: block;
    padding: 0;
    font-size: clamp(24px, 3vw, 42px);
    opacity: 1;
  }

}

@media (max-width: 767px) {
  .manifesto-stage {
    height: min(62svh, 520px);
    min-height: 400px;
  }

  .manifesto-line {
    padding-inline: clamp(8px, 3vw, 16px);
    font-size: clamp(24px, 6.4vw, 32px);
    line-height: 1.16;
  }
}

@media (max-width: 380px) {
  .manifesto-stage {
    min-height: 360px;
  }

  .manifesto-line {
    font-size: clamp(22px, 6.8vw, 26px);
  }
}

@media (max-width: 767px) and (prefers-reduced-motion: reduce) {
  .manifesto-stage {
    height: auto;
    min-height: 0;
  }
}
</style>
