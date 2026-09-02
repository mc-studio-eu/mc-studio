<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section
    class="mx-auto w-[min(1024px,calc(100%-40px))] pt-[clamp(32px,4vw,56px)] pb-[clamp(64px,9vw,112px)] text-[var(--color-ink)]"
    aria-labelledby="partnership-title"
  >
    <div class="grid items-center gap-[clamp(36px,6vw,72px)] lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <h2
          id="partnership-title"
          class="m-0 font-[Inter,var(--font-body)] text-[clamp(34px,5vw,58px)] font-normal leading-[1.08] tracking-[-0.045em]"
        >
          <CreatorMark variant="title" :delay="0.35">
            {{ t('home.partnership.title') }}
          </CreatorMark>
        </h2>

        <p class="m-0 mt-[clamp(24px,3.5vw,40px)] max-w-[650px] font-[Inter,var(--font-body)] text-[clamp(18px,2.2vw,24px)] leading-[1.5] tracking-[-0.02em] text-[var(--color-muted)]">
          {{ t('home.partnership.intro') }}
        </p>
      </div>

      <figure class="m-0 mx-auto w-full max-w-[390px]">
        <img
          class="block aspect-square w-full object-contain mix-blend-multiply"
          src="/assets/creator/partnership-visual.webp"
          :alt="t('home.partnership.visualAlt')"
          width="900"
          height="900"
          loading="lazy"
        >
      </figure>
    </div>

    <div class="mt-[clamp(48px,7vw,76px)] grid border-t border-black/15 md:grid-cols-2">
      <p class="m-0 border-b border-black/15 py-[clamp(28px,4vw,44px)] pr-0 text-[clamp(16px,1.8vw,20px)] leading-[1.6] md:border-r md:border-b-0 md:pr-[clamp(28px,4vw,48px)]">
        {{ t('home.partnership.workText') }}
      </p>
      <p class="m-0 py-[clamp(28px,4vw,44px)] text-[clamp(16px,1.8vw,20px)] leading-[1.6] md:pl-[clamp(28px,4vw,48px)]">
        {{ t('home.partnership.modelText') }}
      </p>
    </div>

    <footer class="flex flex-col gap-6 border-y border-black/15 py-[clamp(24px,3.5vw,36px)] sm:flex-row sm:items-end sm:justify-between">
      <p class="m-0 max-w-[610px] text-[clamp(15px,1.6vw,18px)] leading-[1.55] text-[var(--color-muted)]">
        {{ t('home.partnership.eligibilityText') }}
      </p>
      <strong class="shrink-0 text-[clamp(38px,5vw,60px)] font-normal leading-none tracking-[-0.055em] text-[#7c3aed]">
        +150k
      </strong>
    </footer>
  </section>
</template>
