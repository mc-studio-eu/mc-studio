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

      <!-- Testimonial Card -->
      <div
        v-if="currentTestimonial"
        class="relative mx-auto flex min-h-[310px] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#202020] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition-colors duration-300 sm:min-h-[290px] sm:p-8"
        aria-live="polite"
      >
        <div class="pointer-events-none absolute right-6 top-3 font-serif text-[96px] leading-none text-[#f0bf6c]/10" aria-hidden="true">“</div>

        <div class="relative flex h-full flex-1 flex-col justify-between gap-7">
          <div>
            <div class="mb-5 flex items-center justify-end">
              <div class="flex items-center gap-0.5 text-[#f0bf6c]" :aria-label="$t('testimonials.five_stars')">
                <svg v-for="star in 5" :key="star" class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="m12 2.2 2.95 5.98 6.6.96-4.77 4.65 1.12 6.57L12 17.26l-5.9 3.1 1.12-6.57-4.77-4.65 6.6-.96L12 2.2Z"/>
                </svg>
              </div>
            </div>

          <!-- Quote -->
            <p class="whitespace-pre-line font-inter text-base leading-[1.75] text-white/90 transition-colors duration-300 sm:text-lg">
              {{ currentTestimonial.content }}
            </p>
          </div>

          <div class="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
            <!-- Author Info -->
            <div class="flex items-center gap-3">
              <NuxtImg :src="currentTestimonial.author.avatar" :alt="currentTestimonial.author.name" class="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[#e8a84c] flex items-center justify-center object-cover shrink-0 ring-2 ring-[#f0bf6c]/25"/>
              <div class="flex flex-col gap-[2px]">
                <span class="font-inter text-sm font-semibold text-white transition-colors duration-300">{{ currentTestimonial.author.name }}</span>
                <span class="font-inter text-xs text-white/50 transition-colors duration-300">{{ currentTestimonial.author.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Navigation -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
        <div class="flex gap-3">
          <button
              class="flex items-center justify-center w-11 h-[42px] bg-[#232323] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] cursor-pointer transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
              @click="prevTestimonial"
              :aria-label="$t('testimonials.previous')"
          >
            <UIcon name="i-lucide-chevron-left" />
          </button>
          <button
              class="flex items-center justify-center w-11 h-[42px] bg-[#232323] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] cursor-pointer transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
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
