<script setup lang="ts">
// Types
interface Testimonial {
  id: number
  content: string
  author: {
    name: string
    role: string
    avatar?: string
  }
}

// Data
const { t } = useI18n();

const testimonials = computed<Testimonial[]>(() => [
  {
    id: 1,
    content: t('testimonials.items.ra_energy.content'),
    author: {
      name: 'Yazid C.',
      role: t('testimonials.items.ra_energy.role'),
      avatar: '/img/testimonials/yazid-ra-energy.jpeg'
    },
  },
  {
    id: 2,
    content: t('testimonials.items.souji_nova.content'),
    author: {
      name: 'Nelson M.',
      role: t('testimonials.items.souji_nova.role'),
      avatar: '/img/testimonials/nelson-souji-nova.jpg'
    },
  },
  {
    id: 3,
    content: t('testimonials.items.fontaines_vtc.content'),
    author: {
      name: 'Mario C.',
      role: t('testimonials.items.fontaines_vtc.role'),
      avatar: '/img/testimonials/mario-fontaines-vtc.png'
    }
  },
  {
    id: 4,
    content: t('testimonials.items.liquid_scan.content'),
    author: {
      name: 'Pierre J.',
      role: t('testimonials.items.liquid_scan.role'),
      avatar: '/img/testimonials/pierre jean.jpg'
    }
  },
  {
    id: 5,
    content: t('testimonials.items.amg_promotion.content'),
    author: {
      name: 'Jean francois Fialaire',
      role: t('testimonials.items.amg_promotion.role'),
      avatar: '/img/testimonials/jean-francois-fialaire.svg'
    },
  }
])

const currentIndex = ref(0)
const isPaused = ref(false)
let autoScrollInterval: ReturnType<typeof setInterval> | null = null

// Navigation
const nextTestimonial = () => {
  currentIndex.value = (currentIndex.value + 1) % testimonials.value.length
}

const prevTestimonial = () => {
  currentIndex.value = (currentIndex.value - 1 + testimonials.value.length) % testimonials.value.length
}

const currentTestimonial = computed(() => testimonials.value[currentIndex.value])

// Auto-scroll
const startAutoScroll = () => {
  if (autoScrollInterval) clearInterval(autoScrollInterval)
  autoScrollInterval = setInterval(() => {
    if (!isPaused.value) {
      nextTestimonial()
    }
  }, 5000)
}

const pauseAutoScroll = () => {
  isPaused.value = true
}

const resumeAutoScroll = () => {
  isPaused.value = false
}

onMounted(() => {
  startAutoScroll()
})

onUnmounted(() => {
  if (autoScrollInterval) clearInterval(autoScrollInterval)
})
</script>

