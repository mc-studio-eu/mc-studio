<script setup lang="ts">
import gsap from 'gsap'

const { t } = useI18n()

const primaryBtn = ref<HTMLElement | null>(null)
const primaryWrapper1 = ref<HTMLElement | null>(null)
const primaryWrapper2 = ref<HTMLElement | null>(null)
const secondaryBtn = ref<HTMLElement | null>(null)
const secondaryWrapper = ref<HTMLElement | null>(null)

useTextSlideAnimation(primaryBtn, [primaryWrapper1, primaryWrapper2])
useTextSlideAnimation(secondaryBtn, secondaryWrapper)

const facts = ['audit', 'delay', 'ownership'] as const

onMounted(() => {
  gsap.fromTo(
    '.crm-hero-title',
    { opacity: 0, filter: 'blur(20px)', y: 20 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.4, ease: 'power2.out' }
  )

  gsap.fromTo(
    '.crm-hero-subtitle',
    { opacity: 0, filter: 'blur(15px)', y: 15 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
  )

  gsap.fromTo(
    '.crm-hero-fact',
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.6, delay: 0.55, stagger: 0.08, ease: 'power2.out' }
  )
})
</script>

<template>
  <section
    class="relative w-full overflow-hidden rounded-lg min-h-[calc(88svh-10px)] sm:min-h-[620px] lg:min-h-[680px]"
  >
    <NuxtImg
      src="/img/main/background.svg"
      alt="Fond MC Studio"
      format="svg"
      preload
      class="absolute inset-0 h-full w-full rounded-lg object-cover object-center"
    />

    <div class="relative z-10 flex h-full flex-col items-center px-4 pb-12 sm:px-6 sm:pb-16">
      <CrmNavbar variant="header" />

      <div
        class="mt-10 flex w-full max-w-[820px] flex-1 flex-col items-center justify-center gap-6 text-center sm:mt-12 md:gap-7"
      >
        <div
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
          <span class="font-inter text-[11px] uppercase tracking-[0.16em] text-white/80">
            {{ t('crm_offer.hero.badge') }}
          </span>
        </div>

        <h1
          class="crm-hero-title w-full font-manrope font-medium leading-[1.15] opacity-0 text-[clamp(1.5rem,6vw,1.75rem)] sm:text-[clamp(2rem,4.5vw,2.25rem)] md:text-[clamp(2.25rem,4vw,2.625rem)] lg:text-[2.75rem] xl:text-[3.125rem]"
          style="filter: blur(20px); transform: translateY(20px)"
        >
          <!-- The hero always sits on the dark background image, so the title keeps the
               light-on-dark gold gradient in both color modes. -->
          <span class="crm-hero-gradient">{{ t('crm_offer.hero.title') }}</span>
        </h1>

        <p
          class="crm-hero-subtitle max-w-[620px] font-inter font-normal leading-[1.7] tracking-wide text-white/90 opacity-0 text-[clamp(0.875rem,2.5vw,1rem)] md:text-base lg:text-[1.0625rem]"
          style="filter: blur(15px); transform: translateY(15px)"
        >
          {{ t('crm_offer.hero.subtitle') }}
        </p>

        <div class="mt-1 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
          <a
            ref="primaryBtn"
            href="#contact"
            class="cta-primary flex items-center justify-center gap-2.5 rounded-xl px-3 py-2 font-medium text-[#0f0f0f] no-underline backdrop-blur-md transition-all duration-200"
          >
            <NuxtImg
              src="/img/main/founder.jpeg"
              alt="MC Studio"
              class="h-9 w-9 shrink-0 rounded-xl object-cover object-[center_18%] ring-1 ring-black/10 md:h-10 md:w-10"
            />
            <span class="flex flex-col items-start gap-px">
              <span class="text-slide-container h-[18px]">
                <span ref="primaryWrapper1" class="text-slide-wrapper">
                  <span class="text-slide-text h-[18px] font-inter text-sm font-semibold leading-[18px]">
                    {{ t('crm_offer.hero.primary_main') }}
                  </span>
                  <span class="text-slide-text h-[18px] font-inter text-sm font-semibold leading-[18px]">
                    {{ t('crm_offer.hero.primary_main') }}
                  </span>
                </span>
              </span>
              <span class="text-slide-container h-[12px]">
                <span ref="primaryWrapper2" class="text-slide-wrapper">
                  <span class="text-slide-text h-[12px] font-inter text-[9px] font-normal leading-[12px]">
                    {{ t('crm_offer.hero.primary_sub') }}
                  </span>
                  <span class="text-slide-text h-[12px] font-inter text-[9px] font-normal leading-[12px]">
                    {{ t('crm_offer.hero.primary_sub') }}
                  </span>
                </span>
              </span>
            </span>
          </a>

          <a
            ref="secondaryBtn"
            href="#process"
            class="flex items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-black/50 px-5 py-2.5 font-inter text-sm font-medium text-[#f0eadb] no-underline transition-all duration-300 hover:bg-black/70"
          >
            <span class="text-slide-container h-[20px]">
              <span ref="secondaryWrapper" class="text-slide-wrapper">
                <span class="text-slide-text h-[20px] leading-[20px]">
                  {{ t('crm_offer.hero.secondary') }}
                </span>
                <span class="text-slide-text h-[20px] leading-[20px]">
                  {{ t('crm_offer.hero.secondary') }}
                </span>
              </span>
            </span>
          </a>
        </div>

        <!-- Key facts -->
        <div class="mt-4 grid w-full max-w-[620px] grid-cols-3 gap-3 sm:gap-4">
          <div
            v-for="fact in facts"
            :key="fact"
            class="crm-hero-fact flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-black/35 px-2 py-3.5 backdrop-blur-xl sm:px-4"
          >
            <span class="font-inter text-[10px] uppercase tracking-[0.14em] text-white/60 sm:text-[11px]">
              {{ t(`crm_offer.hero.facts.${fact}.label`) }}
            </span>
            <span class="font-manrope text-base font-semibold text-white sm:text-xl">
              {{ t(`crm_offer.hero.facts.${fact}.value`) }}
            </span>
          </div>
        </div>

        <p class="font-inter text-xs text-white/55 sm:text-[13px]">
          {{ t('crm_offer.hero.note') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.crm-hero-gradient {
  background: linear-gradient(270deg, #f0bf6c 0%, #ffffff 67.308%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

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
