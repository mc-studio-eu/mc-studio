<script setup lang="ts">
const { locale } = useI18n()
const copy = computed(() => locale.value === 'fr' ? {
  title: 'Des sites qui rendent votre produit évident.',
  intro: 'Nous clarifions votre message, concevons l’expérience et développons un site prêt à convertir. De la stratégie à la mise en ligne, avec un seul partenaire.',
  explore: 'Explorer les offres',
  talk: 'Parlons de votre projet',
  offersTitle: 'Le bon format pour votre prochain cap.',
  offersIntro: 'Deux sprints, la même exigence : un site pensé autour de votre produit, de vos clients et de votre objectif de conversion.',
  includes: 'Ce que comprend le sprint',
  offers: [
    { index: '01', name: 'SaaS Landing Page Sprint', duration: '7 jours ouvrés', lead: 'Une page qui fait comprendre votre SaaS et donne envie de passer à l’action.', audience: 'Pour un lancement, un nouveau produit, une campagne ou une homepage à repenser.', scope: '1 landing page stratégique', features: ['Positionnement et proposition de valeur', 'Copywriting complet', 'UX/UI sur mesure et motion', 'Développement responsive', 'SEO technique, analytics et intégrations', '14 jours de support après lancement'] },
    { index: '02', name: 'SaaS Website Sprint', duration: '15 jours ouvrés', lead: 'Un système de pages cohérent avec ce qu’est devenu votre produit.', audience: 'Pour un SaaS qui grandit et doit mieux présenter ses fonctionnalités, cas d’usage et preuves.', scope: 'Jusqu’à 5 pages stratégiques', features: ['Stratégie du site et architecture des pages', 'Fondations de message et copywriting', 'UX/UI sur mesure et design system', 'Développement responsive et motion', 'SEO technique, analytics et intégrations', '30 jours de support après lancement'] }
  ],
  discoveryTitle: 'AI Discovery Layer',
  discoveryText: 'Une structure pensée pour que les moteurs de recherche et les agents IA comprennent ce que fait votre SaaS, à qui il s’adresse et quand le recommander.',
  processTitle: 'Une méthode simple, du premier échange au lancement.',
  steps: [
    { number: '01', title: 'Comprendre', text: 'Produit, clients, marché et objectif.' },
    { number: '02', title: 'Positionner', text: 'Message, structure et parcours de conversion.' },
    { number: '03', title: 'Créer', text: 'Copywriting et design sur mesure.' },
    { number: '04', title: 'Développer', text: 'Site responsive, motion et intégrations.' },
    { number: '05', title: 'Lancer', text: 'Vérifications, tracking et mise en ligne.' }
  ],
  ctaTitle: 'Votre SaaS mérite un site plus clair.',
  ctaText: 'Parlez-nous de votre produit et de vos objectifs. Nous définirons ensemble le sprint qui vous convient.',
  ctaAction: 'Réserver un premier échange'
} : {
  title: 'Websites that make your product click.',
  intro: 'We clarify your message, design the experience and build a website ready to convert. From strategy to launch, with one partner throughout.',
  explore: 'Explore the offers',
  talk: 'Let’s talk about your project',
  offersTitle: 'The right format for your next step.',
  offersIntro: 'Two sprints, one standard: a website built around your product, your customers and your conversion goal.',
  includes: 'What the sprint includes',
  offers: [
    { index: '01', name: 'SaaS Landing Page Sprint', duration: '7 business days', lead: 'One page that helps people understand your SaaS and take action.', audience: 'For a launch, a new product, a campaign or a homepage that needs a rethink.', scope: '1 strategic landing page', features: ['Positioning and value proposition', 'Complete copywriting', 'Custom UX/UI and motion', 'Responsive development', 'Technical SEO, analytics and integrations', '14 days of post-launch support'] },
    { index: '02', name: 'SaaS Website Sprint', duration: '15 business days', lead: 'A coherent system of pages that reflects what your product has become.', audience: 'For a growing SaaS that needs to explain its features, use cases and proof more clearly.', scope: 'Up to 5 strategic pages', features: ['Website strategy and page architecture', 'Messaging foundation and copywriting', 'Custom UX/UI and design system', 'Responsive development and motion', 'Technical SEO, analytics and integrations', '30 days of post-launch support'] }
  ],
  discoveryTitle: 'AI Discovery Layer',
  discoveryText: 'A structure designed to help search engines and AI agents understand what your SaaS does, who it serves and when to surface it.',
  processTitle: 'A clear path from first conversation to launch.',
  steps: [
    { number: '01', title: 'Understand', text: 'Product, customers, market and goal.' },
    { number: '02', title: 'Position', text: 'Messaging, structure and conversion journey.' },
    { number: '03', title: 'Create', text: 'Copywriting and custom design.' },
    { number: '04', title: 'Build', text: 'Responsive site, motion and integrations.' },
    { number: '05', title: 'Launch', text: 'QA, tracking and deployment.' }
  ],
  ctaTitle: 'Your SaaS deserves a clearer website.',
  ctaText: 'Tell us about your product and goals. Together, we’ll find the right sprint for you.',
  ctaAction: 'Book an introductory call'
})

