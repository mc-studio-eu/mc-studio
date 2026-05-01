<script setup lang="ts">
import gsap from 'gsap'

const { t } = useI18n()
const config = useRuntimeConfig()
const platformUrl = computed(() => String(config.public.partnerPlatformUrl || ''))

const heroPrimaryBtn = ref<HTMLElement | null>(null)
const heroPrimaryWrapper1 = ref<HTMLElement | null>(null)
const heroPrimaryWrapper2 = ref<HTMLElement | null>(null)
const heroSecondaryBtn = ref<HTMLElement | null>(null)
const heroSecondaryWrapper = ref<HTMLElement | null>(null)

const commissionValue = ref<HTMLElement | null>(null)

useTextSlideAnimation(heroPrimaryBtn, [heroPrimaryWrapper1, heroPrimaryWrapper2])
useTextSlideAnimation(heroSecondaryBtn, heroSecondaryWrapper)

const scrollToPrincipe = () => {
  const el = document.getElementById('partner-cal')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  gsap.fromTo(
    '.hero-title',
    {
      opacity: 0,
      filter: 'blur(20px)',
      y: 20
    },
    {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      duration: 1.5,
      ease: 'power2.out'
    }
  )

  gsap.fromTo(
    '.hero-subtitle',
    {
      opacity: 0,
      filter: 'blur(15px)',
      y: 15
    },
    {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      duration: 0.8,
      delay: 0.3,
      ease: 'power2.out'
    }
  )

  const targetCommission = 10
  if (commissionValue.value) {
    const counter = { value: 0 }
    gsap.to(counter, {
      value: targetCommission,
      duration: 1.2,
      delay: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        if (commissionValue.value) {
          commissionValue.value.textContent = String(Math.round(counter.value))
        }
      }
    })
  }
})
</script>

