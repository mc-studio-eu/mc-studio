<script setup lang="ts">
const props = withDefaults(defineProps<{
  tone?: 'dark' | 'light'
  overlay?: boolean
  universe?: 'studio' | 'business' | 'creator'
}>(), {
  tone: 'dark',
  overlay: false,
  universe: 'studio'
})

const route = useRoute()
const localePath = useLocalePath()
const { locale, setLocale } = useI18n()
const isMenuOpen = ref(false)
const desktopCtaBtn = ref<HTMLElement | null>(null)
const desktopCtaWrapper = ref<HTMLElement | null>(null)
const mobileCtaBtn = ref<HTMLElement | null>(null)
const mobileCtaWrapper = ref<HTMLElement | null>(null)

useTextSlideAnimation(desktopCtaBtn, desktopCtaWrapper)
useTextSlideAnimation(mobileCtaBtn, mobileCtaWrapper)

const copy = computed(() => {
  const cta = props.universe === 'creator'
    ? 'Apply'
    : locale.value === 'fr' ? 'Démarrer un projet' : 'Start a project'

  return locale.value === 'fr'
    ? { projects: 'Projets', cta, menu: 'Menu', close: 'Fermer' }
    : { projects: 'Projects', cta, menu: 'Menu', close: 'Close' }
})

const languageOptions = [
  { label: 'FR', value: 'fr' as const },
  { label: 'EN', value: 'en' as const }
]

const navItems = computed(() => [
  { label: 'Business', path: '/business', active: route.path.includes('/business') && !route.hash },
  { label: 'Creators', path: '/creators', active: route.path.includes('/creators') },
  { label: copy.value.projects, path: '/projects', active: route.path.includes('/projects') }
])

const selectLanguage = (value: 'fr' | 'en') => setLocale(value)

watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})

watch(isMenuOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="studio-nav z-50 flex w-full items-center justify-between gap-8"
  :class="[
    props.tone === 'light' ? 'studio-nav--light' : 'studio-nav--dark',
    props.universe === 'creator' ? 'studio-nav--creator' : '',
    props.universe === 'business' ? 'studio-nav--business' : '',
    props.overlay ? 'absolute inset-x-0 top-0' : 'relative'
  ]"
