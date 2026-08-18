<script setup lang="ts">
const language = computed({
  get: () => locale.value.toUpperCase(),
  set: (value) => setLocale(value.toLowerCase() as 'en' | 'fr')
})
const localePath = useLocalePath()
const { t, locale, setLocale } = useI18n()
const config = useRuntimeConfig()
const platformUrl = computed(() => String(config.public.partnerPlatformUrl || ''))


const languages = [
  { label: 'FR', value: 'FR' },
  { label: 'EN', value: 'EN' }
]

const partnerNavItems = [
  { label: 'Principe', href: '#principe' },
  { label: 'Pourquoi', href: '#pourquoi' },
  { label: 'Suivi', href: '#suivi' },
  { label: 'FAQ', href: '#faq-partner' }
]
</script>

<template>
  <header
    class="flex items-center justify-between gap-0 pt-6 px-4 md:pt-12 md:px-5 lg:gap-12 w-full max-w-[900px] mx-auto"
  >
    <!-- Logo -->
    <div class="flex items-center shrink-0">
      <NuxtLink to="/" class="flex items-center">
        <NuxtImg
          src="/img/logo/mc-studio.svg"
          alt="MC Studio"
          class="w-[100px] h-auto md:w-[125px] object-contain"
        />
      </NuxtLink>
    </div>

    <!-- Nav desktop -->
    <nav class="hidden lg:flex items-center gap-[26px]">
      <a
        v-for="item in partnerNavItems"
        :key="item.label"
        :href="item.href"
        class="font-inter font-medium text-sm text-white no-underline transition-colors duration-200 hover:text-[#f0bf6c]"
      >
        {{ item.label }}
      </a>
    </nav>

    <!-- Right side: language + CTA -->
    <div class="hidden lg:flex items-center gap-[11px] shrink-0">
      <USelect
        v-model="language"
        :items="languages"
        class="flex items-center justify-center w-[70px] h-[30px] bg-[#010201] rounded-lg font-inter font-medium text-xs text-[#f0eadb] cursor-pointer backdrop-blur-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_10px_10px_rgba(11,32,103,0.05)] transition-all duration-200 hover:bg-[#1a1a1a]"
      />

    <!-- CTA Desktop -->
    <div class="hidden lg:flex items-center gap-[11px] shrink-0">
      <a
        ref="initialCtaBtn"
        :href="platformUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center w-full px-6 h-[30px] bg-[linear-gradient(to_right,white_50%,#f0bf6c)] border-none rounded-lg font-inter font-medium text-sm text-[#0f0f0f] cursor-pointer backdrop-blur-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_10px_10px_rgba(11,32,103,0.05)] transition-all duration-200 hover:brightness-105 no-underline"
      >
        <span class="text-slide-container h-[20px]">
          <span ref="initialCtaWrapper" class="text-slide-wrapper">
            <span class="text-slide-text h-[20px] leading-[20px]">{{ t('partners.nav.cta') }}</span>
          </span>
        </span>
      </a>
    </div>
    </div>
  </header>
</template>
