<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative w-full overflow-hidden bg-[#c9baf2]" aria-labelledby="cta-title">
    <img
      class="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src="/assets/creator/purple-texture.png"
      alt=""
      aria-hidden="true"
    >

    <div class="relative z-10 mx-auto flex w-[min(1200px,calc(100%-40px))] flex-col items-center pt-[clamp(44px,5vw,64px)]">
      <h2
        id="cta-title"
        class="m-0 text-balance text-center font-[Inter,var(--font-body)] text-[clamp(28px,4.4vw,58px)] font-medium leading-[1.17] tracking-[-0.02em] text-black"
      >
        {{ t('home.cta.titleLine1') }}<br>{{ t('home.cta.titleLine2') }}
      </h2>

      <div class="mt-[clamp(20px,2.5vw,34px)] flex flex-wrap justify-center gap-3">
        <CreatorButton to="/contact">{{ t('common.bookCall') }}</CreatorButton>
        <CreatorButton to="/projects" variant="dark">{{ t('common.seePortfolio') }}</CreatorButton>
      </div>
    </div>

    <div
      class="radar relative z-0 mx-auto mt-0 h-[clamp(260px,26.4vw,380px)] w-[min(1120px,100%)] overflow-hidden"
      aria-hidden="true"
    >
      <svg
        class="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 1120 380"
        fill="none"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="rgba(124,58,237,0.32)" stroke-width="1">
          <circle cx="560" cy="350" r="350" />
          <circle cx="560" cy="350" r="285" />
          <circle cx="560" cy="350" r="220" />
          <circle cx="560" cy="350" r="155" />
          <circle cx="560" cy="350" r="90" />
        </g>
      </svg>

    </div>
  </section>
</template>

<style scoped>
@media (max-width: 640px) {
  .radar {
    width: 100%;
  }
}
</style>
