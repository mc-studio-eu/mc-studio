<script setup lang="ts">
import { findOfferBySlug, offers } from '../../data/offers'
import Navbar from '../../components/layouts/Navbar.vue'
import OfferDetailSidebar from '../../components/services/detail/OfferDetailSidebar.vue'
import OfferDetailListSection from '../../components/services/detail/OfferDetailListSection.vue'
import OfferDetailDeliverablesSection from '../../components/services/detail/OfferDetailDeliverablesSection.vue'
import OfferDetailProcessSection from '../../components/services/detail/OfferDetailProcessSection.vue'
import OfferDetailNextOffer from '../../components/services/detail/OfferDetailNextOffer.vue'

type LocaleKey = 'fr' | 'en'

const PAGE_LABELS = {
  fr: {
    back: 'Retour à l’offre',
    featuredTag: 'Offre signature',
    fitTitle: 'Cette offre est faite pour',
    challengesTitle: 'Enjeux typiques',
    objectivesTitle: 'Ce qu’on cherche à obtenir',
    deliverablesTitle: 'Ce que comprend l’offre',
    processTitle: 'Comment on travaille',
    nextOffer: 'Offre suivante',
    browseNext: 'Explorer le profil suivant.',
  },
  en: {
    back: 'Back to the offer',
    featuredTag: 'Signature Offer',
    fitTitle: 'This offer is built for',
    challengesTitle: 'Typical challenges',
    objectivesTitle: 'What we aim to achieve',
    deliverablesTitle: 'What we build',
    processTitle: 'How we work',
    nextOffer: 'Next offer',
    browseNext: 'Explore the next profile.',
  },
} satisfies Record<LocaleKey, Record<string, string>>

const route = useRoute()
const localePath = useLocalePath()
const { locale, t, tm, rt } = useI18n()

const currentLocale = computed<LocaleKey>(() => (locale.value === 'en' ? 'en' : 'fr'))
const labels = computed(() => PAGE_LABELS[currentLocale.value])
const backToServicesLink = computed(() => localePath({ path: '/', hash: '#services' }))
const contactLink = computed(() => localePath({ path: '/', hash: '#contact' }))
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
  if (offers.length < 2) {
    return undefined
  }

  const currentIndex = offers.findIndex((item) => item.slug === localizedOffer.value.slug)
  if (currentIndex < 0) {
    return undefined
  }
  return offers[(currentIndex + 1) % offers.length]
})

const offerFacts = computed(() => [
  { label: localizedOffer.value.profileLabel, value: localizedOffer.value.profileValue },
  { label: localizedOffer.value.timeframeLabel, value: localizedOffer.value.timeframeValue },
  { label: localizedOffer.value.investmentLabel, value: localizedOffer.value.investmentValue },
])

const listSections = computed(() => [
  {
    title: labels.value.challengesTitle,
    items: localizedOffer.value.challenges,
    bulletClass: 'bg-[var(--color-gold)]',
  },
  {
    title: labels.value.objectivesTitle,
    items: localizedOffer.value.objectives,
    bulletClass: 'bg-[#7bd88f]',
  },
])

const processItems = computed(() =>
  localizedOffer.value.process.map((step, index) => ({
    ...step,
    number: index + 1 < 10 ? `0${index + 1}` : String(index + 1),
  }))
)

const nextOfferLink = computed(() =>
  nextOffer.value ? localePath(`/services/${nextOffer.value.slug}`) : backToServicesLink.value
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
    <Navbar />

    <div class="mx-auto max-w-[1360px]">
      <NuxtLink
        :to="backToServicesLink"
        class="mb-8 inline-flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] no-underline transition-all duration-200 hover:text-[var(--text-primary)]"
      >
        <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
        <span>{{ labels.back }}</span>
      </NuxtLink>

      <section class="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
        <OfferDetailSidebar
          :featured="localizedOffer.featured"
          :featured-tag="labels.featuredTag"
          :icon="localizedOffer.icon"
          :title="localizedOffer.title"
          :hero-title="localizedOffer.heroTitle"
          :hero-summary="localizedOffer.heroSummary"
          :contact-link="contactLink"
          :book-label="t('hero.cta.book')"
          :free-call-label="t('nav.free_call')"
          :facts="offerFacts"
          :fit-title="labels.fitTitle"
          :fit-bullets="localizedOffer.fitBullets"
        />

        <div class="space-y-8">
          <div class="grid gap-8 xl:grid-cols-2">
            <OfferDetailListSection
              v-for="section in listSections"
              :key="section.title"
              :title="section.title"
              :items="section.items"
              :bullet-class="section.bulletClass"
            />
          </div>

          <OfferDetailDeliverablesSection
            :title="labels.deliverablesTitle"
            :deliverables="localizedOffer.deliverables"
          />

          <OfferDetailProcessSection
            :title="labels.processTitle"
            :process-items="processItems"
          />

          <OfferDetailNextOffer
            v-if="nextOffer"
            :kicker="labels.nextOffer"
            :title="t(`services.cards.${nextOffer.key}.title`)"
            :description="labels.browseNext"
            :link="nextOfferLink"
            :cta-label="t('services.common.details')"
          />
        </div>
      </section>
    </div>

    <FooterSection class="mt-16" />
    <ScrollToTop />
  </main>
</template>
