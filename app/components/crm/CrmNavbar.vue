<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** `header` renders inline at the top of the hero, `floating` docks to the bottom on scroll */
    variant?: 'header' | 'floating'
  }>(),
  { variant: 'header' }
)

const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const colorMode = useColorMode()

const language = computed({
  get: () => locale.value.toUpperCase(),
  set: (value: string) => setLocale(value.toLowerCase() as 'en' | 'fr')
})

const navItems = [
  { key: 'why', id: 'pourquoi' },
  { key: 'included', id: 'inclus' },
  { key: 'work', id: 'realisations' },
  { key: 'process', id: 'process' },
  { key: 'pricing', id: 'tarif' },
  { key: 'faq', id: 'faq' }
] as const

const isMenuOpen = ref(false)
const isScrolled = ref(false)
const isFooterVisible = ref(false)
const activeSection = ref('')

const showFloating = computed(() => isScrolled.value && !isFooterVisible.value)

onMounted(() => {
  if (props.variant !== 'floating') return

  const handleScroll = () => {
    isScrolled.value = window.scrollY > 200

    for (const item of [...navItems].reverse()) {
      const el = document.getElementById(item.id)
      if (el && el.getBoundingClientRect().top <= 300) {
        activeSection.value = item.id
        break
      }
    }

    if (window.scrollY < 300) activeSection.value = ''
  }

  const footerObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => (isFooterVisible.value = entry.isIntersecting)),
    { threshold: 0.1 }
  )

  const footerEl = document.getElementById('footer')
  if (footerEl) footerObserver.observe(footerEl)

  window.addEventListener('scroll', handleScroll)
  handleScroll()

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (footerEl) footerObserver.unobserve(footerEl)
  })
})
</script>