<template>
  <section
    class="relative w-full rounded-lg overflow-hidden min-h-[calc(80svh-10px)] sm:min-h-[520px] lg:min-h-[580px]"
  >
    <!-- Background Image -->
    <NuxtImg
      src="/img/main/background.svg"
      alt="Fond MC Studio"
      format="svg"
      preload
      class="absolute inset-0 w-full h-full object-cover object-center rounded-lg"
    />

    <!-- Content -->
    <div
      class="relative z-10 flex flex-col items-center h-full px-4 sm:px-6 pt-6 sm:pt-8 pb-10 sm:pb-16 max-w-[1180px] mx-auto"
    >
      <PartnersNavbar />

      <div
        class="flex flex-1 flex-col items-center justify-center gap-8 mt-8 sm:mt-10 max-w-[720px] w-full px-2 sm:px-4 md:px-6 text-center"
      >
        <div
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]"></span>
          <span class="font-inter text-[11px] uppercase tracking-[0.16em] text-white/80">
            {{ t('partners.hero.badge') }}
          </span>
        </div>

        <div class="space-y-5">
          <h1
            class="w-full text-center hero-title font-manrope font-medium leading-[1.15] sm:leading-[1.2] md:leading-tight text-transparent bg-clip-text bg-[linear-gradient(270deg,#f0bf6c_0%,white_67.308%)] text-[clamp(1.25rem,6vw,1.5rem)] min-[480px]:text-[clamp(1.5rem,5vw,1.75rem)] sm:text-[clamp(2rem,4.5vw,2.25rem)] md:text-[clamp(2.25rem,4vw,2.625rem)] lg:text-[2.625rem] xl:text-[3rem] opacity-0"
            style="filter: blur(20px); transform: translateY(20px)"
          >
            {{ t('partners.hero.title') }}
          </h1>
          <p
            class="w-full text-center hero-subtitle font-normal leading-[1.6] sm:leading-[1.7] tracking-wide text-white/90 text-[clamp(0.8125rem,2.5vw,0.875rem)] sm:text-[clamp(0.875rem,2vw,1rem)] md:text-base lg:text-[1.0625rem] xl:text-[1.1875rem] opacity-0"
            style="filter: blur(15px); transform: translateY(15px)"
          >
            {{ t('partners.hero.subtitle') }}
          </p>
        </div>

        <!-- Hero CTA -->
        <div class="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-4 sm:gap-5">
          <a
            ref="heroPrimaryBtn"
            :href="platformUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="cta-primary gap-2 flex items-center justify-center px-3 py-2 rounded-lg font-medium text-[15px] sm:text-sm md:text-[15px]
            lg:text-base text-[#0f0f0f] cursor-pointer backdrop-blur-md transition-all
            duration-200 no-underline"
          >
            <NuxtImg
              src="/img/main/founder.jpeg"
              alt="MC Studio"
              class="w-6 h-6 md:w-8 md:h-8 object-cover rounded-lg flex items-center justify-center font-inter font-semibold text-[10px] text-[#0f0f0f]"
            />
            <div class="flex flex-col items-start gap-px">
              <span class="text-slide-container h-[18px]">
                <span ref="heroPrimaryWrapper1" class="text-slide-wrapper">
                  <span class="text-slide-text h-[18px] leading-[18px] font-inter text-sm font-semibold">
                    {{ t('partners.hero.primary_main') }}
                  </span>
                  <span class="text-slide-text h-[18px] leading-[18px] font-inter text-sm font-semibold">
                    {{ t('partners.hero.primary_main') }}
                  </span>
                </span>
              </span>
              <span class="text-slide-container h-[12px]">
                <span ref="heroPrimaryWrapper2" class="text-slide-wrapper">
                  <span class="text-slide-text h-[12px] leading-[12px] font-inter font-normal text-[9px]">
                    {{ t('partners.hero.primary_sub') }}
                  </span>
                  <span class="text-slide-text h-[12px] leading-[12px] font-inter font-normal text-[9px]">
                    {{ t('partners.hero.primary_sub') }}
                  </span>
                </span>
              </span>
            </div>
          </a>

          <button
            ref="heroSecondaryBtn"
            type="button"
            class="secondary-btn border-none group flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-[#f0eadb] cursor-pointer transition-all duration-300 no-underline bg-black/50 border border-white/12 hover:bg-black/70"
            @click="scrollToPrincipe"
          >
            <span class="text-slide-container h-[20px]">
              <span ref="heroSecondaryWrapper" class="text-slide-wrapper">
                <span class="text-slide-text h-[20px] leading-[20px]">
                  {{ t('partners.hero.secondary') }}
                </span>
                <span class="text-slide-text h-[20px] leading-[20px]">
                  {{ t('partners.hero.secondary') }}
                </span>
              </span>
            </span>
          </button>
        </div>

        <!-- Highlight card -->
        <div
          class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[640px] mx-auto"
        >
          <div
            class="col-span-2 rounded-xl border border-white/10 bg-black/35 backdrop-blur-xl px-4 py-4 flex items-center justify-between gap-3"
          >
            <div class="space-y-1">
              <p class="font-inter text-[11px] uppercase tracking-[0.16em] text-white/60">
                {{ t('partners.hero.example_label') }}
              </p>
              <p class="font-inter text-sm sm:text-[15px] text-white/90" v-html="t('partners.hero.example_text')">
              </p>
            </div>
          </div>

          <div
            class="rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl px-4 py-4 flex flex-col justify-center"
          >
            <p class="font-inter text-[11px] uppercase tracking-[0.16em] text-white/60">
              {{ t('partners.hero.commission_label') }}
            </p>
            <p class="font-manrope text-2xl font-semibold text-white mt-1">
              <span ref="commissionValue">0</span>&nbsp;%
            </p>
            <p class="font-inter text-[11px] text-white/60 mt-1">
              {{ t('partners.hero.commission_note') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-slide-container {
  display: block;
  position: relative;
  overflow: hidden;
}

.text-slide-wrapper {
  display: flex;
  flex-direction: column;
}

.text-slide-text {
  display: block;
}
</style>