>
    <NuxtLink class="studio-nav__brand" :to="localePath('/')" aria-label="MC Studio — Home">
      <img class="studio-nav__logo" src="/img/logo/mc-studio.svg" alt="MC Studio" width="158" height="29">
    </NuxtLink>

    <div class="hidden items-center gap-6 lg:flex">
      <nav class="flex items-center gap-7" aria-label="Main navigation">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="localePath(item.path)"
          class="studio-nav__link"
          :class="{ 'studio-nav__link--active': item.active }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="studio-nav__locale" role="group" :aria-label="locale === 'fr' ? 'Choisir la langue' : 'Choose language'">
        <button
          v-for="option in languageOptions"
          :key="option.value"
          class="studio-nav__locale-option"
          :class="{ 'studio-nav__locale-option--active': locale === option.value }"
          type="button"
          :aria-pressed="locale === option.value"
          @click="selectLanguage(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

        <NuxtLink ref="desktopCtaBtn" class="studio-nav__cta" :to="localePath('/contact')">
          <span class="sr-only">{{ copy.cta }}</span>
          <span class="studio-nav__text-slide-container" aria-hidden="true">
            <span ref="desktopCtaWrapper" class="studio-nav__text-slide-wrapper">
              <span class="studio-nav__text-slide-text">{{ copy.cta }}</span>
              <span class="studio-nav__text-slide-text">{{ copy.cta }}</span>
            </span>
          </span>
        </NuxtLink>
    </div>

    <button
      v-if="!isMenuOpen"
      class="studio-nav__menu lg:hidden"
      type="button"
      :aria-expanded="isMenuOpen"
      aria-controls="studio-mobile-menu"
      :aria-label="isMenuOpen ? copy.close : copy.menu"
      @click="isMenuOpen = !isMenuOpen"
    >
      <span :class="{ 'studio-nav__menu-line--top': isMenuOpen }" />
      <span :class="{ 'studio-nav__menu-line--bottom': isMenuOpen }" />
    </button>

    <Transition name="studio-menu">
      <div v-if="isMenuOpen" id="studio-mobile-menu" class="studio-nav__panel lg:hidden">
        <div class="flex items-center justify-between px-5 py-7">
          <NuxtLink class="studio-nav__mobile-brand" :to="localePath('/')" aria-label="MC Studio — Home">
            <img class="studio-nav__mobile-logo" src="/img/logo/mc-studio.svg" alt="MC Studio" width="158" height="29">
          </NuxtLink>
          <button class="studio-nav__menu" type="button" :aria-label="copy.close" @click="isMenuOpen = false">
            <span class="studio-nav__menu-line--top" />
            <span class="studio-nav__menu-line--bottom" />
          </button>
        </div>

        <div class="flex flex-1 flex-col justify-between px-5 pb-7 pt-10">
          <nav class="flex flex-col items-start" aria-label="Mobile navigation">
            <NuxtLink
              v-for="item in navItems"
              :key="item.path"
              :to="localePath(item.path)"
              class="studio-nav__mobile-link"
              :class="{ 'studio-nav__mobile-link--active': item.active }"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div>
        <NuxtLink ref="mobileCtaBtn" class="studio-nav__mobile-cta" :to="localePath('/contact')">
          <span class="sr-only">{{ copy.cta }}</span>
          <span class="studio-nav__text-slide-container" aria-hidden="true">
            <span ref="mobileCtaWrapper" class="studio-nav__text-slide-wrapper">
              <span class="studio-nav__text-slide-text">{{ copy.cta }}</span>
              <span class="studio-nav__text-slide-text">{{ copy.cta }}</span>
            </span>
          </span>
        </NuxtLink>
            <div class="mt-6 flex items-center justify-between border-t border-current/10 pt-5">
              <a class="studio-nav__meta" href="https://www.instagram.com/mc_studio_eu/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <div class="studio-nav__locale" role="group" :aria-label="locale === 'fr' ? 'Choisir la langue' : 'Choose language'">
                <button
                  v-for="option in languageOptions"
                  :key="option.value"
                  class="studio-nav__locale-option"
                  :class="{ 'studio-nav__locale-option--active': locale === option.value }"
                  type="button"
                  :aria-pressed="locale === option.value"
                  @click="selectLanguage(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.studio-nav { box-sizing: border-box; min-height: 88px; padding: 22px clamp(20px, 2.05vw, 42px); font-family: Inter, sans-serif; }
