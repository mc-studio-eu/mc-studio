<script setup lang="ts">
const { locale, rt, t, tm } = useI18n()
const localePath = useLocalePath()
const currentHeroWordIndex = ref(0)
const heroPrimaryCta = ref<HTMLElement | { $el: HTMLElement } | null>(null)
const heroPrimaryCtaText = ref<HTMLElement | null>(null)
const heroSecondaryCta = ref<HTMLElement | { $el: HTMLElement } | null>(null)
const heroSecondaryCtaText = ref<HTMLElement | null>(null)

useTextSlideAnimation(heroPrimaryCta, heroPrimaryCtaText)
useTextSlideAnimation(heroSecondaryCta, heroSecondaryCtaText)

let heroWordRotationTimer: ReturnType<typeof setInterval> | undefined

const heroWords = computed(() => {
  const words = tm('globalHome.hero.rotating_words')

  return Array.isArray(words) ? words.map(word => rt(word)) : []
})

const currentHeroWord = computed(() => heroWords.value[currentHeroWordIndex.value] ?? '')
const heroWordPlaceholder = computed(() => heroWords.value[0] ?? currentHeroWord.value)
const availabilityMonth = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'long' }).format(new Date()))
const heroReferences = [
  { name: 'R&A Energy', image: '/img/clients/ra-energy.svg', className: 'global-home__reference--ra' },
  { name: 'AMG Promotion', image: '/img/clients/amg-promotion.svg', className: 'global-home__reference--amg' },
  { name: 'Souji Nova', image: '/img/clients/souji-nova.png', className: 'global-home__reference--souji' },
  { name: 'Maison AWL', image: '/img/project/maison-awl/logo-black.png', className: 'global-home__reference--maison' },
  { name: 'Personal', image: '/img/clients/personal.svg', className: 'global-home__reference--personal' },
  { name: 'Arises', image: '/img/clients/arises.svg', className: 'global-home__reference--arises' },
  { name: 'Shika Consulting', image: '/img/clients/shika-consulting.webp', className: 'global-home__reference--shika', showLabel: false }
  ,{ name: 'Sotraya', image: '/img/clients/sotraya.svg', className: 'global-home__reference--sotraya' }
]

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion && heroWords.value.length > 1) {
    heroWordRotationTimer = window.setInterval(() => {
      currentHeroWordIndex.value = (currentHeroWordIndex.value + 1) % heroWords.value.length
    }, 1800)
  }
})

