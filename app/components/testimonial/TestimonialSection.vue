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
    content: t('testimonials.items.shika_consulting.content'),
    author: {
      name: 'Nouri Yahi',
      role: t('testimonials.items.shika_consulting.role'),
      avatar: '/img/testimonials/nouri-shika-consulting.png'
    },
  },
  {
    id: 2,
    content: t('testimonials.items.ra_energy.content'),
    author: {
      name: 'Yazid C.',
      role: t('testimonials.items.ra_energy.role'),
      avatar: '/img/testimonials/yazid-ra-energy.jpeg'
    },
  },
  {
    id: 3,
    content: t('testimonials.items.souji_nova.content'),
    author: {
      name: 'Nelson M.',
      role: t('testimonials.items.souji_nova.role'),
      avatar: '/img/testimonials/nelson-souji-nova.jpg'
    },
  },
  {
    id: 4,
    content: t('testimonials.items.fontaines_vtc.content'),
    author: {
      name: 'Mario C.',
      role: t('testimonials.items.fontaines_vtc.role'),
      avatar: '/img/testimonials/mario-fontaines-vtc.png'
    }
  },
  {
    id: 5,
    content: t('testimonials.items.liquid_scan.content'),
    author: {
      name: 'Pierre J.',
      role: t('testimonials.items.liquid_scan.role'),
      avatar: '/img/testimonials/pierre jean.jpg'
    }
  },
  {
    id: 6,
    content: t('testimonials.items.amg_promotion.content'),
    author: {
      name: 'Jean francois Fialaire',
      role: t('testimonials.items.amg_promotion.role'),
      avatar: '/img/testimonials/jean-francois-fialaire.svg'
    },
  }
])

// Split into two marquee rows scrolling in opposite directions
const rows = computed(() => {
  const half = Math.ceil(testimonials.value.length / 2)
  return [testimonials.value.slice(0, half), testimonials.value.slice(half)]
})
</script>

<template>
  <p class="text-gradient text-center mb-2">{{ $t('testimonials.intro_label') }}</p>

  <p class="text-gradient text-center text-lg sm:text-xl md:text-3xl" v-html="$t('testimonials.intro_text')">
  </p>
  <section id="avis" class="relative overflow-hidden bg-[var(--bg-primary)] py-12 transition-colors duration-300 ease-out sm:py-20">
    <div class="pointer-events-none absolute left-1/2 top-36 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f0bf6c]/[0.07] blur-[100px]" aria-hidden="true"></div>

    <h2 class="section-title text-center font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-8 sm:mb-10 px-4 transition-colors duration-300 text-[var(--text-primary)]" v-html="$t('testimonials.title')">
    </h2>

    <div class="relative flex flex-col gap-5">
      <div class="testimonial-fade-left" aria-hidden="true"></div>
      <div class="testimonial-fade-right" aria-hidden="true"></div>

      <UMarquee
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        pause-on-hover
        :reverse="rowIndex % 2 === 1"
        :overlay="false"
        :ui="{
          root: '[--duration:60s] [--gap:1.25rem]',
          content: 'w-auto justify-start items-stretch motion-reduce:[animation-play-state:paused]'
        }"
      >
        <!-- Testimonial Card -->
        <article
          v-for="testimonial in row"
          :key="testimonial.id"
          class="relative flex w-[300px] flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-white/10 bg-[#202020] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition-colors duration-300 hover:border-[#f0bf6c]/30 sm:w-[400px] sm:p-7"
        >
          <div class="pointer-events-none absolute right-5 top-2 font-serif text-[80px] leading-none text-[#f0bf6c]/10" aria-hidden="true">“</div>

          <!-- Quote -->
          <p class="relative whitespace-pre-line font-inter text-sm leading-[1.7] text-white/90 sm:text-base">
            {{ testimonial.content }}
          </p>

          <!-- Author Info -->
          <div class="flex items-center gap-3 border-t border-white/10 pt-5">
            <NuxtImg :src="testimonial.author.avatar" :alt="testimonial.author.name" class="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[#e8a84c] object-cover shrink-0 ring-2 ring-[#f0bf6c]/25"/>
            <div class="flex flex-col gap-[2px]">
              <span class="font-inter text-sm font-semibold text-white">{{ testimonial.author.name }}</span>
              <span class="font-inter text-xs text-white/50">{{ testimonial.author.role }}</span>
            </div>
          </div>
        </article>
      </UMarquee>
    </div>
  </section>
</template>

<style scoped>
.testimonial-fade-left,
.testimonial-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12%;
  z-index: 5;
  pointer-events: none;
}

.testimonial-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--bg-primary) 0%, transparent 100%);
}

.testimonial-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--bg-primary) 0%, transparent 100%);
}
</style>
