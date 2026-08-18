<script setup lang="ts">
const isScrolled = ref(false)
const isFooterVisible = ref(false)
const activeSection = ref('')
const colorMode = useColorMode()
const isMenuOpen = ref(false)

const { t, locale, setLocale } = useI18n()
const config = useRuntimeConfig()
const platformUrl = computed(() => String(config.public.partnerPlatformUrl || ''))

const language = computed({
  get: () => locale.value.toUpperCase(),
  set: (value) => setLocale(value.toLowerCase() as 'en' | 'fr')
})

const partnerSections = ['principe', 'pourquoi', 'suivi', 'faq-partner']

const partnerNavItems = [
  { label: 'Principe', id: 'principe' },
  { label: 'Pourquoi', id: 'pourquoi' },
  { label: 'Suivi', id: 'suivi' },
  { label: 'FAQ', id: 'faq-partner' }
]

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 200

    for (const section of [...partnerSections].reverse()) {
      const el = document.getElementById(section)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 300) {
          activeSection.value = section
          break
        }
      }
    }

    if (window.scrollY < 300) activeSection.value = ''
  }

  const footerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isFooterVisible.value = entry.isIntersecting
      })
    },
    { threshold: 0.1 }
  )

  const footerEl = document.getElementById('footer')
  if (footerEl) footerObserver.observe(footerEl)

  window.addEventListener('scroll', handleScroll)

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (footerEl) footerObserver.unobserve(footerEl)
  })
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
    leave-active-class="transition-all duration-400 ease-[cubic-bezier(0.16,1,0,3,1)]"
    enter-from-class="opacity-0 translate-y-24"
    leave-to-class="opacity-0 translate-y-24"
  >
    <nav
      v-if="isScrolled && !isFooterVisible"
      class="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-3 md:px-6 w-full pointer-events-none max-w-[700px]"
    >
      <div
        :class="[
          'backdrop-blur-[20px] pointer-events-auto overflow-hidden rounded-lg',
          'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          colorMode.value === 'dark'
            ? 'bg-[#1a1a1a]/95 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1)]'
            : 'bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.5)]'
        ]"
      >
        <div
          :class="[
            'flex items-center justify-between gap-2 px-2 py-1.5 md:px-3 md:py-2 transition-all duration-500',
            isMenuOpen ? 'pb-3' : ''
          ]"
        >
          <!-- Logo with Studio -->
          <NuxtLink
            to="/"
            :class="[
              'flex items-center shrink-0'
            ]"
          >
            <NuxtImg src="/img/logo/mc-studio.svg" alt="MC Studio" class="w-20 h-auto md:w-[88px] object-contain" />
          </NuxtLink>

          <!-- Desktop Links -->
          <div class="hidden md:flex items-center gap-1">
            <a
              v-for="item in partnerNavItems"
              :key="item.id"
              :href="`#${item.id}`"
              :class="[
                'font-inter font-medium text-[13px] px-3 py-1.5 rounded-lg no-underline transition-all duration-200 whitespace-nowrap',
                activeSection === item.id
                  ? colorMode.value === 'dark'
                    ? 'bg-[#333] text-white'
                    : 'bg-[#e8e8e8] text-[#1a1a1a]'
                  : colorMode.value === 'dark'
                    ? 'text-white/80 hover:bg-[#2a2a2a]'
                    : 'text-[#1a1a1a] hover:bg-[#f0f0f0]'
              ]"
            >
              {{ item.label }}
            </a>
          </div>

          <!-- Desktop Language Selector -->
          <div
            :class="[
              'hidden md:flex items-center gap-0.5 rounded-lg p-0.5 shrink-0',
              colorMode.value === 'dark' ? 'bg-[#2a2a2a]' : 'bg-[#f5f5f5]'
            ]"
          >
            <button
              v-for="lang in ['FR', 'EN']"
              :key="lang"
              @click="language = lang"
              :class="[
                'font-inter font-medium text-xs px-2.5 py-1 rounded-lg transition-all duration-200',
                language === lang
                  ? colorMode.value === 'dark'
                    ? 'bg-[#3a3a3a] text-white shadow-sm'
                    : 'bg-white text-[#1a1a1a] shadow-sm'
                  : colorMode.value === 'dark'
                    ? 'text-white/60 hover:text-white'
                    : 'text-[#666] hover:text-[#1a1a1a]'
              ]"
            >
              {{ lang }}
            </button>
          </div>

          <!-- Desktop CTA -->
          <a
            :href="platformUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden md:flex items-center gap-2 border-none rounded-lg py-1 pr-3 pl-1 md:py-1.5 md:pr-4 md:pl-1.5 cursor-pointer transition-all duration-200 shrink-0 hover:scale-[1.02] bg-[linear-gradient(to_right,white_50%,#f0bf6c)] font-inter font-medium text-sm text-[#0f0f0f] backdrop-blur-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_10px_10px_rgba(11,32,103,0.05)] hover:brightness-105 no-underline"
          >
            <NuxtImg
              src="/img/main/founder.jpeg"
              alt="MC Studio"
              class="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-[#f0bf6c] to-[#e8a84c] flex items-center justify-center font-inter font-semibold text-[9px] md:text-[10px] text-[#0f0f0f] object-contain"
            />
            <div class="flex flex-col gap-px">
              <span class="text-slide-container h-[14px]">
                <span class="text-slide-wrapper">
                  <span class="text-slide-text h-[14px] leading-[14px] font-inter font-semibold text-[11px] md:text-xs">
                    {{ t('partners.nav.cta') }}
                  </span>
                </span>
              </span>
              <span class="text-slide-container h-[11px] mb-2">
                <span class="text-slide-wrapper">
                  <span
                    class="text-slide-text h-[11px] leading-[11px] font-inter font-normal text-[9px] text-[#1a1a1a]/60"
                  >
                    {{ t('partners.hero.primary_sub') }}
                  </span>
                </span>
              </span>
            </div>
          </a>
          <!-- Mobile burger -->
          <button
            class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-all duration-300"
            :class="
              isMenuOpen
                ? colorMode.value === 'dark'
                  ? 'bg-[#2a2a2a] hover:bg-[#333]'
                  : 'bg-[#f0f0f0] hover:bg-[#e5e5e5]'
                : colorMode.value === 'dark'
                  ? 'bg-white hover:bg-gray-100'
                  : 'bg-[#1a1a1a] hover:bg-[#2a2a2a]'
            "
            :aria-label="isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
            @click="isMenuOpen = !isMenuOpen"
          >
            <svg
              v-if="!isMenuOpen"
              :class="['w-4 h-4', colorMode.value === 'dark' ? 'text-[#1a1a1a]' : 'text-white']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              :class="['w-4 h-4 transition-transform duration-300', colorMode.value === 'dark' ? 'text-white' : 'text-[#1a1a1a]']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile expanded content -->
        <div
          class="md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          :class="isMenuOpen ? 'max-h-[360px] opacity-100 px-2 pb-2' : 'max-h-0 opacity-0 px-2 pb-0'"
        >
          <div class="flex flex-col gap-4">
            <!-- Links -->
            <div class="flex flex-col gap-1">
              <a
                v-for="(item, index) in partnerNavItems"
                :key="item.id"
                :href="`#${item.id}`"
                @click="isMenuOpen = false"
                :class="[
                  'font-inter font-medium text-lg py-2 px-3 rounded-xl no-underline transition-all duration-200 transform',
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0',
                  activeSection === item.id
                    ? colorMode.value === 'dark'
                      ? 'bg-[#2a2a2a] text-white'
                      : 'bg-[#f0f0f0] text-[#1a1a1a]'
                    : colorMode.value === 'dark'
                      ? 'text-white/80 hover:bg-[#2a2a2a] hover:text-white'
                      : 'text-[#1a1a1a] hover:bg-[#f5f5f5]'
                ]"
                :style="{ transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms' }"
              >
                {{ item.label }}
              </a>
            </div>

            <div :class="['h-px', colorMode.value === 'dark' ? 'bg-white/10' : 'bg-black/10']"></div>

            <!-- Lang + CTA -->
            <div
              :class="[
                'flex items-center justify-between gap-3 transition-all duration-500',
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              ]"
              :style="{ transitionDelay: isMenuOpen ? '200ms' : '0ms' }"
            >
              <div
                :class="[
                  'flex items-center gap-0.5 rounded-lg p-0.5',
                  colorMode.value === 'dark' ? 'bg-[#2a2a2a]' : 'bg-[#f5f5f5]'
                ]"
              >
                <button
                  v-for="lang in ['FR', 'EN']"
                  :key="lang"
                  @click="language = lang"
                  :class="[
                    'font-inter font-medium text-xs px-3 py-1.5 rounded-lg transition-all duration-200',
                    language === lang
                      ? colorMode.value === 'dark'
                        ? 'bg-[#3a3a3a] text-white shadow-sm'
                        : 'bg-white text-[#1a1a1a] shadow-sm'
                      : colorMode.value === 'dark'
                        ? 'text-white/60 hover:text-white'
                        : 'text-[#666] hover:text-[#1a1a1a]'
                  ]"
                >
                  {{ lang }}
                </button>
              </div>

              <a
                :href="platformUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 border-none rounded-lg py-1.5 pr-4 pl-1.5 cursor-pointer bg-[linear-gradient(to_right,white_50%,#f0bf6c)] font-inter font-medium text-sm text-[#0f0f0f] backdrop-blur-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_10px_10px_rgba(11,32,103,0.05)] hover:brightness-105 transition-all duration-200"
              >
                <NuxtImg
                  src="/img/main/founder.jpeg"
                  alt="MC Studio"
                  class="w-6 h-6 object-contain rounded-lg flex items-center justify-center font-inter font-semibold text-[10px] text-[#0f0f0f]"
                />
                <div class="flex flex-col items-start gap-px">
                  <span class="text-slide-container h-[14px]">
                    <span class="text-slide-wrapper">
                      <span class="text-slide-text h-[14px] leading-[14px] font-inter font-semibold text-xs">
                        {{ t('partners.nav.cta') }}
                      </span>
                    </span>
                  </span>
                  <span class="text-slide-container h-[11px]">
                    <span class="text-slide-wrapper">
                      <span
                        class="text-slide-text h-[11px] leading-[11px] font-inter font-normal text-[9px] text-[#1a1a1a]/60"
                      >
                        {{ t('partners.hero.primary_sub') }}
                      </span>
                    </span>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </Transition>
</template>
