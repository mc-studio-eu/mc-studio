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
    <CtaSection />
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
  padding-top: clamp(3.5rem, 8vw, 7rem);
  padding-bottom: clamp(4rem, 9vw, 8rem);
}

.contact-page :deep(.contact-card) {
  border-color: var(--border-subtle);
  background: var(--bg-secondary);
}

</style>
