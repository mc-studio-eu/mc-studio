<script setup lang="ts">
const { rt, t, tm } = useI18n()
const localePath = useLocalePath()
const homeRoot = ref<HTMLElement | null>(null)
const currentHeroWordIndex = ref(0)

let revealObserver: IntersectionObserver | undefined
let heroWordRotationTimer: ReturnType<typeof setInterval> | undefined

const heroWords = computed(() => {
  const words = tm('globalHome.hero.rotating_words')

  return Array.isArray(words) ? words.map(word => rt(word)) : []
})

const currentHeroWord = computed(() => heroWords.value[currentHeroWordIndex.value] ?? '')
const heroWordPlaceholder = computed(() => heroWords.value[0] ?? currentHeroWord.value)

onMounted(() => {
  homeRoot.value?.classList.add('has-js')

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion && heroWords.value.length > 1) {
    heroWordRotationTimer = window.setInterval(() => {
      currentHeroWordIndex.value = (currentHeroWordIndex.value + 1) % heroWords.value.length
    }, 2600)
  }

  if (prefersReducedMotion || !homeRoot.value) return

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        revealObserver?.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })

  homeRoot.value.querySelectorAll<HTMLElement>('.js-reveal').forEach((element) => revealObserver?.observe(element))
})

onUnmounted(() => {
  revealObserver?.disconnect()
  if (heroWordRotationTimer) window.clearInterval(heroWordRotationTimer)
})

useSeoMeta({
  title: () => t('globalHome.seo.title'),
  description: () => t('globalHome.seo.description'),
  ogTitle: () => t('globalHome.seo.title'),
  ogDescription: () => t('globalHome.seo.description')
})
</script>

