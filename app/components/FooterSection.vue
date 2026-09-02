<script setup>
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <footer id="footer" class="bg-[#111111] text-white">
    <div class="max-w-[1280px] mx-auto px-6 md:px-8">
      
      <!-- Main Footer Content -->
      <div class="py-16 md:py-20">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          <!-- Brand Column -->
          <div class="md:col-span-5">
            <div class="flex items-center mb-6">
              <NuxtImg src="/img/logo/mc-studio.svg" alt="MC Studio Logo" class="w-[100px] h-auto" />
            </div>
            <p class="font-inter text-[15px] text-white/60 leading-relaxed max-w-[340px]">
              {{ t('footer.tagline') }}
            </p>
          </div>

          <!-- Navigation Column -->
          <div class="md:col-span-3">
            <h4 class="font-inter text-xs font-semibold uppercase tracking-wider text-white/40 mb-5">{{ t('footer.navigation_title') }}</h4>
            <nav class="flex flex-col gap-3">
              <NuxtLink :to="localePath('/business')" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">Business</NuxtLink>
              <NuxtLink :to="localePath('/creators')" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">Creators</NuxtLink>
              <NuxtLink :to="localePath('/projects')" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">Projects</NuxtLink>
              <NuxtLink :to="localePath('/contact')" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">Contact</NuxtLink>
            </nav>
          </div>

          <!-- Socials Column -->
          <div class="md:col-span-2">
            <h4 class="font-inter text-xs font-semibold uppercase tracking-wider text-white/40 mb-5">{{ t('footer.socials_title') }}</h4>
            <nav class="flex flex-col gap-3">
              <a href="https://www.linkedin.com/in/mohamed-chettah/" target="_blank" rel="noopener noreferrer" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">LinkedIn</a>
              <a href="https://www.instagram.com/mc_studio_eu/" target="_blank" rel="noopener noreferrer" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">Instagram</a>
              <a href="https://x.com/MohameDevWeb" target="_blank" rel="noopener noreferrer" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">X (Twitter)</a>
            </nav>
          </div>

          <!-- Contact Column -->
          <div class="md:col-span-2">
            <h4 class="font-inter text-xs font-semibold uppercase tracking-wider text-white/40 mb-5">{{ t('footer.contact_title') }}</h4>
            <nav class="flex flex-col gap-3">
              <a href="https://api.whatsapp.com/send/?phone=%2B33781724683" target="_blank" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">WhatsApp</a>
              <NuxtLink :to="localePath('/contact')" class="font-inter text-sm text-white/70 hover:text-white transition-colors no-underline">{{ t('nav.book_call') }}</NuxtLink>
            </nav>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="font-inter text-xs text-white/40">&copy; {{ new Date().getFullYear() }} {{ t('footer.copyright') }}</p>
        <div class="flex items-center gap-6">
          <NuxtLink :to="localePath('/privacy')" class="font-inter text-xs text-white/40 hover:text-white/70 transition-colors no-underline">{{ $t('legal.links.privacy') }}</NuxtLink>
          <NuxtLink :to="localePath('/terms')" class="font-inter text-xs text-white/40 hover:text-white/70 transition-colors no-underline">{{ $t('legal.links.terms') }}</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
