<script setup lang="ts">
const props = withDefaults(defineProps<{
  tone?: 'dark' | 'light'
  overlay?: boolean
  universe?: 'studio' | 'business' | 'creator'
}>(), { tone: 'dark', overlay: false, universe: 'studio' })

const route = useRoute()
const localePath = useLocalePath()
const { locale } = useI18n()
const isFrench = computed(() => locale.value === 'fr')
const isOpen = ref(false)
const menuToggle = ref<HTMLButtonElement>()
const links = computed(() => [
  { path: '/projects', label: isFrench.value ? 'Réalisations' : 'Work' },
  { path: '/expertises', label: isFrench.value ? 'Expertises' : 'Expertise' },
  { path: '/a-propos', label: isFrench.value ? 'Le studio' : 'The studio' },
])
const contact = computed(() => props.universe === 'creator'
  ? isFrench.value ? 'Candidater' : 'Apply'
  : isFrench.value ? 'Parlons de votre projet' : 'Let’s talk about your project')

function closeMenu(restoreFocus = false) {
  if (!isOpen.value) return
  isOpen.value = false
  if (restoreFocus) menuToggle.value?.focus()
}

watch(() => route.fullPath, () => closeMenu())

</script>

<template>
  <header
    class="studio-nav"
    :class="[
      `studio-nav--${tone}`,
      `studio-nav--${universe}`,
      { 'studio-nav--overlay': overlay },
    ]"
    @keydown.esc="closeMenu(true)"
  >
    <div class="studio-nav__inner">
      <NuxtLink class="studio-nav__brand" :to="localePath('/')" @click="closeMenu()">
        <img src="/img/logo/mc-studio.svg" alt="MC Studio" width="155" height="28">
      </NuxtLink>

      <nav class="studio-nav__links" :aria-label="isFrench ? 'Navigation principale' : 'Main navigation'">
        <NuxtLink v-for="link in links" :key="link.path" :to="localePath(link.path)">
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="studio-nav__actions">
        <NuxtLink class="studio-nav__contact" :to="localePath('/contact')">
          {{ contact }} <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" />
        </NuxtLink>
      </div>

      <button
        ref="menuToggle"
        class="studio-nav__toggle"
        type="button"
        aria-controls="studio-mobile-navigation"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        {{ isOpen ? (isFrench ? 'Fermer' : 'Close') : 'Menu' }}
        <UIcon :name="isOpen ? 'i-tabler-x' : 'i-tabler-menu-2'" aria-hidden="true" />
      </button>

      <div v-show="isOpen" id="studio-mobile-navigation" class="studio-nav__mobile">
        <nav :aria-label="isFrench ? 'Navigation mobile' : 'Mobile navigation'">
          <NuxtLink
            v-for="link in links"
            :key="link.path"
            :to="localePath(link.path)"
            @click="closeMenu()"
          >
            {{ link.label }}
            <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" />
          </NuxtLink>
        </nav>
        <div class="studio-nav__mobile-actions">
          <NuxtLink class="studio-nav__contact" :to="localePath('/contact')" @click="closeMenu()">
            {{ contact }} <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.studio-nav {
  --nav-bg: #10100f;
  --nav-fg: #f5f3ee;
  --nav-muted: #bfbbb4;
  --nav-line: #ffffff25;
  --nav-accent: #f0bf6c;
  position: sticky;
  z-index: 50;
  top: 0;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-line);
  color: var(--nav-fg);
  font-family: 'Host Grotesk', sans-serif;
}
.studio-nav--overlay { position: absolute; inset-inline: 0; }
.studio-nav--light { --nav-bg: #f6f3ed; --nav-fg: #181613; --nav-muted: #524c44; --nav-line: #18161332; --nav-accent: #765015; }
.studio-nav--creator { --nav-accent: #ad87f0; }
.studio-nav__inner { width: min(1320px, calc(100% - 80px)); min-height: 76px; margin-inline: auto; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.studio-nav__brand { flex: 0 0 auto; display: grid; place-items: center; min-height: 44px; }
.studio-nav__brand img { width: clamp(112px, 10vw, 155px); height: auto; }
.studio-nav--light .studio-nav__brand img { filter: invert(1); }
.studio-nav__links, .studio-nav__actions { display: flex; align-items: center; gap: clamp(14px, 2.3vw, 34px); }
.studio-nav__links a { display: inline-flex; align-items: center; min-height: 44px; color: var(--nav-muted); text-decoration: none; transition: color .2s ease; }
.studio-nav__links a { font-size: 15px; white-space: nowrap; }
.studio-nav__links a:hover, .studio-nav__links a.router-link-active { color: var(--nav-fg); }
.studio-nav__contact, .studio-nav__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid var(--nav-line);
  border-radius: 5px;
  color: var(--nav-fg);
  font-size: .875rem;
  font-weight: 550;
  text-decoration: none;
  transition: color .2s ease, border-color .2s ease;
}
.studio-nav__contact:hover, .studio-nav__toggle:hover { color: var(--nav-accent); border-color: var(--nav-accent); }
.studio-nav__contact span, .studio-nav__toggle span { width: 1rem; height: 1rem; }
.studio-nav__toggle, .studio-nav__mobile { display: none; }
.studio-nav a:focus-visible, .studio-nav button:focus-visible { outline: 2px solid var(--nav-accent); outline-offset: 4px; }
@media (max-width: 920px) {
  .studio-nav__inner { width: calc(100% - 40px); min-height: 64px; }
  .studio-nav__links, .studio-nav__actions { display: none; }
  .studio-nav__toggle { display: inline-flex; cursor: pointer; }
  .studio-nav__mobile {
    display: block;
    position: absolute;
    inset: 100% 0 auto;
    max-height: calc(100dvh - 64px);
    overflow: auto;
    padding: 16px 20px 24px;
    background: var(--nav-bg);
    border-bottom: 1px solid var(--nav-line);
  }
  .studio-nav__mobile nav a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 14px 0;
    border-bottom: 1px solid var(--nav-line);
    font-size: clamp(1.65rem, 6vw, 2.5rem);
    letter-spacing: -.04em;
  }
  .studio-nav__mobile nav a.router-link-active { color: var(--nav-accent); }
  .studio-nav__mobile nav a span { width: 1.2rem; height: 1.2rem; }
  .studio-nav__mobile-actions { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin-top: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .studio-nav a, .studio-nav button { transition: none; }
}
</style>