<template>
  <main ref="homeRoot" class="global-home min-h-screen bg-[#0f0f0f] text-white">
    <StudioNavbar tone="dark" />

    <section
      class="global-home__hero relative flex min-h-[min(780px,calc(100svh-96px))] w-full flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-[clamp(80px,12vw,150px)] text-center sm:pb-32"
    >
      <img
        class="global-home__hero-clouds"
        src="/img/main/home-clouds.png"
        alt=""
        aria-hidden="true"
      >
      <div class="global-home__hero-vignette" aria-hidden="true" />
      <div class="global-home__hero-orb" aria-hidden="true" />
      <h1 class="relative z-10 max-w-[980px] whitespace-pre-line text-balance font-manrope text-[clamp(34px,4.2vw,64px)] font-medium leading-[1.08] tracking-[-0.015em] text-white max-sm:text-[clamp(20px,6.4vw,34px)]">
        <span class="sr-only">{{ t('globalHome.hero.title') }}</span>
        <span aria-hidden="true">
          {{ t('globalHome.hero.title_prefix') }}&nbsp;<span class="global-home__hero-word-rotator">
            <span class="global-home__hero-word-placeholder">{{ heroWordPlaceholder }}</span>
            <Transition name="global-home-hero-word">
              <span :key="currentHeroWord" class="global-home__hero-word">{{ currentHeroWord }}</span>
            </Transition>
          </span>
        </span>
      </h1>
      <p class="relative z-10 mt-[31px] max-w-[900px] text-balance font-inter text-[clamp(14px,1.32vw,19px)] leading-[1.28] text-white/60 max-sm:mt-6 max-sm:max-w-[520px] max-sm:text-[15px] max-sm:leading-[1.5]">
        {{ t('globalHome.hero.subtitle') }}
      </p>
    </section>

    <section id="worlds" class="global-home__worlds js-reveal mx-auto w-[min(1240px,calc(100%-48px))] pt-24 pb-24 sm:pt-36 sm:pb-36" aria-labelledby="worlds-title">
      <div class="mb-8 flex items-end justify-between gap-6">
        <h2 id="worlds-title" class="font-manrope text-3xl tracking-[-0.04em] sm:text-5xl">{{ t('globalHome.worlds.title') }}</h2>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <NuxtLink :to="localePath('/business')" class="world-card world-card--business">
          <div class="world-card__top relative z-10">
            <span class="world-card__arrow" aria-hidden="true">↗</span>
          </div>
          <div class="world-card__content relative z-10">
            <p class="world-card__audience text-sm uppercase tracking-[0.18em]">{{ t('globalHome.worlds.business.label') }}</p>
            <h3 class="world-card__title mt-4 max-w-[470px] font-manrope text-[clamp(2.3rem,5vw,5rem)] leading-[0.96] tracking-[-0.06em]">{{ t('globalHome.worlds.business.title') }}</h3>
            <p class="world-card__body mt-5 max-w-[400px] text-base leading-7 text-white/65">{{ t('globalHome.worlds.business.body') }}</p>
            <span class="mt-8 inline-flex items-center gap-2 text-sm font-semibold">Explore Business <span aria-hidden="true">→</span></span>
          </div>
        </NuxtLink>

        <NuxtLink :to="localePath('/creators')" class="world-card world-card--creators">
          <img class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-multiply" src="/assets/creator/hero-bg.png" alt="" aria-hidden="true">
          <div class="world-card__top relative z-10">
            <span class="world-card__arrow" aria-hidden="true">↗</span>
          </div>
          <div class="world-card__content relative z-10">
            <p class="world-card__audience text-sm uppercase tracking-[0.18em]">{{ t('globalHome.worlds.creators.label') }}</p>
            <h3 class="world-card__title mt-4 max-w-[470px] font-manrope text-[clamp(2.3rem,5vw,5rem)] leading-[0.96] tracking-[-0.06em] text-white">{{ t('globalHome.worlds.creators.title') }}</h3>
            <p class="world-card__body mt-5 max-w-[400px] text-base leading-7 text-white/65">{{ t('globalHome.worlds.creators.body') }}</p>
            <span class="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">Explore Creators <span aria-hidden="true">→</span></span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="global-home__proof js-reveal border-y border-white/10" aria-labelledby="capabilities-title">
      <div class="mx-auto grid w-[min(1240px,calc(100%-48px))] gap-10 py-16 sm:grid-cols-[0.8fr_1.2fr] sm:py-24">
        <h2 id="capabilities-title" class="max-w-sm font-manrope text-3xl tracking-[-0.05em] sm:text-5xl">{{ t('globalHome.expertise.title') }}</h2>
        <div class="grid grid-cols-2 gap-x-5 gap-y-4 text-sm text-white/60 sm:grid-cols-3 sm:text-base">
          <span v-for="item in [t('globalHome.expertise.items.strategy'), t('globalHome.expertise.items.design'), t('globalHome.expertise.items.development'), t('globalHome.expertise.items.saas'), t('globalHome.expertise.items.ai'), t('globalHome.expertise.items.launch')]" :key="item" class="border-t border-white/15 pt-3">{{ item }}</span>
        </div>
      </div>
    </section>

    <section class="js-reveal mx-auto w-[min(1240px,calc(100%-48px))] py-24 sm:py-36" aria-labelledby="selected-projects-title">
      <div class="flex items-end justify-between gap-5">
        <h2 id="selected-projects-title" class="font-manrope text-4xl tracking-[-0.06em] sm:text-6xl">{{ t('globalHome.projects.title') }}</h2>
        <NuxtLink class="hidden text-sm text-white/60 transition hover:text-white sm:block" :to="localePath('/projects')">{{ t('globalHome.projects.link') }} <span aria-hidden="true">↗</span></NuxtLink>
      </div>
      <div class="mt-10 grid gap-4 sm:grid-cols-3">
        <NuxtLink v-for="project in [
          { title: 'Personal', image: '/img/project/personal/hero.png', type: 'Creator' },
          { title: 'Maison AWL', image: '/img/project/maison-awl/desktop-mockup.png', type: 'Creator' },
          { title: 'Shika Consulting', image: '/img/project/shika-consulting/homepage.webp', type: 'Business' }
        ]" :key="project.title" :to="localePath('/projects')" class="project-teaser group">
          <div class="aspect-[4/3] overflow-hidden rounded-xl bg-white/5"><img class="h-full w-full object-cover transition duration-500 group-hover:scale-105" :src="project.image" :alt="project.title" loading="lazy"></div>
          <div class="mt-4 flex items-center justify-between gap-4"><span class="font-manrope text-xl tracking-[-0.03em]">{{ project.title }}</span><span class="project-teaser__type text-xs uppercase tracking-[0.14em] text-white/40">{{ project.type }}</span></div>
        </NuxtLink>
      </div>
    </section>

    <FooterSection />
  </main>
</template>

<style scoped>
.world-card {
  position: relative;
  display: flex;
  min-height: 600px;
  flex-direction: column;
  overflow: hidden;
  border-radius: 22px;
  padding: clamp(24px, 4vw, 48px);
  text-decoration: none;
}

