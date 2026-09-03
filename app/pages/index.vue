<script setup lang="ts">
const { rt, t, tm } = useI18n()
const localePath = useLocalePath()
const homeRoot = ref<HTMLElement | null>(null)
const currentHeroWordIndex = ref(0)
const heroPrimaryCta = ref<HTMLElement | { $el: HTMLElement } | null>(null)
const heroPrimaryCtaText = ref<HTMLElement | null>(null)
const heroSecondaryCta = ref<HTMLElement | { $el: HTMLElement } | null>(null)
const heroSecondaryCtaText = ref<HTMLElement | null>(null)

useTextSlideAnimation(heroPrimaryCta, heroPrimaryCtaText)
useTextSlideAnimation(heroSecondaryCta, heroSecondaryCtaText)

let revealObserver: IntersectionObserver | undefined
let heroWordRotationTimer: ReturnType<typeof setInterval> | undefined

const heroWords = computed(() => {
  const words = tm('globalHome.hero.rotating_words')

  return Array.isArray(words) ? words.map(word => rt(word)) : []
})

const currentHeroWord = computed(() => heroWords.value[currentHeroWordIndex.value] ?? '')
const heroWordPlaceholder = computed(() => heroWords.value[0] ?? currentHeroWord.value)

const heroReferences = [
  { name: 'R&A Energy', image: '/img/clients/ra-energy.svg', className: 'global-home__reference--ra' },
  { name: 'AMG Promotion', image: '/img/clients/amg-promotion.svg', className: 'global-home__reference--amg' },
  { name: 'Souji Nova', image: '/img/clients/souji-nova.png', className: 'global-home__reference--souji' },
  { name: 'Maison AWL', image: '/img/project/maison-awl/logo-black.png', className: 'global-home__reference--maison' },
  { name: 'Personal', image: '/img/clients/personal.svg', className: 'global-home__reference--personal' },
  { name: 'Arises', image: '/img/clients/arises.svg', className: 'global-home__reference--arises' },
  { name: 'Shika Consulting', image: '/img/clients/shika-consulting.webp', className: 'global-home__reference--shika', showLabel: false }
]

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
      class="global-home__hero relative flex min-h-[min(860px,calc(100svh-88px))] w-full flex-col items-center overflow-hidden px-5 pb-7 pt-[clamp(88px,12svh,138px)] text-center sm:px-8 sm:pb-10"
    >
      <img
        class="global-home__hero-clouds"
        src="/img/main/home-clouds.png"
        alt=""
        aria-hidden="true"
      >
      <div class="global-home__hero-vignette" aria-hidden="true" />
      <div class="global-home__hero-orb" aria-hidden="true" />
      <div class="global-home__hero-main relative z-10 flex w-full flex-1 flex-col items-center justify-center">
        <h1 class="max-w-[1120px] whitespace-pre-line text-balance font-manrope text-[clamp(40px,5.1vw,78px)] font-medium leading-[1.02] tracking-[-0.045em] text-white max-sm:text-[clamp(34px,10.4vw,54px)]">
          <span class="sr-only">{{ t('globalHome.hero.title') }}</span>
          <span class="global-home__hero-title-visual" aria-hidden="true">
            <span class="global-home__hero-title-prefix">{{ t('globalHome.hero.title_prefix') }}</span><span class="global-home__hero-title-spacer">&nbsp;</span><span class="global-home__hero-word-rotator">
              <span class="global-home__hero-word-placeholder">{{ heroWordPlaceholder }}</span>
              <Transition name="global-home-hero-word">
                <span :key="currentHeroWord" class="global-home__hero-word">{{ currentHeroWord }}</span>
              </Transition>
            </span>
          </span>
        </h1>
        <p class="mt-7 max-w-[760px] text-balance font-inter text-[clamp(15px,1.2vw,18px)] leading-[1.55] text-white/58 max-sm:mt-5 max-sm:max-w-[520px] max-sm:text-[15px]">
          {{ t('globalHome.hero.subtitle') }}
        </p>

        <div class="global-home__hero-actions mt-8 flex flex-wrap items-center justify-center gap-3 max-sm:mt-7 max-sm:w-full max-sm:flex-col">
          <NuxtLink ref="heroPrimaryCta" class="global-home__hero-cta global-home__hero-cta--primary" :to="localePath('/contact')">
            <span class="sr-only">{{ t('globalHome.hero.cta_primary') }}</span>
            <span class="global-home__hero-cta-text-window" aria-hidden="true">
              <span ref="heroPrimaryCtaText" class="global-home__hero-cta-text-track">
                <span class="global-home__hero-cta-text">{{ t('globalHome.hero.cta_primary') }}</span>
                <span class="global-home__hero-cta-text">{{ t('globalHome.hero.cta_primary') }}</span>
              </span>
            </span>
          </NuxtLink>
          <NuxtLink ref="heroSecondaryCta" class="global-home__hero-cta global-home__hero-cta--secondary" :to="localePath('/projects')">
            <span class="sr-only">{{ t('globalHome.hero.cta_secondary') }}</span>
            <span class="global-home__hero-cta-text-window" aria-hidden="true">
              <span ref="heroSecondaryCtaText" class="global-home__hero-cta-text-track">
                <span class="global-home__hero-cta-text">{{ t('globalHome.hero.cta_secondary') }}</span>
                <span class="global-home__hero-cta-text">{{ t('globalHome.hero.cta_secondary') }}</span>
              </span>
            </span>
          </NuxtLink>
        </div>
      </div>

      <div class="global-home__hero-references relative z-10 w-full shrink-0" :aria-label="t('globalHome.hero.references_label')">
        <p class="global-home__hero-reference-label">{{ t('globalHome.hero.references_label') }}</p>
        <div class="global-home__hero-reference-marquee">
          <div class="global-home__hero-reference-track">
            <div
              v-for="groupIndex in 2"
              :key="groupIndex"
              class="global-home__hero-reference-group"
              :aria-hidden="groupIndex === 2"
            >
              <div
                v-for="reference in heroReferences"
                :key="`${groupIndex}-${reference.name}`"
                class="global-home__reference"
                :class="reference.className"
              >
                <img :src="reference.image" :alt="reference.showLabel === false ? reference.name : ''" width="48" height="48">
                <span v-if="reference.showLabel !== false">{{ reference.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="worlds" class="global-home__worlds js-reveal mx-auto box-border w-full max-w-[1288px] px-6 pt-24 pb-24 sm:pt-36 sm:pb-36" aria-labelledby="worlds-title">
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
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
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
.global-home__hero::before { content: ''; position: absolute; inset: 8% 10% 2%; z-index: -1; border-radius: 999px; background: radial-gradient(ellipse at center, rgba(240,191,108,.13), transparent 66%); filter: blur(12px); pointer-events: none; }
.global-home__hero-clouds { position: absolute; inset: 0; z-index: -3; width: 100%; max-width: none; height: 100%; object-fit: cover; object-position: center; opacity: .92; filter: saturate(.9) contrast(1.06); pointer-events: none; }
.global-home__hero-vignette { position: absolute; inset: 0; z-index: -2; background: linear-gradient(180deg, rgba(15,15,15,.08) 0%, rgba(15,15,15,.18) 48%, rgba(15,15,15,.82) 100%), radial-gradient(ellipse at center, rgba(15,15,15,.03), rgba(15,15,15,.42) 88%); pointer-events: none; }
.global-home__hero-orb { position: absolute; top: 50%; left: 50%; z-index: -1; width: clamp(180px, 24vw, 360px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, rgba(240,191,108,.18), rgba(240,191,108,0) 68%); filter: blur(20px); transform: translate(-50%, -50%); pointer-events: none; }
.global-home__hero h1 { width: 100%; animation: home-title-in 900ms cubic-bezier(.22,1,.36,1) both; background: none; color: #fff; -webkit-background-clip: border-box; -webkit-text-fill-color: #fff; }
.global-home__hero p { animation: home-copy-in 900ms .14s cubic-bezier(.22,1,.36,1) both; }
.global-home__hero-main { min-height: 380px; padding-block: 28px 54px; }
.global-home__hero-title-visual { display: block; }
.global-home__hero-title-prefix, .global-home__hero-title-spacer { display: inline; }
.global-home__hero-word-rotator { display: inline-grid; text-align: left; vertical-align: baseline; }
.global-home__hero-word-placeholder, .global-home__hero-word { grid-area: 1 / 1; }
.global-home__hero-word-placeholder { visibility: hidden; }
.global-home__hero-word { display: block; }
.global-home__hero-actions { --hero-cta-width: 225px; display: grid; grid-template-columns: repeat(2,var(--hero-cta-width)); animation: home-copy-in 900ms .26s cubic-bezier(.22,1,.36,1) both; }
.global-home__hero-cta { box-sizing: border-box; display: inline-flex; inline-size: 100%; min-inline-size: 0; block-size: 44px; min-block-size: 44px; max-block-size: 44px; flex: none; align-items: center; justify-content: center; gap: 10px; border: 0; border-radius: 16px; padding: 0 18px; font: 600 15px/1 Inter, sans-serif; white-space: nowrap; text-decoration: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,.22), 0 14px 34px rgba(0,0,0,.2); backdrop-filter: blur(18px); transition: background 220ms ease, color 220ms ease; }
.global-home__hero-cta--primary { background: rgba(255,255,255,.94); color: #171717; }
.global-home__hero-cta--secondary { block-size: 45px; min-block-size: 45px; max-block-size: 45px; background: rgba(20,20,20,.72); color: #fff; }
.global-home__hero-cta--primary:hover { background: #fff; }
.global-home__hero-cta--secondary:hover { background: rgba(31,31,31,.8); }
.global-home__hero-cta:focus-visible { outline: 2px solid #f0bf6c; outline-offset: 4px; }
.global-home__hero-cta-text-window { display: block; height: 1em; overflow: hidden; }
.global-home__hero-cta-text-track { display: flex; flex-direction: column; }
.global-home__hero-cta-text { display: block; height: 1em; flex: none; line-height: 1; }
.global-home__hero-references { animation: home-copy-in 900ms .42s cubic-bezier(.22,1,.36,1) both; }
.global-home__hero-reference-label { margin: 0 0 20px; color: rgba(255,255,255,.4) !important; font: 600 10px/1 Inter, sans-serif !important; letter-spacing: .24em; text-transform: uppercase; }
.global-home__hero-reference-marquee { width: 100%; overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
.global-home__hero-reference-track { display: flex; width: max-content; will-change: transform; animation: hero-reference-marquee 28s linear infinite; }
.global-home__hero-reference-marquee:hover .global-home__hero-reference-track { animation-play-state: paused; }
.global-home__hero-reference-group { display: flex; flex: none; align-items: center; gap: 16px; padding-right: 16px; }
.global-home__reference { display: flex; width: 190px; min-width: 0; height: 76px; flex: none; align-items: center; justify-content: center; gap: 10px; color: rgba(255,255,255,.62); filter: grayscale(1); font: 580 15px/1 Inter,sans-serif; letter-spacing: -.025em; white-space: nowrap; transition: color 220ms ease, filter 220ms ease; }
.global-home__reference:hover { color: rgba(255,255,255,.9); filter: grayscale(0); }
.global-home__reference img { width: 34px; height: 34px; flex: 0 0 34px; object-fit: contain; opacity: .76; transition: opacity 220ms ease; }
.global-home__reference:hover img { opacity: 1; }
.global-home__reference--ra img, .global-home__reference--maison img { filter: brightness(0) invert(1); }
.global-home__reference--personal img { border-radius: 7px; }
.global-home__reference--arises img { filter: grayscale(1); }
.global-home__reference--shika img { width: 82px; flex-basis: 82px; filter: brightness(0) invert(1); }
@keyframes hero-reference-marquee { to { transform: translateX(-50%); } }
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
  .global-home__worlds { overflow: hidden; }
  .global-home__worlds > .grid { min-width: 0; }
  .world-card { min-height: 420px; border-radius: 18px; padding: 22px; }
  .world-card__arrow { width: 40px; height: 40px; font-size: 19px; }
  .world-card__audience { font-size: 11px; letter-spacing: .16em; }
  .world-card__title { max-width: 100%; font-size: clamp(29px,8vw,36px); line-height: 1.02; letter-spacing: -.055em; overflow-wrap: anywhere; }
  .world-card__body { max-width: 100%; margin-top: 16px; font-size: 15px; line-height: 1.55; }
  .world-card__content > :last-child { margin-top: 22px; font-size: 14px; }
  .global-home__hero { min-height: calc(100svh - 88px); padding-top: clamp(48px,7svh,68px); }
  .global-home__hero-main { min-height: 420px; padding-block: 0 40px; }
  .global-home__hero h1 { max-width: 420px; font-size: clamp(32px,8vw,40px); line-height: 1.04; letter-spacing: -.04em; }
  .global-home__hero-title-prefix { display: block; }
  .global-home__hero-title-spacer { display: none; }
  .global-home__hero-word-rotator { display: grid; width: 100%; margin-top: .12em; text-align: center; }
  .global-home__hero-actions { --hero-cta-width: 250px; grid-template-columns: minmax(0,var(--hero-cta-width)); }
  .global-home__hero-reference-label { margin-bottom: 14px; }
  .global-home__hero-reference-marquee { mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent); }
  .global-home__hero-reference-track { animation-duration: 22s; }
  .global-home__hero-reference-group { gap: 8px; padding-right: 8px; }
  .global-home__reference { width: 160px; height: 58px; gap: 8px; font-size: 11px; }
  .global-home__reference img { width: 28px; height: 28px; flex-basis: 28px; }
  .global-home__reference--shika img { width: 68px; flex-basis: 68px; }
}

@media (min-width: 1024px) {
  .world-card__title { min-height: 3.84em; }
  .world-card__body { min-height: 3.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  .global-home__hero h1, .global-home__hero p, .global-home__hero-actions, .global-home__hero-references { animation: none; }
  .global-home__hero-reference-track { animation: none; }
  .global-home-hero-word-enter-active, .global-home-hero-word-leave-active { transition: none; }
  .global-home__hero-orb, .project-teaser { transition: none; animation: none; transform: none; }
  .global-home.has-js .js-reveal, .global-home.has-js .js-reveal.is-visible { opacity: 1; transform: none; transition: none; }
}
</style>
