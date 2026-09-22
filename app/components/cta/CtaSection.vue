<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section id="contact" class="contact-section px-6 py-20">
    <div class="contact-container mx-auto">


      <iframe
        class="block w-full min-h-[700px] border-0"
        src="https://cal.com/mc-studio/discutons-de-votre-projet?embed=true&theme=dark"
        loading="lazy"
        :title="t('cta.calendar.iframe_title')"
      />
    </div>
  </section>
</template>

<style scoped>
.contact-section {
  background: #0f0f0f;
}

.contact-container {
  width: min(100%, 70rem);
}

@media (max-width: 420px) {
  .contact-intro h1 br {
    display: none;
  }
}
</style>
