<script setup lang="ts">
import { usePortalTheme } from '~/composables/usePortalTheme'

const { t } = useI18n()
const route = useRoute()
const { theme: portalTheme } = usePortalTheme()
const isPortal = computed(() => /^\/(?:en\/)?portal(?:\/|$)/.test(route.path))

useHead(() => ({
  title: computed(() => t('meta.title')),
  meta: [
    { name: 'description', content: computed(() => t('meta.description')) },
    { property: 'og:title', content: computed(() => t('meta.title')) },
    { property: 'og:description', content: computed(() => t('meta.description')) }
  ],
  script: isPortal.value ? [] : [
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
    'data-portal-theme': isPortal.value ? portalTheme.value : undefined,
  },
}));
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
