<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: t('legal.privacy.title').replace(/<[^>]*>/g, '') + ' | MC Studio',
  meta: [
    { name: 'description', content: t('legal.privacy.subtitle') }
  ]
})
</script>

<template>
  <main class="legal-page min-h-screen">
    <StudioNavbar tone="light" />

    <section class="mx-auto max-w-3xl px-5 pb-20 pt-[clamp(56px,8vw,112px)] sm:px-8">
      <div class="mb-12 text-center">
        <h1 class="legal-page__title mb-4 font-inter text-3xl font-medium tracking-[-0.04em] sm:text-4xl md:text-5xl" v-html="$t('legal.privacy.title')"></h1>
        <p class="legal-page__subtitle font-inter">{{ $t('legal.privacy.subtitle') }}</p>
      </div>
      
      <div class="legal-page__content prose max-w-none font-inter" v-html="$t('legal.privacy.content')"></div>
      
      <div class="mt-12 text-center">
        <NuxtLink :to="localePath('/')" class="legal-page__back inline-flex items-center gap-2 font-medium transition-colors">
          <UIcon name="i-heroicons-arrow-left" />
          {{ t('nav.book_call') === 'Book a call' ? 'Back to home' : 'Retour à l\'accueil' }}
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.legal-page { background: #fff; color: #171717; }
.legal-page__title :deep(.text-gradient) { background: none; color: #171717; -webkit-text-fill-color: currentColor; }
.legal-page__subtitle { color: #777; }
.legal-page__content { color: #454545; }
.legal-page__content :deep(h2) {
  color: #171717;
  font-family: Inter, sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}
.legal-page__content :deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.7;
}
.legal-page__content :deep(a) { color: #171717; }
.legal-page__back { color: #171717; }
.legal-page__back:hover { color: #777; }
</style>
