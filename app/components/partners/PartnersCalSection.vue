<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section
    id="partner-cal"
    class="py-16 px-0 sm:px-4 bg-[var(--bg-primary)] transition-colors duration-300"
  >
    <div class="max-w-[1216px] mx-auto px-4 sm:px-0">
      <div class="text-center md:mb-0 mb-10">
        <p class="font-inter text-[11px] uppercase tracking-[0.16em] text-[var(--color-gold)]">
          {{ t('partners.cal.eyebrow') }}
        </p>
        <h2
          class="section-title font-manrope text-2xl sm:text-3xl md:text-[32px] font-medium text-[var(--text-primary)] mb-4 transition-colors duration-300"
        >
          {{ t('partners.cal.title') }}
        </h2>
        <p
          class="font-inter text-sm sm:text-base text-[var(--text-secondary)] max-w-[720px] mx-auto transition-colors duration-300"
        >
          {{ t('partners.cal.subtitle') }}
        </p>
      </div>

      <div class="flex justify-center">
        <div
          class="w-full max-w-full min-h-[700px] bg-transparent rounded-3xl overflow-hidden"
        >
          <iframe
            src="https://cal.com/mc-studio/discutons-de-votre-projet?embed=true&theme=dark"
            style="width: 100%; height: 100%; min-height: 700px; border: none"
            :title="t('partners.cal.iframe_title')"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
</template>
