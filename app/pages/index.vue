<script setup lang="ts">
// Auto-imports from Nuxt - no need to import components manually
import ServicesInterMarquee from "../components/services/ServicesInterMarquee.vue"
import ScreenMarquee from "../components/project/ScreenMarquee.vue";
</script>

<template>
  <main class="main-container min-h-screen p-6 transition-colors duration-300">
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Main Content with Border Frame -->
    <div class="relative mx-auto max-w-[1440px]">
      <!-- Left Border Line -->
      <div class="border-line absolute left-0 xl:left-[50px] top-0 bottom-0 w-px"></div>
      
      <!-- Right Border Line -->
      <div class="border-line absolute right-0 xl:right-[50px] top-0 bottom-0 w-px"></div>
      
      <!-- Projects Section -->
      <div class="section-separator"></div>
      <ProjectSection id="projets" />

      <div class="section-separator"></div>

      <ServicesInterMarquee />

      <div class="section-separator mt-10"></div>  
      
      <!-- Services Section -->
      <ServicesSection id="services" />

      <ScreenMarquee />

      <div class="section-separator mt-10"></div>

      <div class="section-separator"></div>

      <!-- Process Section -->
      <TeamSection />

      <div class="section-separator"></div>

      <ProcessSection id="process" />
       
      <div class="section-separator"></div>  
      
      <div class="section-separator"></div>
      
      <!-- Testimonials Section -->
      <TestimonialSection id="avis" />


      <div class="section-separator"></div>

      <ServicesInterMarquee />

      <div class="section-separator mt-10"></div>

      <!-- FAQ Section -->
      <FaqSection id="faq" />
  
      <div class="section-separator"></div>
      
      <div class="section-separator"></div>  
      
      <!-- CTA Section -->
      <CtaSection />

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
