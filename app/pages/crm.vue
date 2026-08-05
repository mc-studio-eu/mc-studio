<script setup lang="ts">
import ScreenMarquee from '../components/project/ScreenMarquee.vue'
import ServicesInterMarquee from '../components/services/ServicesInterMarquee.vue'

const { t } = useI18n()

// Screens of business tools shipped by the studio, instead of the marketing pages
// shown on the landing page offer.
const crmScreens = [
  '/img/project/crm-ra/crm-hero-mockup.png',
  '/img/project/crm-ra/crm-dashboard.png',
  '/img/project/crm-ra/crm-prospects.png',
  '/img/project/crm-ra/crm-planning.png',
  '/img/project/crm-ra/crm-carte.png',
  '/img/project/crm-ra/crm-equipe.png',
  '/img/project/arises-saas.png',
  '/img/project/arises-login.png'
]

useHead({ title: t('crm_offer.meta.title') })

useSeoMeta({
  title: () => t('crm_offer.meta.title'),
  description: () => t('crm_offer.meta.description'),
  ogTitle: () => t('crm_offer.meta.title'),
  ogDescription: () => t('crm_offer.meta.description')
})
</script>

<template>
  <main class="main-container min-h-screen p-6 transition-colors duration-300">
    <CrmHeroSection />
    <CrmNavbar variant="floating" />

    <!-- Main Content with Border Frame -->
    <div class="relative mx-auto max-w-[1440px]">
      <div class="border-line absolute left-0 top-0 bottom-0 w-px xl:left-[50px]" />
      <div class="border-line absolute right-0 top-0 bottom-0 w-px xl:right-[50px]" />

      <!-- Screens of tools already shipped -->
      <ScreenMarquee class="mt-10" :screens="crmScreens" />

      <div class="section-separator mt-10" />

      <!-- Why CRMs end up unused -->
      <CrmProblemSection />

      <div class="section-separator" />

      <!-- What a tool built for you changes -->
      <CrmBenefitsSection />

      <div class="section-separator" />

      <!-- Off-the-shelf vs no-code vs custom -->
      <CrmComparisonSection />

      <div class="section-separator" />

      <ServicesInterMarquee />

      <div class="section-separator mt-10" />

      <!-- Everything included in the offer -->
      <CrmIncludedSection />

      <div class="section-separator" />

      <!-- Business tools already in production -->
      <CrmWorkSection />

      <div class="section-separator" />

      <!-- Client reviews -->
      <TestimonialSection id="avis" />

      <div class="section-separator" />

      <!-- Framing, mockups, batches, go-live -->
      <CrmProcessSection />

      <div class="section-separator" />

      <!-- Quote after framing -->
      <CrmPricingSection />

      <div class="section-separator" />

      <!-- Risk reversal + mid-page CTA -->
      <CrmGuaranteeSection />

      <div class="section-separator" />

      <!-- FAQ -->
      <CrmFaqSection />

      <div class="section-separator" />

      <!-- Contact form + booking -->
      <CtaSection />

      <ScreenMarquee class="mb-10 sm:-mt-20" :screens="crmScreens" />
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
