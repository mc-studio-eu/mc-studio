<script setup lang="ts">
import frCreator from '../../i18n/locales/fr-creator.json'
import enCreator from '../../i18n/locales/en-creator.json'
import CreatorServicesMarquee from "../components/creator/CreatorServicesMarquee.vue"
import ScreenMarquee from "../components/project/ScreenMarquee.vue"

// Override i18n messages for this page with creator-specific content
const { mergeLocaleMessage } = useI18n()
mergeLocaleMessage('fr', frCreator)
mergeLocaleMessage('en', enCreator)

// SEO
const { t } = useI18n()
useHead({
  title: t('meta.title')
})

useSeoMeta({
  title: t('meta.title'),
  description: t('meta.description'),
  ogTitle: t('meta.title'),
  ogDescription: t('meta.description')
})

// Cleanup: restore original messages on unmount
import frOriginal from '../../i18n/locales/fr.json'
import enOriginal from '../../i18n/locales/en.json'

// Cream theme is applied by the force-dark-mode plugin (route-aware)
useHead({
  bodyAttrs: {
    style: 'background-color: #F8F6F1;'
  }
})

onUnmounted(() => {
  mergeLocaleMessage('fr', frOriginal)
  mergeLocaleMessage('en', enOriginal)
})
</script>

<template>
  <main class="main-container min-h-screen p-6 transition-colors duration-300">
    <!-- Hero Section -->
    <CreatorHeroSection />
    
    <!-- Main Content with Border Frame -->
    <div class="relative mx-auto max-w-[1440px]">
      <!-- Left Border Line -->
      <div class="border-line absolute left-0 xl:left-[50px] top-0 bottom-0 w-px"></div>
      
      <!-- Right Border Line -->
      <div class="border-line absolute right-0 xl:right-[50px] top-0 bottom-0 w-px"></div>
      
      <!-- Pitch Section — Why creators need an app -->
      <div class="section-separator"></div>
      <CreatorPitchSection />

      <!-- Case Study — Maison AWL -->
      <div class="section-separator"></div>
      <CreatorCaseStudySection />

      <!-- Concepts par profil -->
      <div class="section-separator"></div>
      <CreatorConceptsSection />

      <div class="section-separator"></div>

      <CreatorServicesMarquee />

      <div class="section-separator mt-10"></div>

      <!-- Services / Accompagnement Section -->
      <CreatorServicesSection />

      <!-- Bénéfices -->
      <div class="section-separator"></div>
      <CreatorBenefitsSection />

      <ScreenMarquee />

      <div class="section-separator mt-10"></div>

      <!-- Projects Section -->
      <div class="section-separator"></div>
      <CreatorProjectSection id="projets" />

      <div class="section-separator"></div>

      <!-- Team Section -->
      <CreatorTeamSection />

      <div class="section-separator"></div>

      <!-- Process Section -->
      <CreatorProcessSection />
       
      <div class="section-separator"></div>  
      
      <div class="section-separator"></div>
      
      <!-- Testimonials Section -->
      <CreatorTestimonialSection />


      <div class="section-separator"></div>

      <CreatorServicesMarquee />

      <div class="section-separator mt-10"></div>

      <!-- FAQ Section -->
      <CreatorFaqSection />
  
      <div class="section-separator"></div>
      
      <div class="section-separator"></div>  
      
      <!-- CTA Section -->
      <CreatorCtaSection />

      <ScreenMarquee class="mb-10 sm:-mt-20"/>
    </div>
    
    <!-- Footer -->
    <FooterSection />

    <!-- Scroll to Top Button -->
    <ScrollToTop />
  </main>
</template>

<style scoped>
/* Main container */
.main-container {
  background-color: var(--bg-primary);
}

/* Border lines */
.border-line {
  background: linear-gradient(to bottom, var(--border-color) 0%, var(--border-color) 50%, transparent 100%);
}

:global(.dark) .border-line {
  background: linear-gradient(to bottom, rgba(240, 191, 108, 0.4) 0%, rgba(240, 191, 108, 0.2) 50%, transparent 100%);
}

:global(.light) .border-line {
  background: linear-gradient(to bottom, rgba(26, 26, 26, 0.15) 0%, rgba(26, 26, 26, 0.08) 50%, transparent 100%);
}

/* Section separator line */
.section-separator {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--border-color) 20%, var(--border-color) 80%, transparent 100%);
  margin-bottom: 40px;
  margin-left: auto;
  margin-right: auto;
  max-width: calc(100% - 146px);
}

:global(.dark) .section-separator {
  background: linear-gradient(90deg, transparent 0%, rgba(240, 191, 108, 0.25) 20%, rgba(240, 191, 108, 0.25) 80%, transparent 100%);
}

:global(.light) .section-separator {
  background: linear-gradient(90deg, transparent 0%, rgba(26, 26, 26, 0.12) 20%, rgba(26, 26, 26, 0.12) 80%, transparent 100%);
}

@media (max-width: 1024px) {
  .section-separator {
    max-width: 100%;
  }
}

/* Section spacing */
main > div > section,
main > section {
  scroll-margin-top: 80px;
}
</style>
