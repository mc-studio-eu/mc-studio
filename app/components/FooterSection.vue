<script setup lang="ts">
const localePath = useLocalePath()
const { locale, t } = useI18n()
const isFrench = computed(() => locale.value === 'fr')
const links = computed(() => [
  { path: '/projects', label: isFrench.value ? 'Réalisations' : 'Work' },
  { path: '/expertises', label: isFrench.value ? 'Expertises' : 'Expertise' },
  { path: '/a-propos', label: isFrench.value ? 'Le studio' : 'The studio' },
  { path: '/contact', label: 'Contact' },
])
</script>

<template>
  <footer id="footer" class="studio-footer">
    <div class="studio-footer__inner">
      <div class="studio-footer__main">
        <div class="studio-footer__brand">
          <NuxtLink :to="localePath('/')">
            <img src="/img/logo/mc-studio.svg" alt="MC Studio" width="148" height="27" loading="lazy">
          </NuxtLink>
          <p>{{ isFrench ? 'Studio indépendant de développement logiciel.' : 'Independent software development studio.' }}</p>
          <a href="mailto:contact@mc-studio.eu">contact@mc-studio.eu</a>
        </div>
        <nav class="studio-footer__links" :aria-label="isFrench ? 'Navigation de pied de page' : 'Footer navigation'">
          <NuxtLink v-for="link in links" :key="link.path" :to="localePath(link.path)">
            {{ link.label }}
          </NuxtLink>
        </nav>
        <nav class="studio-footer__links" :aria-label="isFrench ? 'Réseaux sociaux' : 'Social media'">
          <a href="https://www.linkedin.com/in/mohamed-chettah/" target="_blank" rel="noopener noreferrer">LinkedIn <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></a>
          <a href="https://www.instagram.com/mc_studio_eu/" target="_blank" rel="noopener noreferrer">Instagram <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></a>
          <a href="https://x.com/MohameDevWeb" target="_blank" rel="noopener noreferrer">X <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></a>
        </nav>
      </div>
      <img class="studio-footer__signature" src="/img/logo/mc-studio.svg" alt="" width="1260" height="230" loading="lazy" aria-hidden="true">
      <div class="studio-footer__legal">
        <span>© {{ new Date().getFullYear() }} MC Studio</span>
        <NuxtLink :to="localePath('/privacy')">{{ t('legal.links.privacy') }}</NuxtLink>
        <NuxtLink :to="localePath('/terms')">{{ t('legal.links.terms') }}</NuxtLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.studio-footer { background: #0d0d0c; border-top: 1px solid #ffffff25; color: #f5f3ee; font-family: 'Host Grotesk', sans-serif; }
.studio-footer__inner { width: min(1320px, calc(100% - 80px)); margin-inline: auto; }
.studio-footer__main { display: grid; grid-template-columns: 2fr 1fr .65fr; gap: 42px; padding-block: clamp(54px, 7vw, 95px); }
.studio-footer__brand p { margin: 20px 0 10px; color: #c0bcb4; font-size: .875rem; }
.studio-footer__brand > a:last-child { display: inline-flex; align-items: center; min-height: 44px; }
.studio-footer__brand img { height: auto; }
.studio-footer__links { display: grid; align-content: start; }
.studio-footer__links a { display: inline-flex; align-items: center; gap: 8px; width: fit-content; min-height: 44px; }
.studio-footer__links span { width: .8rem; height: .8rem; color: #f0bf6c; }
.studio-footer a { transition: color .2s ease; }
.studio-footer a:hover { color: #f0bf6c; }
.studio-footer a:focus-visible { outline: 2px solid #f0bf6c; outline-offset: 4px; }
.studio-footer__signature { width: 100%; height: auto; opacity: .13; margin-bottom: clamp(22px, 3vw, 42px); }
.studio-footer__legal { display: flex; flex-wrap: wrap; align-items: center; gap: 0 24px; border-top: 1px solid #ffffff25; padding-block: 11px; color: #b0aca5; font-size: .8rem; }
.studio-footer__legal span { margin-right: auto; }
.studio-footer__legal a { display: inline-flex; align-items: center; min-height: 44px; }
@media (max-width: 700px) {
  .studio-footer__inner { width: calc(100% - 40px); }
  .studio-footer__main { grid-template-columns: 1fr 1fr; gap: 24px; }
  .studio-footer__brand { grid-column: 1 / -1; }
  .studio-footer__legal { gap: 0 16px; }
  .studio-footer__legal span { flex-basis: 100%; padding-top: 9px; }
}
@media (prefers-reduced-motion: reduce) { .studio-footer a { transition: none; } }
</style>
