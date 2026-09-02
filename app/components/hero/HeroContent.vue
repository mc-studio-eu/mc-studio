<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'

const { locale, rt, t, tm } = useI18n()

const currentWordIndex = ref(0)
let wordRotationTimer

const rotatingWords = computed(() => {
  const words = tm('hero.rotating_words')

  return Array.isArray(words) ? words.map(word => rt(word)) : []
})

const currentWord = computed(() => rotatingWords.value[currentWordIndex.value] ?? '')
const wordPlaceholder = computed(() => rotatingWords.value[0] ?? currentWord.value)

const availability = computed(() => {
  const month = new Intl.DateTimeFormat(locale.value, {
    month: 'long',
    timeZone: 'Europe/Paris'
  }).format(new Date())

  return t('hero.availability', { month })
})

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Animation blur reveal pour le titre
  gsap.fromTo(".hero-title", 
    { 
      opacity: 0, 
      filter: "blur(20px)",
      y: 20
    },
    { 
      opacity: 1, 
      filter: "blur(0px)",
      y: 0,
      duration: 1.5,
      ease: "power2.out"
    }
  )

  // Animation blur reveal pour le sous-titre avec délai
  gsap.fromTo(".hero-subtitle", 
    { 
      opacity: 0, 
      filter: "blur(15px)",
      y: 15
    },
    { 
      opacity: 1, 
      filter: "blur(0px)",
      y: 0,
      duration: 0.8,
      delay: 0.3,
      ease: "power2.out"
    }
  )

  if (!prefersReducedMotion && rotatingWords.value.length > 1) {
    wordRotationTimer = window.setInterval(() => {
      currentWordIndex.value = (currentWordIndex.value + 1) % rotatingWords.value.length
    }, 2600)
  }
})

onBeforeUnmount(() => {
  if (wordRotationTimer) window.clearInterval(wordRotationTimer)
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8 mt-8 sm:mt-10 md:mt-12 text-center w-full px-2 sm:px-4 md:px-6">
    <div
      class="hero-availability-badge flex flex-col items-center justify-center gap-3 font-inter min-[560px]:flex-row min-[560px]:gap-4"
    >
      <div class="inline-flex items-center gap-2.5 whitespace-nowrap text-xs font-medium text-white/90 sm:text-sm">
        <span class="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f0bf6c] opacity-60 motion-reduce:animate-none"></span>
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-[#f8d699] bg-[#f0bf6c]"></span>
        </span>
        <span>{{ availability }}</span>
      </div>

      <div class="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-2 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-2.5">
        <svg class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>

        <div class="flex items-center gap-px text-[#f0bf6c]" aria-hidden="true">
          <svg v-for="star in 5" :key="star" class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="m12 2.2 2.95 5.98 6.6.96-4.77 4.65 1.12 6.57L12 17.26l-5.9 3.1 1.12-6.57-4.77-4.65 6.6-.96L12 2.2Z"/>
          </svg>
        </div>

        <span class="h-4 w-px bg-white/15" aria-hidden="true"></span>
        <span class="whitespace-nowrap text-[11px] font-medium text-white/85 sm:text-xs">{{ $t('hero.reviews') }}</span>
      </div>
    </div>

    <!-- Title -->
    <h1 class="hero-title text-balance font-manrope font-medium leading-[1.15] sm:leading-[1.2] md:leading-tight max-w-[320px] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[920px] text-transparent bg-clip-text bg-[linear-gradient(270deg,#f0bf6c_0%,white_67.308%)] text-[clamp(1.25rem,6vw,1.5rem)] min-[480px]:text-[clamp(1.5rem,5vw,1.75rem)] sm:text-[clamp(2rem,4.5vw,2.25rem)] md:text-[clamp(2.25rem,4vw,2.625rem)] lg:text-[2.625rem] xl:text-[3rem] opacity-0" style="filter: blur(20px); transform: translateY(20px)">
      <span class="sr-only">{{ $t('hero.title') }}</span>
      <span aria-hidden="true">
        {{ $t('hero.title_prefix') }}&nbsp;<span class="hero-word-rotator">
          <span class="hero-word-placeholder">{{ wordPlaceholder }}</span>
          <Transition name="hero-word">
            <span :key="currentWord" class="hero-word">{{ currentWord }}</span>
          </Transition>
        </span>
      </span>
    </h1>
    
    <!-- Subtitle -->
    <p class="hero-subtitle font-normal leading-[1.6] sm:leading-[1.7] tracking-wide text-white/90 max-w-[300px] sm:max-w-[450px] md:max-w-[550px] lg:max-w-[587px] text-[clamp(0.8125rem,2.5vw,0.875rem)] sm:text-[clamp(0.875rem,2vw,1rem)] md:text-base lg:text-[1.0625rem] xl:text-[1.1875rem] opacity-0" style="filter: blur(15px); transform: translateY(15px)" v-html="$t('hero.subtitle')">
    </p>
  </div>
</template>

<style scoped>
.hero-availability-badge {
  animation: availability-reveal 0.7s 0.15s both cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-word-rotator {
  display: inline-grid;
  text-align: left;
  vertical-align: baseline;
}

.hero-word-placeholder,
.hero-word {
  grid-area: 1 / 1;
}

.hero-word-placeholder {
  visibility: hidden;
}

.hero-word {
  display: block;
}

.hero-word-enter-active,
.hero-word-leave-active {
  transition:
    opacity 450ms ease,
    filter 450ms ease,
    transform 450ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-word-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(0.65em);
}

.hero-word-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(-0.65em);
}

@keyframes availability-reveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-availability-badge {
    animation: none;
  }

  .hero-word-enter-active,
  .hero-word-leave-active {
    transition: none;
  }
}
</style>
