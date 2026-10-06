<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => `Contact | MC Studio`,
  description: () => t('cta.subtitle'),
  ogTitle: () => `Contact | MC Studio`,
  ogDescription: () => t('cta.subtitle')
})
</script>

<template>
  <main class="contact-page min-h-screen bg-[#0f0f0f] text-white">
    <StudioNavbar tone="dark" />
    <CtaSection>
      <div class="flex justify-center pb-6 pt-4">
        <a
          href="https://api.whatsapp.com/send/?phone=%2B33781724683"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#232323] px-6 py-3 font-inter text-sm font-medium text-white no-underline transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-[#0f0f0f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]"
        >
          <UIcon name="i-lucide-message-circle" class="size-5" aria-hidden="true" />
          {{ t('hero.cta.whatsapp') }}
        </a>
      </div>
    </CtaSection>
    <TestimonialSection :show-intro="false" />
    <FooterSection />
  </main>
</template>

<style scoped>
.contact-page {
  --bg-primary: #0f0f0f;
  --bg-secondary: #171717;
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.62);
  --border-subtle: rgba(255, 255, 255, 0.12);
  --color-gold: #f0bf6c;
}

.contact-page :deep(.contact-page__title),
.contact-page :deep(.text-gradient) {
  background: none;
  color: var(--text-primary);
  -webkit-text-fill-color: currentColor;
}

.contact-page :deep(#contact) {
  padding-top: clamp(1.25rem, 2.5vw, 2.25rem);
  padding-bottom: clamp(0.5rem, 1.5vw, 1rem);
}

.contact-page :deep(#avis) {
  padding-top: clamp(0.5rem, 1.5vw, 1rem);
}

</style>
