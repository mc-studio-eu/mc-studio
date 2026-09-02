<script setup lang="ts">
import frCreatorWorld from '../../i18n/locales/fr-creator-world.json'
import enCreatorWorld from '../../i18n/locales/en-creator-world.json'
import frOriginal from '../../i18n/locales/fr.json'
import enOriginal from '../../i18n/locales/en.json'

const { locale, mergeLocaleMessage, t } = useI18n()

mergeLocaleMessage('fr', { home: frCreatorWorld.home, common: frCreatorWorld.common })
mergeLocaleMessage('en', { home: enCreatorWorld.home, common: enCreatorWorld.common })

useSeoMeta({
  title: () => t('home.seo.title'),
  description: () => t('home.seo.description'),
  ogTitle: () => t('home.seo.ogTitle'),
  ogDescription: () => t('home.seo.ogDescription')
})

onUnmounted(() => {
  mergeLocaleMessage('fr', frOriginal)
  mergeLocaleMessage('en', enOriginal)
})
</script>

<template>
  <main class="creator-world min-h-screen bg-[#fcfcfd] text-[var(--color-ink)]">
    <StudioNavbar tone="light" universe="creator" />

    <div class="mx-auto w-[calc(100%_-_40px)] py-[18px] max-sm:w-[calc(100%_-_28px)] max-sm:py-3">
      <div class="flex w-full flex-col overflow-clip rounded-xl border border-[var(--color-border)] bg-[#fff]">
        <section class="flex min-h-[calc(100svh-124px)] w-full items-stretch max-sm:min-h-[calc(100svh-112px)]">
          <div class="relative flex min-h-full w-full flex-1 flex-col overflow-hidden bg-[#fff]">
            <img class="pointer-events-none absolute inset-0 h-full w-full object-cover" src="/assets/creator/hero-bg.png" alt="" aria-hidden="true">

            <div class="relative z-10 mx-auto flex w-[min(1120px,calc(100%-64px))] flex-1 flex-col items-center justify-center py-[clamp(100px,12svh,150px)] text-center max-sm:w-[calc(100%-32px)] max-sm:py-20">
              <h1 class="hero-title hero-anim hero-anim--title m-0 w-full max-w-[980px] font-[var(--font-display)] text-[clamp(34px,4.2vw,64px)] font-normal leading-[1.08] tracking-[-0.015em] text-[var(--color-ink)] max-sm:text-[clamp(20px,6.4vw,34px)]">
                <span class="block whitespace-nowrap max-sm:whitespace-normal">{{ t('home.hero.line1Prefix') }} <CreatorMark :delay="0.55">{{ t('home.hero.line1Mark') }}</CreatorMark> {{ t('home.hero.line1Suffix') }}</span>
                <span class="block whitespace-nowrap max-sm:whitespace-normal">{{ t('home.hero.line2Prefix') }} <CreatorMark :delay="1.35">{{ t('home.hero.line2Mark') }}</CreatorMark></span>
              </h1>

              <p class="hero-anim hero-anim--subtitle m-0 mt-[31px] max-w-[900px] text-[clamp(14px,1.32vw,19px)] leading-[1.28] text-[var(--color-muted)] max-sm:mt-6 max-sm:max-w-[520px] max-sm:text-[15px] max-sm:leading-[1.5]">
                {{ t('home.hero.subtitleLine1') }}<br>
                {{ t('home.hero.subtitleLine2') }}<br>
                {{ t('home.hero.subtitleLine3') }}
              </p>

              <div class="hero-anim hero-anim--ctas mt-[34px] flex w-full flex-wrap justify-center gap-3 max-sm:mt-7 max-sm:flex-nowrap max-sm:gap-2">
                <CreatorButton class="max-sm:min-w-0 max-sm:px-3" to="/contact">{{ t('common.bookCall') }}</CreatorButton>
                <CreatorButton class="max-sm:min-w-0 max-sm:px-3" to="/projects" variant="dark">{{ t('common.seePortfolio') }}</CreatorButton>
              </div>
            </div>

            <div class="hero-anim hero-anim--social relative z-20 mx-auto flex w-[min(1120px,calc(100%-64px))] shrink-0 justify-center pb-[clamp(20px,4svh,40px)] max-sm:w-[calc(100%-32px)]">
              <CreatorSocialProof />
            </div>
          </div>
        </section>

        <CreatorManifestoBand class="mt-[clamp(24px,3vw,40px)]" />
        <CreatorWorldProcessSection />
        <CreatorPartnershipSection />
        <CreatorCtaBand class="mt-[clamp(32px,4vw,56px)]" />
        <FooterSection />
      </div>
    </div>
  </main>
</template>

<style scoped>
.creator-world {
  --color-paper: #fcfcfd;
  --color-paper-soft: #f9f9f9;
  --color-ink: #1f1f1f;
  --color-muted: #6c6874;
  --color-border: #ebebeb;
  --color-purple: #a375f2;
  --color-purple-strong: #a375f2;
  --color-purple-mark: rgba(124, 58, 237, 0.44);
  --font-display: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-body: Arial, Inter, ui-sans-serif, system-ui, sans-serif;
  --radius-frame: 12px;
  --shadow-button: 0 4px 4px rgba(0,0,0,.25), 0 10px 10px rgba(11,32,103,.05), 0 1px 3px rgba(11,32,103,.14), 0 36px 48px rgba(0,0,0,.03);
  font-family: var(--font-body);
}
.hero-title { font-family: Inter, "Helvetica Neue", Arial, sans-serif; }
.creator-world :global(h1) { background: none !important; color: var(--color-ink) !important; -webkit-text-fill-color: var(--color-ink) !important; }
.hero-anim--ctas :deep(.creator-button) { min-width: 138px; min-height: 36px; border-radius: 6px; padding-inline: 16px; font-size: 12px; font-weight: 500; }
@keyframes hero-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.hero-anim { opacity: 0; animation: hero-fade-up .7s cubic-bezier(.22,1,.36,1) forwards; }
.hero-anim--title { animation-delay: .16s; }
.hero-anim--subtitle { animation-delay: .4s; }
.hero-anim--ctas { animation-delay: .6s; }
.hero-anim--social { animation-delay: .8s; }
.hero-title :deep(.hl) { white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .hero-anim { opacity: 1; animation: none; } }
@media (max-width: 640px) {
  .hero-title :deep(.hl) { white-space: normal; }
  .hero-anim--ctas :deep(.creator-button) { min-width: 0; min-height: 36px; border-radius: 6px; padding-inline: 12px; font-size: 12px; }
}
</style>
