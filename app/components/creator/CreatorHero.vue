<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative aspect-[1640/900] w-full overflow-hidden rounded-xl border border-[#ebebeb] bg-[#fafafa] max-md:aspect-auto max-md:min-h-[480px] max-sm:min-h-[calc(100svh-24px)]" aria-labelledby="home-title">
    <img class="pointer-events-none absolute inset-0 h-full w-full object-cover" src="/assets/creator/hero-bg.png" alt="" aria-hidden="true">
    <div class="relative z-10 flex min-h-full flex-col items-center justify-center gap-5 px-[clamp(18px,5vw,96px)] py-[clamp(56px,9vw,96px)] text-center">
      <MarkedTitle id="home-title">
        {{ t('home.hero.legacyLine1Prefix') }} <CreatorMark>{{ t('home.hero.legacyLine1Mark') }}</CreatorMark><br>
        {{ t('home.hero.legacyLine2Prefix') }} <CreatorMark>{{ t('home.hero.legacyLine2Mark') }}</CreatorMark> {{ t('home.hero.legacyLine2Suffix') }}
      </MarkedTitle>
      <p class="m-0 max-w-[640px] text-[clamp(14px,1.1vw,16px)] leading-[1.45] text-[var(--color-ink)]">
        {{ t('home.hero.legacySubtitleLine1') }}<br>
        {{ t('home.hero.legacySubtitleLine2') }}
      </p>
      <div class="flex w-full flex-wrap justify-center gap-x-3 gap-y-3">
        <CreatorButton to="/call">{{ t('common.bookCallShort') }}</CreatorButton>
        <CreatorButton to="/portfolio" variant="dark">{{ t('common.seePortfolio') }}</CreatorButton>
      </div>
    </div>
  </section>
</template>
