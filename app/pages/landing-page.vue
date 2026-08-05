<script setup lang="ts">
import ScreenMarquee from '../components/project/ScreenMarquee.vue'
import ServicesInterMarquee from '../components/services/ServicesInterMarquee.vue'

const { t } = useI18n()

// Landing pages and marketing sites only — this page sells that offer, not the apps
const landingScreens = [
  '/img/project/hero-raenergy.png',
  '/img/project/souji-nova-section.png',
  '/img/project/amgprom.png',
  '/img/project/how-it-work-ra.png',
  '/img/project/clinique-des-marques.png',
  '/img/project/souji-nova-desktop.png',
  '/img/project/fontaines-vtc-dark.jpeg',
  '/img/project/ra-energy-v2.png'
]

useHead({ title: t('landing_offer.meta.title') })

useSeoMeta({
  title: () => t('landing_offer.meta.title'),
  description: () => t('landing_offer.meta.description'),
  ogTitle: () => t('landing_offer.meta.title'),
  ogDescription: () => t('landing_offer.meta.description')
})
</script>

<template>
  <main class="main-container min-h-screen p-6 transition-colors duration-300">
    <LandingOfferHeroSection />
    <LandingOfferNavbar variant="floating" />

    <!-- Main Content with Border Frame -->
    <div class="relative mx-auto max-w-[1440px]">
      <div class="border-line absolute left-0 top-0 bottom-0 w-px xl:left-[50px]" />
      <div class="border-line absolute right-0 top-0 bottom-0 w-px xl:right-[50px]" />

      <!-- Screens of pages already shipped -->
      <ScreenMarquee :screens="landingScreens" class="mt-10" />

      <div class="section-separator mt-10" />

      <!-- Why landing pages fail -->
      <LandingOfferProblemSection />

      <div class="section-separator" />

      <!-- What a well-built page changes -->
      <LandingOfferBenefitsSection />

      <div class="section-separator" />

      <!-- Agency vs freelancer vs studio -->
      <LandingOfferComparisonSection />

      <div class="section-separator" />

      <ServicesInterMarquee />

      <div class="section-separator mt-10" />

      <!-- Everything included in the offer -->
      <LandingOfferIncludedSection />

      <div class="section-separator" />

      <!-- Landing pages already live -->
      <LandingOfferWorkSection />

      <div class="section-separator" />

      <!-- Client reviews -->
      <TestimonialSection id="avis" />

      <div class="section-separator" />

      <!-- 7 days, 4 steps -->
      <LandingOfferProcessSection />

      <div class="section-separator" />

      <!-- Fixed price -->
      <LandingOfferPricingSection />

      <div class="section-separator" />

      <!-- Risk reversal + mid-page CTA -->
      <LandingOfferGuaranteeSection />

      <div class="section-separator" />

      <!-- FAQ -->
      <LandingOfferFaqSection />

      <div class="section-separator" />

      <!-- Contact form + booking, prefilled with this offer -->
      <CtaSection default-project-type="Landing page" />

      <ScreenMarquee :screens="landingScreens" class="mb-10 sm:-mt-20" />
    </div>

    <FooterSection />

    <ScrollToTop />
  </main>
</template>

<style scoped>
.main-container {
  background-color: var(--bg-primary);
}

.border-line {
  background: linear-gradient(to bottom, var(--border-color) 0%, var(--border-color) 50%, transparent 100%);
}

.section-separator {
  height: 1px;
  margin: 0 auto 40px;
  max-width: calc(100% - 146px);
  background: linear-gradient(90deg, transparent 0%, var(--border-color) 20%, var(--border-color) 80%, transparent 100%);
}

@media (max-width: 1024px) {
  .section-separator {
    max-width: 100%;
  }
}

main > div > section,
main > section {
  scroll-margin-top: 80px;
}
</style>
