<script setup lang="ts">
import { findOfferBySlug, offers } from '../../data/offers'

type LocaleKey = 'fr' | 'en'

const route = useRoute()
const localePath = useLocalePath()
const { locale, t, tm, rt } = useI18n()

const currentLocale = computed<LocaleKey>(() => (locale.value === 'en' ? 'en' : 'fr'))
const offer = computed(() => findOfferBySlug(route.params.slug as string))

if (!offer.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Offer not found',
  })
}

const localizedOffer = computed(() => {
  const currentOffer = offer.value!
  const lang = currentLocale.value

  return {
    ...currentOffer,
    title: t(`services.cards.${currentOffer.key}.title`),
    description: t(`services.cards.${currentOffer.key}.description`),
    forWho: Object.values(tm(`services.cards.${currentOffer.key}.for_who`) as object || {}).map(item => rt(item)),
    idealIf: Object.values(tm(`services.cards.${currentOffer.key}.ideal_if`) as object || {}).map(item => rt(item)),
    heroTitle: currentOffer.heroTitle[lang],
    heroSummary: currentOffer.heroSummary[lang],
    profileLabel: currentOffer.profileLabel[lang],
    profileValue: currentOffer.profileValue[lang],
    timeframeLabel: currentOffer.timeframeLabel[lang],
    timeframeValue: currentOffer.timeframeValue[lang],
    investmentLabel: currentOffer.investmentLabel[lang],
    investmentValue: currentOffer.investmentValue[lang],
    fitBullets: currentOffer.fitBullets[lang],
    challenges: currentOffer.challenges[lang],
    objectives: currentOffer.objectives[lang],
    deliverables: currentOffer.deliverables[lang],
    process: currentOffer.process[lang],
  }
})

const nextOffer = computed(() => {
  const currentIndex = offers.findIndex((item) => item.slug === localizedOffer.value.slug)
  if (currentIndex < 0) {
    return undefined
  }
  return offers[(currentIndex + 1) % offers.length]
})

const labels = computed(() =>
  currentLocale.value === 'fr'
    ? {
        back: 'Retour aux offres',
        featuredTag: 'Populaire',
        fitTitle: 'Cette offre est faite pour',
        challengesTitle: 'Enjeux typiques',
        objectivesTitle: 'Ce qu’on cherche à obtenir',
        deliverablesTitle: 'Ce que comprend l’offre',
        processTitle: 'Comment on travaille',
        nextOffer: 'Offre suivante',
      }
    : {
        back: 'Back to offers',
        featuredTag: 'Popular',
        fitTitle: 'This offer is built for',
        challengesTitle: 'Typical challenges',
        objectivesTitle: 'What we aim to achieve',
        deliverablesTitle: 'What we build',
        processTitle: 'How we work',
        nextOffer: 'Next offer',
      }
)

useSeoMeta({
  title: `${localizedOffer.value.title} | MC Studio`,
  description: localizedOffer.value.heroSummary,
  ogTitle: `${localizedOffer.value.title} | MC Studio`,
  ogDescription: localizedOffer.value.heroSummary,
})
</script>