.world-card--business { background: linear-gradient(145deg, #26211a 0%, #17130f 100%); box-shadow: inset 0 0 0 1px rgba(240,191,108,.2); }
.world-card--business::after { content: ''; position: absolute; inset: auto -12% -30% 28%; height: 55%; border-radius: 50%; background: radial-gradient(circle, rgba(240,191,108,.3), transparent 65%); filter: blur(24px); }
.world-card--creators { background: #c9baf2; box-shadow: inset 0 0 0 1px rgba(124,58,237,.18); }
.world-card--creators .world-card__body { color: rgba(31, 24, 52, .82) !important; }
.world-card__top { display: flex; align-items: center; justify-content: flex-end; }
.world-card__content { margin-top: auto; }
.world-card__audience { color: #fff; font-weight: 600; opacity: .9; text-shadow: 0 1px 3px rgba(0,0,0,.18); }
.world-card__arrow { display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-size: 22px; }
.global-home__hero { isolation: isolate; }
.global-home__hero::before { content: ''; position: absolute; inset: 12% 12% 4%; z-index: -1; border-radius: 999px; background: radial-gradient(ellipse at center, rgba(240,191,108,.1), transparent 68%); filter: blur(12px); pointer-events: none; }
.global-home__hero-clouds { position: absolute; inset: 0; z-index: -3; width: 100%; max-width: none; height: 100%; object-fit: cover; object-position: center; opacity: .92; filter: saturate(.9) contrast(1.06); pointer-events: none; }
.global-home__hero-vignette { position: absolute; inset: 0; z-index: -2; background: linear-gradient(180deg, rgba(15,15,15,.14) 0%, rgba(15,15,15,.34) 100%), radial-gradient(ellipse at center, rgba(15,15,15,.06), rgba(15,15,15,.36) 88%); pointer-events: none; }
.global-home__hero-orb { position: absolute; top: 50%; left: 50%; z-index: -1; width: clamp(180px, 24vw, 360px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, rgba(240,191,108,.18), rgba(240,191,108,0) 68%); filter: blur(20px); transform: translate(-50%, -50%); pointer-events: none; }
.global-home__hero h1 { animation: home-title-in 900ms cubic-bezier(.22,1,.36,1) both; background: none; color: #fff; -webkit-background-clip: border-box; -webkit-text-fill-color: #fff; }
.global-home__hero p { animation: home-copy-in 900ms .14s cubic-bezier(.22,1,.36,1) both; }
.global-home__hero-word-rotator { display: inline-grid; text-align: left; vertical-align: baseline; }
.global-home__hero-word-placeholder, .global-home__hero-word { grid-area: 1 / 1; }
.global-home__hero-word-placeholder { visibility: hidden; }
.global-home__hero-word { display: block; }
.global-home-hero-word-enter-active, .global-home-hero-word-leave-active { transition: opacity 450ms ease, filter 450ms ease, transform 450ms cubic-bezier(.22,1,.36,1); }
.global-home-hero-word-enter-from { opacity: 0; filter: blur(8px); transform: translateY(.65em); }
.global-home-hero-word-leave-to { opacity: 0; filter: blur(8px); transform: translateY(-.65em); }
.project-teaser { display: block; transform: translateY(0); transition: transform 250ms ease; }
.project-teaser:hover { transform: translateY(-6px); }
.project-teaser__type { transition: color 250ms ease; }
.project-teaser:hover .project-teaser__type { color: rgba(255,255,255,.8); }
.world-card:focus-visible, .project-teaser:focus-visible { outline: 2px solid #f0bf6c; outline-offset: 6px; }
.global-home.has-js .js-reveal { opacity: 0; transform: translateY(28px); transition: opacity 700ms ease, transform 700ms cubic-bezier(.22,1,.36,1); }
.global-home.has-js .js-reveal.is-visible { opacity: 1; transform: translateY(0); }
@keyframes home-title-in { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes home-copy-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 640px) {
  .world-card { min-height: 500px; }
}

@media (min-width: 1024px) {
  .world-card__title { min-height: 3.84em; }
  .world-card__body { min-height: 3.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  .global-home__hero h1, .global-home__hero p { animation: none; }
  .global-home-hero-word-enter-active, .global-home-hero-word-leave-active { transition: none; }
  .global-home__hero-orb, .project-teaser { transition: none; animation: none; transform: none; }
  .global-home.has-js .js-reveal, .global-home.has-js .js-reveal.is-visible { opacity: 1; transform: none; transition: none; }
}
</style>
