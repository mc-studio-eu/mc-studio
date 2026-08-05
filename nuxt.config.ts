// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/image', '@nuxtjs/i18n', 'nuxt-simple-sitemap'],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    resendApiKey: '',
    contactFrom: 'MC Studio <contact@mc-studio.eu>',
    contactTo: 'contact@mc-studio.eu',
    public: {
      partnerPlatformUrl:
        process.env.NUXT_PUBLIC_PARTNER_PLATFORM_URL || 'https://app.mc-studio.eu'
    }
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: "MC Studio | Agence de développement d'apps pour créateurs",
      htmlAttrs: {
        lang: 'fr'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: "L'agence qui développe les apps des créateurs de contenu. Design, développement web & mobile sur mesure." },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:title', content: "MC Studio | Agence de développement d'apps pour créateurs" },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://www.mc-studio.eu' },
        { property: 'og:image', content: 'https://www.mc-studio.eu/hero.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-new.png' },
        { rel: 'shortcut icon', type: 'image/png', href: '/favicon-new.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
    storage: 'localStorage',
    // The site used to force dark mode into 'nuxt-color-mode' on every load, so returning
    // visitors carry a stored 'dark' they never chose. Reading from a new key retires that
    // value and lets everyone land on the light default; the toggle persists under this key.
    storageKey: 'mc-color-mode',
  },
  i18n: {
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'fr', file: 'fr.json' }
    ],
    langDir: 'locales',
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    vueI18n: './i18n.config.ts',
    compilation: {
      strictMessage: false
    },
    // Always serve the default French locale on a visitor's first visit.
    // Visitors can still switch to English explicitly from the language selector.
    detectBrowserLanguage: false
  },
  gsap: {
    composables: true,
    provide: false,
    extraPlugins: {
      scrollTrigger: true,
      motionPath: true
    },
  },
})