<template>
  <main class="min-h-screen bg-[var(--bg-primary)] px-6 py-6 transition-colors duration-300">
    <div class="mx-auto max-w-[1360px]">
      <NuxtLink
        :to="localePath({ path: '/', hash: '#services' })"
        class="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2 text-sm text-[var(--text-secondary)] no-underline transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--text-primary)]"
      >
        <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
        <span>{{ labels.back }}</span>
      </NuxtLink>

      <section class="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
        <div class="space-y-6 lg:sticky lg:top-8">
          <div
            class="rounded-[28px] border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm"
            :class="localizedOffer.featured ? 'border-[#f0bf6c]/30 bg-[linear-gradient(180deg,#1c1a15_0%,#161616_100%)]' : 'border-[var(--border-subtle)] bg-white/[0.03]'"
          >
            <div class="mb-5 flex items-center gap-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-[14px] border"
                :class="localizedOffer.featured ? 'border-transparent bg-[linear-gradient(135deg,#F0BF6C_0%,#e0a84d_100%)]' : 'border-[#f0bf6c]/15 bg-[#f0bf6c]/10'"
              >
                <UIcon
                  :name="localizedOffer.icon"
                  class="h-5 w-5"
                  :class="localizedOffer.featured ? 'text-[#0f0f0f]' : 'text-[#F0BF6C]'"
                />
              </div>

              <span
                v-if="localizedOffer.featured"
                class="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#F0BF6C_0%,#e0a84d_100%)] px-3 py-1 text-[11px] font-semibold text-[#0f0f0f]"
              >
                <UIcon name="i-heroicons-star-solid" class="h-3 w-3" />
                {{ labels.featuredTag }}
              </span>
            </div>

            <p class="font-manrope text-[40px] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[52px]">
              {{ localizedOffer.title }}
            </p>

            <p class="mt-5 text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
              {{ localizedOffer.heroTitle }}
            </p>

            <p class="mt-4 text-sm leading-7 text-[var(--text-secondary)]/90">
              {{ localizedOffer.heroSummary }}
            </p>

            <div class="mt-6 space-y-3">
              <NuxtLink
                :to="localePath({ path: '/', hash: '#contact' })"
                class="inline-flex w-fit items-center gap-2.5 rounded-2xl bg-[linear-gradient(90deg,#ffffff_0%,#f6ebd5_48%,#f3c56f_100%)] p-1.5 pr-4 font-inter text-[#121212] no-underline shadow-[0_8px_24px_rgba(240,191,108,0.14)] transition-all duration-200 hover:brightness-105"
              >
                <NuxtImg
                  src="/img/main/founder.png"
                  alt="MC Studio"
                  class="h-10 w-10 rounded-xl object-cover"
                />

                <div class="flex flex-col items-start leading-none">
                  <span class="text-[14px] font-semibold leading-[1.1]">
                    {{ t('hero.cta.book') }}
                  </span>
                  <span class="mt-0.5 text-[10px] font-normal text-[#121212]/60">
                    {{ t('nav.free_call') }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div class="rounded-[24px] border border-[var(--border-subtle)] bg-white/[0.03] p-6">
            <div class="grid gap-4">
              <div class="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-4">
                <p class="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  {{ localizedOffer.profileLabel }}
                </p>
                <p class="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {{ localizedOffer.profileValue }}
                </p>
              </div>

              <div class="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-4">
                <p class="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  {{ localizedOffer.timeframeLabel }}
                </p>
                <p class="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {{ localizedOffer.timeframeValue }}
                </p>
              </div>

              <div class="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-4">
                <p class="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  {{ localizedOffer.investmentLabel }}
                </p>
                <p class="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {{ localizedOffer.investmentValue }}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-[24px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
            <h3 class="max-w-[18ch] font-manrope text-[30px] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)]">
              {{ labels.fitTitle }}
            </h3>

            <ul class="mt-5 space-y-3">
              <li
                v-for="item in localizedOffer.fitBullets"
                :key="item"
                class="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
              >
                <UIcon name="i-heroicons-check-circle-solid" class="mt-0.5 h-4 w-4 shrink-0 text-[#7bd88f]" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="space-y-8">
          <div class="grid gap-8 xl:grid-cols-2">
            <section class="rounded-[28px] border border-[var(--border-subtle)] bg-white/[0.03] p-6">
              <h2 class="font-manrope text-[38px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                {{ labels.challengesTitle }}
              </h2>

              <ul class="mt-5 space-y-4">
                <li
                  v-for="item in localizedOffer.challenges"
                  :key="item"
                  class="flex items-start gap-3 text-sm leading-7 text-[var(--text-primary)]"
                >
                  <span class="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <section class="rounded-[28px] border border-[var(--border-subtle)] bg-white/[0.03] p-6">
              <h2 class="font-manrope text-[38px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                {{ labels.objectivesTitle }}
              </h2>

              <ul class="mt-5 space-y-4">
                <li
                  v-for="item in localizedOffer.objectives"
                  :key="item"
                  class="flex items-start gap-3 text-sm leading-7 text-[var(--text-primary)]"
                >
                  <span class="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7bd88f]"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>
          </div>

          <section class="rounded-[28px] border border-[var(--border-subtle)] bg-white/[0.03] p-6">
            <h2 class="font-manrope text-[42px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              {{ labels.deliverablesTitle }}
            </h2>

            <div class="mt-6 grid gap-4 lg:grid-cols-3">
              <article
                v-for="deliverable in localizedOffer.deliverables"
                :key="deliverable.title"
                class="rounded-[22px] border border-[var(--border-subtle)] bg-black/10 p-5"
              >
                <h3 class="font-manrope text-xl font-semibold text-[var(--text-primary)]">
                  {{ deliverable.title }}
                </h3>
                <p class="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {{ deliverable.description }}
                </p>
              </article>
            </div>
          </section>

          <section>
            <h2 class="font-manrope text-[42px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              {{ labels.processTitle }}
            </h2>

            <div class="mt-6 space-y-5">
              <article
                v-for="(step, index) in localizedOffer.process"
                :key="step.title"
                class="rounded-[24px] border border-[var(--border-subtle)] bg-white/[0.03] p-6"
              >
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-gold)]">
                      {{ index + 1 < 10 ? `0${index + 1}` : index + 1 }}
                    </p>
                    <h3 class="mt-2 font-manrope text-2xl font-semibold text-[var(--text-primary)]">
                      {{ step.title }}
                    </h3>
                  </div>

                  <p class="max-w-[52ch] text-sm leading-7 text-[var(--text-secondary)]">
                    {{ step.body }}
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section
            v-if="nextOffer"
            class="rounded-[28px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6"
          >
            <p class="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {{ labels.nextOffer }}
            </p>
            <div class="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 class="font-manrope text-3xl font-semibold text-[var(--text-primary)]">
                  {{ t(`services.cards.${nextOffer.key}.title`) }}
                </h3>
                <p class="mt-2 text-sm text-[var(--text-secondary)]">
                  {{ currentLocale === 'fr' ? 'Explorer le profil suivant.' : 'Explore the next profile.' }}
                </p>
              </div>

              <NuxtLink
                :to="localePath(`/services/${nextOffer.slug}`)"
                class="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-5 py-3 text-sm text-[var(--text-primary)] no-underline transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                {{ t('services.common.details') }}
                <UIcon name="i-heroicons-arrow-right-20-solid" class="ml-1 h-4 w-4" />
              </NuxtLink>
            </div>
          </section>
        </div>
      </section>
    </div>

    <FooterSection class="mt-16" />
    <ScrollToTop />
  </main>
</template>