onUnmounted(() => {
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
  <main class="global-home min-h-screen bg-[#0f0f0f] text-white">
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
        <div class="global-home__hero-proof mb-7" aria-label="Informations de disponibilité et avis Google">
          <p class="global-home__availability">
            <span class="global-home__availability-dot" aria-hidden="true" />
            {{ t('hero.availability', { month: availabilityMonth }) }}
          </p>
          <div class="global-home__google-rating" :aria-label="t('hero.reviews')">
            <svg class="global-home__google-mark" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 0 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span class="global-home__stars" aria-hidden="true">★★★★★</span>
            <span class="global-home__google-copy">{{ t('hero.reviews') }}</span>
          </div>
        </div>
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

    <div class="home-business-content">
      <div class="home-business-content__separator" aria-hidden="true" />
      <ProjectSection plain />
      <div class="home-business-content__separator" aria-hidden="true" />

      <ServicesInterMarquee />
      <div class="home-business-content__separator" aria-hidden="true" />

      <div class="section-separator mt-10"></div>  
      
      <!-- Services Section -->
      <ServicesSection id="services" />

      <div class="section-separator mt-10"></div>

      <ScreenMarquee />
      <div class="home-business-content__separator" aria-hidden="true" />

      <!-- La section Services est volontairement exclue : « De votre identité à votre présence digitale ». -->
      <TeamSection />
      <div class="home-business-content__separator" aria-hidden="true" />

      <TestimonialSection />
      <div class="home-business-content__separator" aria-hidden="true" />

      <ServicesInterMarquee />
      <div class="home-business-content__separator" aria-hidden="true" />

      <FaqSection />
    </div>

    <FooterSection />
  </main>
</template>

<style scoped>
.global-home__hero { isolation: isolate; }
.global-home__hero::before { content: ''; position: absolute; inset: 8% 10% 2%; z-index: -1; border-radius: 999px; background: radial-gradient(ellipse at center, rgba(240,191,108,.13), transparent 66%); filter: blur(12px); pointer-events: none; }
.global-home__hero-clouds { position: absolute; inset: 0; z-index: -3; width: 100%; max-width: none; height: 100%; object-fit: cover; object-position: center; opacity: .92; filter: saturate(.9) contrast(1.06); pointer-events: none; }
.global-home__hero-vignette { position: absolute; inset: 0; z-index: -2; background: linear-gradient(180deg, rgba(15,15,15,.08) 0%, rgba(15,15,15,.18) 48%, rgba(15,15,15,.82) 100%), radial-gradient(ellipse at center, rgba(15,15,15,.03), rgba(15,15,15,.42) 88%); pointer-events: none; }
.global-home__hero-orb { position: absolute; top: 50%; left: 50%; z-index: -1; width: clamp(180px, 24vw, 360px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, rgba(240,191,108,.18), rgba(240,191,108,0) 68%); filter: blur(20px); transform: translate(-50%, -50%); pointer-events: none; }
.global-home__hero h1 { width: 100%; animation: home-title-in 900ms cubic-bezier(.22,1,.36,1) both; background: none; color: #fff; -webkit-background-clip: border-box; -webkit-text-fill-color: #fff; }
.global-home__hero p { animation: home-copy-in 900ms .14s cubic-bezier(.22,1,.36,1) both; }
.global-home__hero-main { min-height: 380px; padding-block: 0 104px; }
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
.global-home__hero-proof { display: flex; align-items: center; justify-content: center; gap: 16px; color: rgba(255,255,255,.9); font: 500 14px/1 Inter, sans-serif; animation: home-copy-in 900ms .34s cubic-bezier(.22,1,.36,1) both; }
.global-home__availability { display: inline-flex; align-items: center; gap: 10px; margin: 0; white-space: nowrap; }
.global-home__availability-dot { width: 10px; height: 10px; border: 2px solid #f8d699; border-radius: 50%; background: #f0bf6c; box-shadow: 0 0 0 4px rgba(240,191,108,.12); }
.global-home__google-rating { display: inline-flex; min-height: 38px; align-items: center; gap: 10px; border: 1px solid rgba(255,255,255,.12); border-radius: 999px; padding: 0 14px; background: rgba(255,255,255,.06); box-shadow: inset 0 1px 0 rgba(255,255,255,.08); backdrop-filter: blur(12px); }
.global-home__google-mark { width: 16px; height: 16px; flex: none; }
.global-home__stars { color: #f0bf6c; font-size: 16px; letter-spacing: 1px; line-height: 1; }
.global-home__google-copy { padding-left: 10px; border-left: 1px solid rgba(255,255,255,.15); font-size: 12px; white-space: nowrap; }
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
.global-home__projects-showcase { border-top: 1px solid rgba(255,255,255,.1); border-bottom: 1px solid rgba(255,255,255,.1); }
.projects-showcase__link { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 44px; border: 1px solid rgba(255,255,255,.18); border-radius: 12px; padding: 0 17px; color: rgba(255,255,255,.88); font: 500 14px/1 Inter, sans-serif; text-decoration: none; transition: background 200ms ease, border-color 200ms ease, color 200ms ease; }
.projects-showcase__link:hover { border-color: rgba(255,255,255,.42); background: rgba(255,255,255,.06); color: #fff; }
.projects-showcase__frame { position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: 28px; padding: clamp(8px,1.3vw,18px); background-color: #151515; background-image: linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px); background-size: 48px 48px; text-decoration: none; transition: border-color 250ms ease, transform 350ms cubic-bezier(.22,1,.36,1); }
.projects-showcase__screen { position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: clamp(16px,2vw,26px); background: #0d0d0d; box-shadow: 0 28px 80px rgba(0,0,0,.32); }
.projects-showcase__screen img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; object-position: center top; transition: transform 650ms cubic-bezier(.22,1,.36,1); }
@media (hover: hover) { .projects-showcase__frame:hover { border-color: rgba(255,255,255,.28); transform: translateY(-4px); } .projects-showcase__frame:hover .projects-showcase__screen img { transform: scale(1.015); } }
.global-home__offers { border-bottom: 1px solid rgba(255,255,255,.1); }
.offers-feature__heading { display: flex; align-items: baseline; gap: clamp(22px,5vw,64px); }
.offers-feature__index { color: rgba(255,255,255,.42); font: 400 clamp(2rem,4vw,3.75rem)/1 Manrope, sans-serif; letter-spacing: -.06em; }
.offers-feature__image { overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: 22px; background: #161616; }
.offers-feature__image img { display: block; width: 100%; aspect-ratio: 1 / .72; object-fit: cover; object-position: center; }
.offers-feature__item { display: flex; align-items: flex-start; gap: 11px; color: rgba(255,255,255,.78); font: 400 15px/1.5 Inter, sans-serif; }
.offers-feature__item span { display: inline-grid; width: 19px; height: 19px; flex: 0 0 19px; place-items: center; border: 1px solid rgba(255,255,255,.3); border-radius: 50%; color: #fff; font-size: 11px; }
.offers-feature__cta { display: inline-flex; min-height: 44px; align-items: center; gap: 10px; border: 1px solid rgba(255,255,255,.22); border-radius: 12px; padding: 0 16px; color: #fff; font: 500 14px/1 Inter, sans-serif; text-decoration: none; transition: background 200ms ease, border-color 200ms ease; }
.offers-feature__cta:hover { border-color: rgba(255,255,255,.5); background: rgba(255,255,255,.08); }
.project-teaser:hover .project-teaser__type { color: rgba(255,255,255,.8); }
.world-card:focus-visible, .project-teaser:focus-visible, .projects-showcase__frame:focus-visible, .projects-showcase__link:focus-visible, .offers-feature__cta:focus-visible { outline: 2px solid #fff; outline-offset: 6px; }
.home-business-content { --color-gold: #fff; }
.home-business-content__separator { width: min(1216px, calc(100% - 48px)); height: 1px; margin: clamp(24px, 3vw, 44px) auto; background: linear-gradient(90deg, transparent, rgba(255,255,255,.14) 20%, rgba(255,255,255,.14) 80%, transparent); }
.home-business-content :deep(.text-gradient) { background: none !important; color: var(--text-primary) !important; -webkit-background-clip: border-box !important; -webkit-text-fill-color: currentColor !important; }
.home-business-content :deep(.project-showcase) { background: #151515; }
.home-business-content :deep(.project-grid-pattern) { background-color: #151515; }
.home-business-content :deep(.team-card::before) { background: linear-gradient(to bottom, rgba(255,255,255,.06), transparent 38%); }
.home-business-content :deep(.offers-card), .home-business-content :deep(.offers-card--featured) { background: linear-gradient(to bottom, rgba(255,255,255,.05), transparent 34%), color-mix(in srgb, var(--bg-secondary) 76%, transparent); }
.home-business-content :deep(.offers-card__cta) { background: #fff; }
.home-business-content :deep(.offers-card__check) { border-color: rgba(255,255,255,.26); color: #fff; }
.home-business-content :deep(#services .offer-number) { color: rgba(255,255,255,.42); }
.home-business-content :deep(#services .offer-row-header:hover .offer-number), .home-business-content :deep(#services .offer-row-header:hover .offer-row-title) { color: #fff; }
.home-business-content :deep(#services .offer-toggle-bar) { background: rgba(255,255,255,.7); }
.home-business-content :deep(#services .offer-label) { color: rgba(255,255,255,.5); }
.home-business-content :deep(#services [class*="F0BF6C"]) { color: #fff; }
.home-business-content :deep(#avis > div:first-child) { background: rgba(255,255,255,.06); }
.home-business-content :deep(#avis article) { transition-property: border-color, background-color, box-shadow; }
.home-business-content :deep(#avis article:hover) { border-color: rgba(255,255,255,.28); }
.home-business-content :deep(#avis article > div:first-child) { color: rgba(255,255,255,.12); }
.home-business-content :deep(#faq .bg-\[linear-gradient\(135deg\,var\(--color-gold\)_0\%\,\#e8a84c_100\%\)\]) { background: #222 !important; }
.home-business-content :deep(#faq .\!bg-\[var\(--color-gold\)\]) { background: #fff !important; color: #111 !important; }
@keyframes home-title-in { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes home-copy-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 640px) {
  .global-home__worlds { overflow: hidden; }
  .global-home__worlds > .grid { min-width: 0; }
  .world-card { min-height: 340px; border-radius: 18px; padding: 22px; }
  .world-card__top { top: 22px; right: 22px; }
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
  .global-home__hero-proof { flex-direction: column; gap: 12px; font-size: 13px; }
  .global-home__google-rating { min-height: 36px; gap: 9px; padding: 0 12px; }
  .global-home__google-mark { width: 15px; height: 15px; }
  .global-home__stars { font-size: 15px; letter-spacing: 0; }
  .global-home__google-copy { padding-left: 9px; font-size: 11px; }
  .global-home__hero-reference-label { margin-bottom: 14px; }
  .global-home__hero-reference-marquee { mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent); }
  .global-home__hero-reference-track { animation-duration: 22s; }
  .global-home__hero-reference-group { gap: 8px; padding-right: 8px; }
  .global-home__reference { width: 160px; height: 58px; gap: 8px; font-size: 11px; }
  .global-home__reference img { width: 28px; height: 28px; flex-basis: 28px; }
  .global-home__reference--shika img { width: 68px; flex-basis: 68px; }
  .home-business-content__separator { margin-block: 24px; }
  .projects-showcase__link { width: fit-content; }
  .projects-showcase__frame { margin-top: 32px; border-radius: 20px; background-size: 32px 32px; }
  .offers-feature__heading { gap: 18px; }
  .offers-feature__image { border-radius: 16px; }
}

@media (min-width: 1024px) {
  .world-card__title { min-height: 2.88em; }
  .world-card__body { min-height: 3.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  .global-home__hero h1, .global-home__hero p, .global-home__hero-actions, .global-home__hero-references { animation: none; }
  .global-home__hero-reference-track { animation: none; }
  .global-home-hero-word-enter-active, .global-home-hero-word-leave-active { transition: none; }
  .global-home__hero-orb, .project-teaser { transition: none; animation: none; transform: none; }
  .world-card__arrow, .world-card__cta-arrow { transition: none; }
  .world-card:hover .world-card__arrow, .world-card:hover .world-card__cta-arrow { transform: none; }
}
</style>
