<script setup lang="ts">
interface Testimonial {
  id: number
  content: string
  author: {
    name: string
    role: string
    avatar?: string
  }
}

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
  }
])

const currentIndex = ref(0)
const isPaused = ref(false)
let autoScrollInterval: ReturnType<typeof setInterval> | null = null

const nextTestimonial = () => {
  currentIndex.value = (currentIndex.value + 1) % testimonials.value.length
}

const prevTestimonial = () => {
  currentIndex.value = (currentIndex.value - 1 + testimonials.value.length) % testimonials.value.length
}

const currentTestimonial = computed(() => testimonials.value[currentIndex.value])

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

  <p class="text-gradient text-center mb-2">{{ t('testimonials.intro_label') }}</p>

  <p class="text-gradient text-center text-lg sm:text-xl md:text-3xl" v-html="t('testimonials.intro_text')">
  </p>
  <section id="avis" class="py-12 px-6 sm:py-20 bg-[var(--bg-primary)] transition-colors duration-300 ease-out" @mouseenter="pauseAutoScroll" @mouseleave="resumeAutoScroll">
    <div class="max-w-[1216px] mx-auto">
      <h2 class="section-title text-center font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-6 sm:mb-8 transition-colors duration-300 text-[var(--text-primary)]" v-html="t('testimonials.title')">
      </h2>

      <!-- Testimonial Card -->
      <div class="w-full max-w-[460px] mx-auto p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl h-[300px] sm:h-[230px] flex flex-col transition-colors duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none" v-if="currentTestimonial">
        <div class="flex flex-col sm:gap-0 gap-4 justify-between h-full">
          <p class="font-inter text-xs sm:text-sm leading-[1.7] text-[var(--text-primary)] transition-colors duration-300">
            {{ currentTestimonial.content }}
          </p>

          <div class="flex sm:flex-row flex-col sm:items-center justify-between gap-2 sm:gap-4">
            <div class="flex items-center gap-3">
              <NuxtImg :src="currentTestimonial.author.avatar" class="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[#e8a84c] flex items-center justify-center object-cover shrink-0"/>
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
              class="flex items-center justify-center w-11 h-[42px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] cursor-pointer transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              @click="prevTestimonial"
              aria-label="Avis précédent"
          >
            <UIcon name="i-lucide-chevron-left" />
          </button>
          <button
              class="flex items-center justify-center w-11 h-[42px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] cursor-pointer transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              @click="nextTestimonial"
              aria-label="Avis suivant"
          >
            <UIcon name="i-lucide-chevron-right" />
          </button>
        </div>

        <!-- Indicators -->
        <div class="flex items-center gap-3">
          <button
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.id"
            class="w-6 h-1 rounded bg-[var(--border-subtle)] border-none cursor-pointer p-0 transition-all duration-300 hover:bg-[var(--text-secondary)]"
            :class="{ '!bg-[var(--color-gold)] !w-8': currentIndex === index }"
            @click="currentIndex = index"
            :aria-label="`Aller à l'avis ${index + 1}`"
          >
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
