<script setup lang="ts">
const props = withDefaults(defineProps<{
  floatingOnly?: boolean
  alwaysFloating?: boolean
}>(), {
  floatingOnly: false,
  alwaysFloating: false,
})

const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const isMenuOpen = ref(false)
const isScrolled = ref(false)

const navItems = [
  { key: 'projects', id: 'projets' },
  { key: 'services', id: 'services' },
  { key: 'reviews', id: 'avis' },
  { key: 'pricing', id: 'tarifs' },
]

const language = computed(() => locale.value.toUpperCase())
const showFloatingNavbar = computed(() => props.alwaysFloating || isScrolled.value)

const switchLanguage = async () => {
  await setLocale(locale.value === 'fr' ? 'en' : 'fr')
}

onMounted(() => {
  const updateScroll = () => {
    isScrolled.value = window.scrollY > 560
  }

  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', updateScroll))
})
</script>

<template>
  <div>
    <header v-if="!props.floatingOnly" class="air-nav">
      <NuxtLink :to="localePath('/')" class="air-nav__brand" aria-label="MC Studio — Accueil">
        <NuxtImg src="/img/logo/mc-studio.svg" alt="MC Studio" class="air-nav__logo" />
      </NuxtLink>

      <nav class="air-nav__links" aria-label="Navigation principale">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="`${localePath('/')}#${item.id}`"
        >
          {{ t(`nav.${item.key}`) }}
        </NuxtLink>
      </nav>

      <div class="air-nav__actions">
        <button class="air-nav__language" type="button" :aria-label="`Langue : ${language}`" @click="switchLanguage">
          {{ language }}
        </button>
        <NuxtLink :to="`${localePath('/')}#contact`" class="air-button air-button--ghost">
          {{ t('nav.book_call') }}
        </NuxtLink>
        <button class="air-nav__menu" type="button" :aria-expanded="isMenuOpen" aria-label="Menu" @click="isMenuOpen = !isMenuOpen">
          <span></span><span></span>
        </button>
      </div>

      <Transition name="air-menu">
        <nav v-if="isMenuOpen" class="air-nav__mobile" aria-label="Navigation mobile">
          <NuxtLink
            v-for="item in navItems"
            :key="item.key"
            :to="`${localePath('/')}#${item.id}`"
            @click="isMenuOpen = false"
          >
            {{ t(`nav.${item.key}`) }}
          </NuxtLink>
          <NuxtLink :to="`${localePath('/')}#contact`" @click="isMenuOpen = false">
            {{ t('nav.book_call') }}
          </NuxtLink>
        </nav>
      </Transition>
    </header>

    <Transition name="air-float">
      <nav v-if="showFloatingNavbar" class="air-floating-nav" aria-label="Navigation rapide">
        <NuxtLink :to="localePath('/')" aria-label="Accueil" class="air-floating-nav__mark">MC</NuxtLink>
        <NuxtLink v-for="item in navItems.slice(0, 3)" :key="item.key" :to="`${localePath('/')}#${item.id}`">
          {{ t(`nav.${item.key}`) }}
        </NuxtLink>
        <NuxtLink :to="`${localePath('/')}#contact`" class="air-floating-nav__cta">
          {{ t('nav.book_call') }}
        </NuxtLink>
      </nav>
    </Transition>
  </div>
</template>

<style scoped>
.air-nav {
  position: relative;
  z-index: 30;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  min-height: 72px;
  padding: 0 24px;
  color: #fff;
  font-family: Inter, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
}

.air-nav__brand { justify-self: start; }
.air-nav__logo { display: block; width: 112px; height: auto; filter: brightness(0) invert(1); }
.air-nav__links { display: flex; align-items: center; gap: 32px; }
.air-nav__links a,
.air-nav__mobile a { color: rgba(255, 255, 255, .82); text-decoration: none; transition: color 180ms ease; }
.air-nav__links a:hover,
.air-nav__mobile a:hover { color: #fff; }

.air-nav__actions { display: flex; align-items: center; justify-self: end; gap: 8px; }
.air-nav__language {
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, .76);
  font: inherit;
  cursor: pointer;
}

.air-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-radius: 8px;
  color: #fff;
  font: inherit;
  text-decoration: none;
}

.air-button--ghost { border: 1px solid #f0bf6c; background: rgba(4, 9, 17, .08); color: #f0bf6c; backdrop-filter: blur(12px); }
.air-nav__menu { display: none; width: 40px; height: 38px; border: 1px solid rgba(255,255,255,.55); border-radius: 8px; background: transparent; }
.air-nav__menu span { display: block; width: 16px; height: 1px; margin: 4px auto; background: #fff; }

.air-nav__mobile {
  position: absolute;
  top: 66px;
  right: 16px;
  display: flex;
  width: min(280px, calc(100vw - 32px));
  flex-direction: column;
  gap: 1px;
  padding: 8px;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 12px;
  background: rgba(3, 7, 13, .92);
  backdrop-filter: blur(24px);
}
.air-nav__mobile a { padding: 14px 12px; }

.air-floating-nav {
  position: fixed;
  z-index: 1000;
  bottom: 22px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  transform: translateX(-50%);
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 12px;
  background: rgba(6, 11, 19, .88);
  backdrop-filter: blur(22px);
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
}
.air-floating-nav a { padding: 10px 12px; color: rgba(255,255,255,.74); text-decoration: none; white-space: nowrap; }
.air-floating-nav__mark { color: #fff !important; font-weight: 700; }
.air-floating-nav__cta { border: 1px solid #f0bf6c; border-radius: 8px; color: #f0bf6c !important; }
.air-float-enter-active, .air-float-leave-active, .air-menu-enter-active, .air-menu-leave-active { transition: opacity 240ms ease, transform 240ms ease; }
.air-float-enter-from, .air-float-leave-to { opacity: 0; transform: translate(-50%, 12px); }
.air-menu-enter-from, .air-menu-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 900px) {
  .air-nav { display: flex; justify-content: space-between; padding: 0 16px; }
  .air-nav__links, .air-nav__actions > .air-button { display: none; }
  .air-nav__menu { display: block; }
}

@media (max-width: 640px) {
  .air-floating-nav a:not(.air-floating-nav__mark):not(.air-floating-nav__cta) { display: none; }
}
</style>