<template>
  <p class="text-gradient text-center mb-2">{{ $t('testimonials.intro_label') }}</p>

  <p class="text-gradient text-center text-lg sm:text-xl md:text-3xl" v-html="$t('testimonials.intro_text')">
  </p>
  <section id="avis" class="relative overflow-hidden bg-[var(--bg-primary)] px-4 py-12 transition-colors duration-300 ease-out sm:px-6 sm:py-20" @mouseenter="pauseAutoScroll" @mouseleave="resumeAutoScroll">
    <div class="pointer-events-none absolute left-1/2 top-36 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f0bf6c]/[0.07] blur-[100px]" aria-hidden="true"></div>

    <div class="max-w-[1216px] mx-auto">
      <h2 class="section-title text-center font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-8 sm:mb-10 transition-colors duration-300 text-[var(--text-primary)]" v-html="$t('testimonials.title')">
      </h2>

      <!-- Google rating summary -->
      <div class="relative mx-auto mb-5 flex w-full max-w-[760px] flex-col gap-5 overflow-hidden rounded-2xl border border-[#e4c98f] bg-[linear-gradient(135deg,#faeed7_0%,rgba(255,255,255,0.92)_52%,#ffffff_100%)] p-5 shadow-[0_18px_55px_rgba(88,67,33,0.09)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div class="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-[#f0bf6c]/15 blur-3xl" aria-hidden="true"></div>

        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] sm:h-14 sm:w-14">
            <svg class="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>

          <div>
            <p class="mb-1 font-inter text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-gold-readable)]">{{ $t('testimonials.google_label') }}</p>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1" :aria-label="$t('testimonials.google_rating_label')">
              <span class="font-manrope text-3xl font-semibold leading-none text-[var(--text-primary)] sm:text-4xl">{{ $t('testimonials.google_rating_value') }}</span>
              <div class="flex items-center gap-0.5 text-[#f0bf6c]" aria-hidden="true">
                <svg v-for="star in 5" :key="star" class="h-4 w-4 sm:h-[18px] sm:w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2.2 2.95 5.98 6.6.96-4.77 4.65 1.12 6.57L12 17.26l-5.9 3.1 1.12-6.57-4.77-4.65 6.6-.96L12 2.2Z"/>
                </svg>
              </div>
              <span class="font-inter text-sm text-[var(--text-secondary)]">/ 5</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 border-t border-[var(--border-subtle)] pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div class="flex -space-x-2" aria-hidden="true">
            <NuxtImg
              v-for="testimonial in testimonials"
              :key="testimonial.id"
              :src="testimonial.author.avatar"
              class="h-8 w-8 rounded-full border-2 border-white object-cover"
            />
          </div>
          <p class="max-w-28 font-inter text-xs leading-relaxed text-[var(--text-secondary)]">{{ $t('testimonials.google_trust_text') }}</p>
        </div>
      </div>

      <!-- Testimonial Card -->
      <div
        v-if="currentTestimonial"
        class="relative mx-auto flex min-h-[310px] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-[0_18px_55px_rgba(88,67,33,0.09)] transition-colors duration-300 sm:min-h-[290px] sm:p-8"
        aria-live="polite"
      >
        <div class="pointer-events-none absolute right-6 top-3 font-serif text-[96px] leading-none text-[#f0bf6c]/10" aria-hidden="true">“</div>

        <div class="relative flex h-full flex-1 flex-col justify-between gap-7">
          <div>
            <div class="mb-5 flex items-center justify-between gap-4">
              <div class="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-soft)] px-3 py-1.5">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span class="font-inter text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">{{ $t('testimonials.google_review') }}</span>
              </div>

              <div class="flex items-center gap-0.5 text-[#f0bf6c]" :aria-label="$t('testimonials.five_stars')">
                <svg v-for="star in 5" :key="star" class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="m12 2.2 2.95 5.98 6.6.96-4.77 4.65 1.12 6.57L12 17.26l-5.9 3.1 1.12-6.57-4.77-4.65 6.6-.96L12 2.2Z"/>
                </svg>
              </div>
            </div>

          <!-- Quote -->
            <p class="whitespace-pre-line font-inter text-base leading-[1.75] text-[var(--text-primary)] transition-colors duration-300 sm:text-lg">
              {{ currentTestimonial.content }}
            </p>
          </div>

          <div class="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-5">
            <!-- Author Info -->
            <div class="flex items-center gap-3">
              <NuxtImg :src="currentTestimonial.author.avatar" :alt="currentTestimonial.author.name" class="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[#e8a84c] flex items-center justify-center object-cover shrink-0 ring-2 ring-[#f0bf6c]/25"/>
              <div class="flex flex-col gap-[2px]">
                <span class="font-inter text-sm font-semibold text-[var(--text-primary)] transition-colors duration-300">{{ currentTestimonial.author.name }}</span>
                <span class="font-inter text-xs text-[var(--text-secondary)] transition-colors duration-300">{{ currentTestimonial.author.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Navigation -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
        <div class="flex gap-3">
          <button
              class="flex items-center justify-center w-11 h-[42px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] shadow-[0_8px_24px_rgba(88,67,33,0.07)] cursor-pointer transition-all duration-200 hover:border-[var(--color-gold-readable)] hover:text-[var(--color-gold-readable)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
              @click="prevTestimonial"
              :aria-label="$t('testimonials.previous')"
          >
            <UIcon name="i-lucide-chevron-left" />
          </button>
          <button
              class="flex items-center justify-center w-11 h-[42px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] shadow-[0_8px_24px_rgba(88,67,33,0.07)] cursor-pointer transition-all duration-200 hover:border-[var(--color-gold-readable)] hover:text-[var(--color-gold-readable)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
              @click="nextTestimonial"
              :aria-label="$t('testimonials.next')"
          >
            <UIcon name="i-lucide-chevron-right" />
          </button>
        </div>

        <!-- Indicators -->
        <div class="flex items-center gap-3">
          <button
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.id"
            class="w-6 h-1 rounded bg-[var(--border-subtle)] border-none cursor-pointer p-0 transition-all duration-300 hover:bg-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg-primary)]"
            :class="{ '!bg-[var(--color-gold)] !w-8': currentIndex === index }"
            @click="currentIndex = index"
            :aria-label="$t('testimonials.go_to_review', { number: index + 1 })"
          >
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