<template>
  <!-- Inline header, sitting on top of the hero background -->
  <header
    v-if="variant === 'header'"
    class="flex w-full max-w-[1050px] mx-auto items-center justify-between gap-4 px-4 pt-6 md:px-5 md:pt-10"
  >
    <NuxtLink :to="localePath('/')" class="flex items-center shrink-0" aria-label="MC Studio">
      <!-- The header always sits on the dark hero image, so keep the white mark -->
      <BrandLogo on-dark class="w-[100px] md:w-[125px] h-auto object-contain" />
    </NuxtLink>

    <nav class="hidden lg:flex items-center gap-6">
      <a
        v-for="item in navItems"
        :key="item.key"
        :href="`#${item.id}`"
        class="font-inter text-sm font-medium text-white no-underline transition-colors duration-200 hover:text-[var(--color-gold)]"
      >
        {{ t(`crm_offer.nav.${item.key}`) }}
      </a>
    </nav>

    <div class="flex items-center gap-2 shrink-0">
      <div class="hidden sm:flex items-center gap-0.5 rounded-lg bg-black/40 p-0.5 backdrop-blur-md">
        <button
          v-for="lang in ['FR', 'EN']"
          :key="lang"
          type="button"
          class="font-inter text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-200"
          :class="language === lang ? 'bg-white/90 text-[#0f0f0f]' : 'text-white/60 hover:text-white'"
          @click="language = lang"
        >
          {{ lang }}
        </button>
      </div>

      <a
        href="#contact"
        class="flex h-[34px] items-center justify-center rounded-lg bg-[linear-gradient(to_right,white_50%,#f0bf6c)] px-4 font-inter text-sm font-medium text-[#0f0f0f] no-underline shadow-[0_4px_4px_rgba(0,0,0,0.25),0_10px_10px_rgba(11,32,103,0.05)] transition-all duration-200 hover:brightness-105"
      >
        {{ t('crm_offer.hero.primary_main') }}
      </a>
    </div>
  </header>

  <!-- Floating navbar, mirrors the one used on the main site -->
  <Transition
    v-else
    enter-active-class="transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
    leave-active-class="transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
    enter-from-class="opacity-0 translate-y-24"
    leave-to-class="opacity-0 translate-y-24"
  >
    <nav
      v-if="showFloating"
      class="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full px-3 md:px-6 pointer-events-none"
      :class="isMenuOpen ? 'max-w-[340px]' : 'max-w-[900px]'"
    >
      <div
        :class="[
          'pointer-events-auto overflow-hidden rounded-lg backdrop-blur-[20px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          colorMode.value === 'dark'
            ? 'bg-[#1a1a1a]/95 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1)]'
            : 'bg-white/95 shadow-[0_8px_32px_rgba(15,15,15,0.12),0_2px_8px_rgba(120,90,20,0.1),inset_0_0_0_1px_rgba(15,15,15,0.06)]'
        ]"
      >
        <div class="p-1.5 md:p-2">
          <div class="flex items-center justify-between gap-2 md:gap-3">
            <NuxtLink
              :to="localePath('/')"
              aria-label="MC Studio"
              class="flex h-10 shrink-0 items-center px-2 md:px-3"
            >
              <BrandLogo class="block w-[82px] md:w-24 h-auto object-contain" />
            </NuxtLink>

            <div class="hidden lg:flex items-center gap-1">
              <a
                v-for="item in navItems"
                :key="item.key"
                :href="`#${item.id}`"
                :class="[
                  'whitespace-nowrap rounded-lg px-2.5 xl:px-3 py-1.5 font-inter text-[13px] font-medium no-underline transition-all duration-200',
                  activeSection === item.id
                    ? colorMode.value === 'dark'
                      ? 'bg-[#333] text-white'
                      : 'bg-[#f1ece0] text-[#0f0f0f]'
                    : colorMode.value === 'dark'
                      ? 'text-white/80 hover:bg-[#2a2a2a]'
                      : 'text-[#0f0f0f]/80 hover:bg-[#f7f3ea]'
                ]"
              >
                {{ t(`crm_offer.nav.${item.key}`) }}
              </a>
            </div>

            <div
              :class="[
                'hidden lg:flex shrink-0 items-center gap-0.5 rounded-lg p-0.5',
                colorMode.value === 'dark' ? 'bg-[#2a2a2a]' : 'bg-[#f5f1e8]'
              ]"
            >
              <button
                v-for="lang in ['FR', 'EN']"
                :key="lang"
                type="button"
                :class="[
                  'rounded-lg px-2.5 py-1 font-inter text-xs font-medium transition-all duration-200',
                  language === lang
                    ? colorMode.value === 'dark'
                      ? 'bg-[#3a3a3a] text-white shadow-sm'
                      : 'bg-white text-[#0f0f0f] shadow-sm'
                    : colorMode.value === 'dark'
                      ? 'text-white/60 hover:text-white'
                      : 'text-[#5A554B] hover:text-[#0f0f0f]'
                ]"
                @click="language = lang"
              >
                {{ lang }}
              </button>
            </div>

            <button
              type="button"
              :class="[
                'lg:hidden flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300',
                isMenuOpen
                  ? colorMode.value === 'dark'
                    ? 'bg-[#2a2a2a]'
                    : 'bg-[#f1ece0]'
                  : colorMode.value === 'dark'
                    ? 'bg-white'
                    : 'bg-[#0f0f0f]'
              ]"
              :aria-label="isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
              :aria-expanded="isMenuOpen"
              @click="isMenuOpen = !isMenuOpen"
            >
              <UIcon
                :name="isMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
                :class="[
                  'h-4 w-4',
                  isMenuOpen
                    ? colorMode.value === 'dark'
                      ? 'text-white'
                      : 'text-[#0f0f0f]'
                    : colorMode.value === 'dark'
                      ? 'text-[#0f0f0f]'
                      : 'text-white'
                ]"
              />
            </button>

            <a
              href="#contact"
              class="hidden lg:flex shrink-0 items-center gap-2 rounded-xl bg-[linear-gradient(to_right,white_50%,#f0bf6c)] py-1.5 pl-1.5 pr-3.5 font-inter no-underline shadow-[0_4px_4px_rgba(0,0,0,0.2),0_10px_10px_rgba(11,32,103,0.05)] transition-all duration-200 hover:scale-[1.02]"
            >
              <NuxtImg
                src="/img/main/founder.jpeg"
                alt="MC Studio"
                class="h-9 w-9 shrink-0 rounded-xl object-cover object-[center_18%] ring-1 ring-black/10"
              />
              <span class="flex flex-col items-start">
                <span class="font-inter text-xs font-semibold text-[#0f0f0f]">
                  {{ t('crm_offer.hero.primary_main') }}
                </span>
                <span class="font-inter text-[9px] text-[#0f0f0f]/60">
                  {{ t('crm_offer.hero.primary_sub') }}
                </span>
              </span>
            </a>
          </div>

          <!-- Mobile expanded panel -->
          <div
            :class="[
              'lg:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
              isMenuOpen ? 'mt-4 max-h-[420px] opacity-100' : 'mt-0 max-h-0 opacity-0'
            ]"
          >
            <div class="flex flex-col gap-4 px-1 pb-2">
              <div class="flex flex-col gap-1">
                <a
                  v-for="(item, index) in navItems"
                  :key="item.key"
                  :href="`#${item.id}`"
                  :class="[
                    'rounded-xl px-3 py-2 font-inter text-lg font-medium no-underline transition-all duration-500',
                    isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0',
                    colorMode.value === 'dark'
                      ? 'text-white/80 hover:bg-[#2a2a2a]'
                      : 'text-[#0f0f0f]/80 hover:bg-[#f7f3ea]'
                  ]"
                  :style="{ transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms' }"
                  @click="isMenuOpen = false"
                >
                  {{ t(`crm_offer.nav.${item.key}`) }}
                </a>
              </div>

              <div :class="['h-px', colorMode.value === 'dark' ? 'bg-white/10' : 'bg-black/10']" />

              <div class="flex items-center justify-between gap-3">
                <div
                  :class="[
                    'flex items-center gap-0.5 rounded-lg p-0.5',
                    colorMode.value === 'dark' ? 'bg-[#2a2a2a]' : 'bg-[#f5f1e8]'
                  ]"
                >
                  <button
                    v-for="lang in ['FR', 'EN']"
                    :key="lang"
                    type="button"
                    :class="[
                      'rounded-lg px-3 py-1.5 font-inter text-xs font-medium transition-all duration-200',
                      language === lang
                        ? colorMode.value === 'dark'
                          ? 'bg-[#3a3a3a] text-white shadow-sm'
                          : 'bg-white text-[#0f0f0f] shadow-sm'
                        : colorMode.value === 'dark'
                          ? 'text-white/60'
                          : 'text-[#5A554B]'
                    ]"
                    @click="language = lang"
                  >
                    {{ lang }}
                  </button>
                </div>

                <a
                  href="#contact"
                  class="flex items-center gap-2 rounded-xl bg-[linear-gradient(to_right,white_50%,#f0bf6c)] py-1.5 pl-1.5 pr-3 font-inter no-underline shadow-[0_4px_4px_rgba(0,0,0,0.2)]"
                  @click="isMenuOpen = false"
                >
                  <NuxtImg
                    src="/img/main/founder.jpeg"
                    alt="MC Studio"
                    class="h-8 w-8 shrink-0 rounded-xl object-cover object-[center_18%] ring-1 ring-black/10"
                  />
                  <span class="flex flex-col items-start">
                    <span class="font-inter text-xs font-semibold text-[#0f0f0f]">
                      {{ t('crm_offer.hero.primary_main') }}
                    </span>
                    <span class="font-inter text-[9px] text-[#0f0f0f]/60">
                      {{ t('crm_offer.hero.primary_sub') }}
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </Transition>
</template>
