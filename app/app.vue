<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: computed(() => t('meta.title')),
  meta: [
    { name: 'description', content: computed(() => t('meta.description')) },
    { property: 'og:title', content: computed(() => t('meta.title')) },
    { property: 'og:description', content: computed(() => t('meta.description')) }
  ],
  script: [
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-0PT349TFG7',
      async: true,
      defer: true
    },
    {
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-0PT349TFG7');
      `,
      type: 'text/javascript'
    }
  ],
  htmlAttrs: {
    class: 'nuxt-ui-scrollbars',
  },
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
