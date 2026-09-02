<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <section id="contact" class="py-20 px-6 bg-[var(--bg-primary)] transition-colors duration-300">
    <div class="max-w-[1216px] mx-auto">
      <!-- Header -->
      <div class="text-center md:mb-0 mb-10">
          <h2 class="section-title contact-page__title font-manrope text-2xl sm:text-3xl md:text-[32px] font-semibold text-[var(--text-primary)] mb-4 transition-colors duration-300" v-html="t('cta.title')"></h2>
      </div>

      <!-- CTA with Cal.com -->
      <div class="flex justify-center">
        <div class="w-full max-w-full min-h-[700px] bg-transparent rounded-3xl overflow-hidden">
          <iframe
            src="https://cal.com/mc-studio/discutons-de-votre-projet?embed=true&theme=dark"
            style="width: 100%; height: 100%; min-height: 700px; border: none;"
            title="Réserver un appel découverte"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
</template>