.studio-nav--dark { color: #fff; }
.studio-nav--light { color: #171717; }
.studio-nav__brand { display: block; flex-shrink: 0; color: inherit; text-decoration: none; }
.studio-nav__logo { display: block; width: 158px; height: auto; }
.studio-nav--light .studio-nav__logo { filter: invert(1); }
.studio-nav__mobile-brand { display: block; color: inherit; text-decoration: none; }
.studio-nav__mobile-logo { display: block; width: 158px; height: auto; }
.studio-nav--light .studio-nav__mobile-logo { filter: invert(1); }
.studio-nav__link { color: currentColor; font-size: 16px; font-weight: 500; line-height: 1; opacity: .3; text-decoration: none; transition: opacity 180ms ease; }
.studio-nav__link:hover, .studio-nav__link--active { opacity: 1; }
.studio-nav__locale { display: inline-flex; align-items: center; gap: 2px; border: 1px solid currentColor; border-radius: 999px; padding: 3px; color: currentColor; opacity: .72; transition: opacity 180ms ease; }
.studio-nav__locale:hover { opacity: 1; }
.studio-nav__locale-option { display: inline-flex; width: 30px; height: 24px; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: transparent; color: currentColor; cursor: pointer; font: 600 10px/1 Inter, sans-serif; letter-spacing: .04em; transition: background 180ms ease, color 180ms ease, opacity 180ms ease; }
.studio-nav__locale-option:not(.studio-nav__locale-option--active) { opacity: .58; }
.studio-nav__locale-option--active { opacity: 1; }
.studio-nav--dark .studio-nav__locale-option--active { background: #fff; color: #171717; }
.studio-nav--light .studio-nav__locale-option--active { background: #171717; color: #fff; }
.studio-nav__cta, .studio-nav__mobile-cta { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; border-radius: 16px; padding: 0 18px; background: #fff; color: #171717; font-size: 15px; font-weight: 600; text-decoration: none; transition: transform 200ms ease, filter 200ms ease; }
.studio-nav--light .studio-nav__cta { background: #171717; color: #fff; }
.studio-nav__cta:hover, .studio-nav__mobile-cta:hover { transform: scale(1.02); filter: brightness(1.05); }
.studio-nav__menu { position: relative; z-index: 70; display: grid; width: 48px; height: 48px; place-content: center; gap: 6px; border: 1px solid currentColor; border-radius: 18px; background: transparent; color: inherit; cursor: pointer; opacity: .65; }
.studio-nav__menu span { display: block; width: 15px; height: 1.5px; background: currentColor; transition: transform 220ms ease; }
.studio-nav__menu-line--top { transform: translateY(3.75px) rotate(45deg); }
.studio-nav__menu-line--bottom { transform: translateY(-3.75px) rotate(-45deg); }
.studio-nav__panel { position: fixed; inset: 0; z-index: 60; display: flex; min-height: 100svh; flex-direction: column; background: #151515; color: #fff; }
.studio-nav--light .studio-nav__panel { background: #f8f8f8; color: #171717; }
.studio-nav__mobile-link { color: currentColor; font-size: clamp(2.4rem, 12vw, 4rem); font-weight: 600; line-height: 1.08; letter-spacing: -.055em; opacity: .45; text-decoration: none; transition: opacity 180ms ease; }
.studio-nav__mobile-link:hover, .studio-nav__mobile-link--active { opacity: 1; }
.studio-nav__mobile-cta { width: fit-content; }
.studio-nav--light .studio-nav__mobile-cta { background: #171717; color: #fff; }

.studio-nav--creator .studio-nav__cta,
.studio-nav--creator .studio-nav__mobile-cta {
  background: #a375f2;
  color: #fff;
}

.studio-nav--creator .studio-nav__cta:hover,
.studio-nav--creator .studio-nav__mobile-cta:hover {
  background: #9767eb;
}

.studio-nav--business .studio-nav__cta,
.studio-nav--business .studio-nav__mobile-cta {
  background: linear-gradient(to right, #fff 50%, #f0bf6c);
  color: #0f0f0f;
}

.studio-nav--business .studio-nav__cta:hover,
.studio-nav--business .studio-nav__mobile-cta:hover {
  filter: brightness(1.05);
}
.studio-nav__text-slide-container { display: block; position: relative; overflow: hidden; height: 1em; }
.studio-nav__text-slide-wrapper { display: flex; flex-direction: column; }
.studio-nav__text-slide-text { display: block; height: 1em; line-height: 1; }
.studio-nav__meta { border: 0; background: transparent; color: currentColor; cursor: pointer; font: 500 14px/1 Inter, sans-serif; opacity: .45; text-decoration: none; }
.studio-menu-enter-active, .studio-menu-leave-active { transition: opacity 220ms ease; }
.studio-menu-enter-active .studio-nav__mobile-link { animation: menu-link-in 420ms both cubic-bezier(.22,1,.36,1); }
.studio-menu-enter-from, .studio-menu-leave-to { opacity: 0; }
@keyframes menu-link-in { from { opacity: 0; transform: translateY(16px); } }
@media (max-width: 1023px) { .studio-nav__logo, .studio-nav__mobile-logo { width: 132px; } }
@media (min-width: 1024px) { .studio-nav__menu, .studio-nav__panel { display: none; } }
@media (prefers-reduced-motion: reduce) { .studio-menu-enter-active .studio-nav__mobile-link { animation: none; } }
</style>
