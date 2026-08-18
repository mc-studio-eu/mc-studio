<script setup>
const localePath = useLocalePath()
const { t, locale } = useI18n()

const aiPrompt = computed(() => locale.value === 'fr'
  ? 'Que peux-tu me dire sur MC Studio (business.mc-studio.eu), son expertise et ses services ?'
  : 'What can you tell me about MC Studio (business.mc-studio.eu), its expertise and services?'
)

const aiAssistants = computed(() => {
  const prompt = encodeURIComponent(aiPrompt.value)

  return [
    {
      name: 'Gemini',
      icon: '/img/ai/gemini.svg',
      href: `https://www.google.com/search?udm=50&q=${prompt}`
    },
    {
      name: 'ChatGPT',
      icon: '/img/ai/chatgpt.svg',
      href: `https://chatgpt.com/?q=${prompt}`
    },
    {
      name: 'Perplexity',
      icon: '/img/ai/perplexity.svg',
      href: `https://www.perplexity.ai/search?q=${prompt}`
    },
    {
      name: 'Claude',
      icon: '/img/ai/claude.svg',
      href: `https://claude.ai/new?q=${prompt}`
    },
    {
      name: 'Grok',
      icon: '/img/ai/grok.svg',
      href: `https://grok.com/?q=${prompt}`
    }
  ]
})
</script>

<template>
  <footer id="footer" class="border-t border-[var(--border-subtle)] bg-[var(--bg-soft)] text-[var(--text-primary)]">
    <div class="max-w-[1280px] mx-auto px-6 md:px-8">
      
      <!-- Main Footer Content -->
      <div class="py-16 md:py-20">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          <!-- Brand Column -->
          <div class="md:col-span-5">
            <div class="flex items-center mb-6">
              <NuxtImg src="/img/logo/mc-studio.svg" alt="MC Studio Logo" class="w-[100px] h-auto invert" />
            </div>
            <p class="font-inter text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-[340px]">
              {{ t('footer.tagline') }}
            </p>

            <!-- Ask AI -->
            <div class="mt-8">
              <p class="font-inter text-sm font-medium text-white/70">
                {{ t('footer.ask_ai_title') }}
              </p>

              <div class="mt-3 flex flex-wrap gap-2">
                <a
                  v-for="assistant in aiAssistants"
                  :key="assistant.name"
                  :href="assistant.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group flex size-10 items-center justify-center rounded-sm bg-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0bf6c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  :aria-label="t('footer.ask_ai_aria', { provider: assistant.name })"
                  :title="assistant.name"
                >
                  <img
                    :src="assistant.icon"
                    alt=""
                    class="size-5 object-contain transition-transform duration-300 group-hover:scale-110"
                  >
                </a>
              </div>
            </div>
          </div>

          <!-- Navigation Column -->
          <div class="md:col-span-3">
            <h4 class="font-inter text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-readable)] mb-5">{{ t('footer.navigation_title') }}</h4>
            <nav class="flex flex-col gap-3">
              <NuxtLink :to="`${localePath('/')}#services`" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">{{ t('nav.services') }}</NuxtLink>
              <NuxtLink :to="`${localePath('/')}#projets`" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">{{ t('nav.projects') }}</NuxtLink>
              <NuxtLink :to="`${localePath('/')}#equipe`" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">{{ t('nav.team') }}</NuxtLink>
              <NuxtLink :to="`${localePath('/')}#contact`" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">{{ t('nav.contact') }}</NuxtLink>
            </nav>
          </div>

          <!-- Socials Column -->
          <div class="md:col-span-2">
            <h4 class="font-inter text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-readable)] mb-5">{{ t('footer.socials_title') }}</h4>
            <nav class="flex flex-col gap-3">
              <a href="https://www.linkedin.com/in/mohamed-chettah/" target="_blank" rel="noopener noreferrer" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">LinkedIn</a>
              <a href="https://www.instagram.com/mc_studio_eu/" target="_blank" rel="noopener noreferrer" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">Instagram</a>
              <a href="https://x.com/MohameDevWeb" target="_blank" rel="noopener noreferrer" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">X (Twitter)</a>
            </nav>
          </div>

          <!-- Contact Column -->
          <div class="md:col-span-2">
            <h4 class="font-inter text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-readable)] mb-5">{{ t('footer.contact_title') }}</h4>
            <nav class="flex flex-col gap-3">
              <a href="https://api.whatsapp.com/send/?phone=%2B33781724683" target="_blank" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">WhatsApp</a>
              <NuxtLink :to="`${localePath('/')}#contact`" class="font-inter text-sm text-[var(--text-secondary)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">{{ t('nav.book_call') }}</NuxtLink>
            </nav>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-[var(--border-subtle)] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="font-inter text-xs text-[var(--text-muted)]">&copy; {{ new Date().getFullYear() }} {{ t('footer.copyright') }}</p>
        <div class="flex items-center gap-6">
          <NuxtLink :to="localePath('/privacy')" class="font-inter text-xs text-[var(--text-muted)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">{{ $t('legal.links.privacy') }}</NuxtLink>
          <NuxtLink :to="localePath('/terms')" class="font-inter text-xs text-[var(--text-muted)] hover:text-[var(--color-gold-readable)] transition-colors no-underline">{{ $t('legal.links.terms') }}</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