const bookingUrl = 'https://cal.com/mc-studio/discutons-de-votre-projet'
useSeoMeta({
  title: () => locale.value === 'fr' ? 'Offres de sites web SaaS | MC Studio' : 'SaaS website offers | MC Studio',
  description: () => copy.value.intro,
  ogTitle: () => locale.value === 'fr' ? 'Offres de sites web SaaS | MC Studio' : 'SaaS website offers | MC Studio',
  ogDescription: () => copy.value.intro
})
</script>

<template>
  <main class="offer-page min-h-screen text-white">
    <StudioNavbar tone="dark" />

    <section class="offer-hero relative isolate overflow-hidden px-6 pb-24 pt-[clamp(96px,12vw,180px)] sm:pb-32" aria-labelledby="offer-title">
      <img class="offer-hero__clouds" src="/img/main/home-clouds.png" alt="" aria-hidden="true">
      <div class="offer-hero__shade" aria-hidden="true" />
      <div class="relative mx-auto max-w-[1216px]">
        <h1 id="offer-title" class="offer-hero__title max-w-[1000px]">{{ copy.title }}</h1>
        <div class="mt-9 flex flex-col gap-8 md:mt-12 md:flex-row md:items-end md:justify-between">
          <p class="max-w-[600px] text-[16px] leading-[1.7] text-white/65 sm:text-[18px]">{{ copy.intro }}</p>
          <div class="offer-hero__actions flex flex-wrap items-center gap-4">
            <a class="offer-button offer-button--light" href="#offres">{{ copy.explore }}</a>
            <a class="offer-button offer-button--outline" :href="bookingUrl" target="_blank" rel="noopener noreferrer">{{ copy.talk }}</a>
          </div>
        </div>
      </div>
    </section>

    <section id="offres" class="offer-section border-t border-white/10 px-6 py-20 sm:py-28" aria-labelledby="offers-title">
      <div class="mx-auto max-w-[1216px]">
        <div class="offer-section__heading">
          <div>
            <h2 id="offers-title" class="offer-section__title">{{ copy.offersTitle }}</h2>
            <p class="mt-5 max-w-[620px] text-[16px] leading-[1.7] text-white/55">{{ copy.offersIntro }}</p>
          </div>
        </div>

        <div class="offer-grid mt-14 sm:mt-16">
          <article v-for="offer in copy.offers" :key="offer.index" class="offer-card">
            <div class="offer-card__top">
              <span class="offer-card__index">{{ offer.index }} / 02</span>
              <span class="offer-card__duration">{{ offer.duration }}</span>
            </div>
            <h3 class="offer-card__title">{{ offer.name }}</h3>
            <p class="offer-card__lead">{{ offer.lead }}</p>
            <p class="offer-card__audience">{{ offer.audience }}</p>
            <div class="offer-card__scope">{{ offer.scope }}</div>
            <div class="offer-card__features">
              <p class="offer-card__features-label">{{ copy.includes }}</p>
              <ul>
                <li v-for="feature in offer.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>
            <a class="offer-button offer-button--light offer-card__cta" :href="bookingUrl" target="_blank" rel="noopener noreferrer">{{ copy.talk }}</a>
          </article>
        </div>

        <div class="offer-discovery mt-5">
          <div>
            <h3 class="offer-discovery__title">{{ copy.discoveryTitle }}</h3>
          </div>
          <p>{{ copy.discoveryText }}</p>
        </div>
      </div>
    </section>

    <section class="border-t border-white/10 px-6 py-20 sm:py-28" aria-labelledby="process-title">
      <div class="mx-auto max-w-[1216px]">
        <div class="offer-section__heading">
          <h2 id="process-title" class="offer-section__title max-w-[720px]">{{ copy.processTitle }}</h2>
        </div>
        <ol class="offer-process__list mt-14 sm:mt-16">
          <li v-for="step in copy.steps" :key="step.number">
            <span class="offer-process__number">{{ step.number }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="offer-cta border-t border-white/10 px-6 py-20 sm:py-28" aria-labelledby="cta-title">
      <div class="mx-auto flex max-w-[1216px] flex-col gap-9 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="cta-title" class="offer-section__title max-w-[760px]">{{ copy.ctaTitle }}</h2>
          <p class="mt-5 max-w-[600px] text-[16px] leading-[1.7] text-white/55">{{ copy.ctaText }}</p>
        </div>
        <a class="offer-button offer-button--light shrink-0" :href="bookingUrl" target="_blank" rel="noopener noreferrer">{{ copy.ctaAction }}</a>
      </div>
    </section>
    <FooterSection />
  </main>
</template>

<style scoped>
.offer-page { --bg-primary: #0f0f0f; --bg-secondary: #151515; --text-primary: #fff; --text-secondary: rgba(255,255,255,.6); --border-subtle: rgba(255,255,255,.12); background: #0f0f0f; }
.offer-hero__clouds { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; object-position: center 42%; opacity: .27; filter: grayscale(1); pointer-events: none; }
.offer-hero__shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(15,15,15,.7), rgba(15,15,15,.2)), linear-gradient(180deg, rgba(15,15,15,.2), #0f0f0f); pointer-events: none; }
.offer-hero__title { background: none; color: #fff; font: 500 clamp(48px,6.5vw,94px)/1.04 Manrope,sans-serif; letter-spacing: -.062em; -webkit-text-fill-color: #fff; text-wrap: balance; }
.offer-button { box-sizing: border-box; display: inline-flex; min-width: 225px; height: 44px; align-items: center; justify-content: center; border: 0; border-radius: 16px; padding: 0 18px; font: 600 15px/1 Inter,sans-serif; white-space: nowrap; text-decoration: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,.22),0 14px 34px rgba(0,0,0,.2); backdrop-filter: blur(18px); transition: background 220ms ease,color 220ms ease; }
.offer-button--light { background: rgba(255,255,255,.94); color: #171717; }
.offer-button--light:hover { background: #fff; }
.offer-button--outline { background: rgba(20,20,20,.72); color: #fff; }
.offer-button--outline:hover { background: rgba(31,31,31,.8); }
.offer-section { scroll-margin-top: 88px; }
.offer-section__heading { max-width: 760px; }
.offer-section__title { color: #fff; font: 500 clamp(34px,4vw,56px)/1.13 Manrope,sans-serif; letter-spacing: -.05em; text-wrap: balance; }
.offer-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; }
.offer-card { display: flex; min-width: 0; flex-direction: column; border: 1px solid rgba(255,255,255,.13); border-radius: 22px; padding: clamp(24px,3vw,38px); background: #171717; }
.offer-card__top { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
.offer-card__index { color: rgba(255,255,255,.4); font: 500 12px/1 Inter,sans-serif; letter-spacing: .12em; }
.offer-card__duration { color: rgba(255,255,255,.55); font: 500 12px/1 Inter,sans-serif; white-space: nowrap; }
.offer-card__title { margin-top: 48px; color: #fff; font: 500 clamp(28px,3vw,42px)/1.15 Manrope,sans-serif; letter-spacing: -.05em; text-wrap: balance; }
.offer-card__lead { max-width: 460px; margin-top: 17px; color: #fff; font: 400 clamp(16px,1.6vw,19px)/1.5 Inter,sans-serif; }
.offer-card__audience { min-height: 55px; margin-top: 16px; color: rgba(255,255,255,.52); font: 400 14px/1.6 Inter,sans-serif; }
.offer-card__scope { display: flex; align-items: center; gap: 11px; margin-top: 32px; border-top: 1px solid rgba(255,255,255,.12); padding-top: 25px; color: #fff; font: 600 14px/1.5 Inter,sans-serif; }
.offer-card__features { margin-top: 28px; }
.offer-card__features-label { color: rgba(255,255,255,.4); font: 600 11px/1.4 Inter,sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.offer-card__features ul { display: grid; gap: 13px; margin-top: 18px; }
.offer-card__features li { color: rgba(255,255,255,.72); font: 400 14px/1.5 Inter,sans-serif; }
.offer-card__features li::before { content: ''; display: inline-block; width: 4px; height: 4px; margin: 0 12px 3px 0; border-radius: 50%; background: rgba(255,255,255,.45); vertical-align: middle; }
.offer-card__cta { width: fit-content; margin-top: 32px; }
.offer-discovery { display: grid; grid-template-columns: minmax(0,.7fr) minmax(0,1.3fr); align-items: center; gap: 22px; border: 1px solid rgba(255,255,255,.12); border-radius: 18px; padding: clamp(24px,3vw,34px); background: #141414; }
.offer-discovery__title { color: #fff; font: 500 clamp(24px,2.4vw,32px)/1.2 Manrope,sans-serif; letter-spacing: -.04em; }
.offer-discovery > p { max-width: 610px; color: rgba(255,255,255,.58); font: 400 15px/1.7 Inter,sans-serif; }
.offer-process__list { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 18px; }
.offer-process__list li { border-top: 1px solid rgba(255,255,255,.2); padding-top: 20px; }
.offer-process__number { color: rgba(255,255,255,.42); font: 500 12px/1 Inter,sans-serif; }
.offer-process__list h3 { margin-top: 27px; color: #fff; font: 500 clamp(18px,1.8vw,23px)/1.25 Manrope,sans-serif; letter-spacing: -.035em; }
.offer-process__list p { margin-top: 10px; color: rgba(255,255,255,.5); font: 400 13px/1.6 Inter,sans-serif; }
.offer-cta { background: #111; }
.offer-page :deep(.studio-nav--dark.studio-nav--scrolled) { background: rgba(15,15,15,.96); }
.offer-page a:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }
@media (max-width: 900px) { .offer-discovery { grid-template-columns: 1fr; } .offer-process__list { grid-template-columns: repeat(3,minmax(0,1fr)); } }
@media (max-width: 640px) { .offer-hero__title { font-size: clamp(43px,10vw,62px); } .offer-grid { grid-template-columns: 1fr; } .offer-card__title { margin-top: 38px; } .offer-card__audience { min-height: 0; } .offer-process__list { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 30px 18px; } .offer-button { width: 100%; min-width: 0; } .offer-hero__actions { width: 100%; } .offer-card__cta { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .offer-button { transition: none; } }
</style>
