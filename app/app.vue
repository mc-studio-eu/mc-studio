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
    },
    {
      innerHTML: `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="zPFlA8h8WoqD0uw2YSrfU";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`,
      type: 'text/javascript',
      tagPosition: 'bodyClose'
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
