<script setup lang="ts">
import { findProjectBySlug, projects } from '../../data/projects'
import type { Project } from '../../data/projects'
import { findCaseStudyBySlug } from '../../data/caseStudies'
import type { CaseStudy } from '../../data/caseStudies'

type LocaleKey = 'fr' | 'en'

const PAGE_LABELS = {
  fr: {
    back: 'Retour aux projets',
    visitWebsite: 'Visiter le site',
    bookCall: 'Réserver un appel',
    keyFacts: 'Infos clés',
    client: 'Le client',
    challenge: 'Le challenge',
    objectives: 'Les objectifs',
    approach: 'Notre approche',
    solution: 'La solution',
    features: 'Fonctionnalités clés',
    result: 'Le résultat',
    moreProjects: 'Autres projets',
  },
  en: {
    back: 'Back to projects',
    visitWebsite: 'Visit website',
    bookCall: 'Book a call',
    keyFacts: 'Key facts',
    client: 'The client',
    challenge: 'The challenge',
    objectives: 'Objectives',
    approach: 'Our approach',
    solution: 'The solution',
    features: 'Key features',
    result: 'The result',
    moreProjects: 'More projects',
  },
} satisfies Record<LocaleKey, Record<string, string>>

const route = useRoute()
const localePath = useLocalePath()
const { locale, t } = useI18n()

const currentLocale = computed<LocaleKey>(() => (locale.value === 'en' ? 'en' : 'fr'))
const labels = computed(() => PAGE_LABELS[currentLocale.value])
const projectSlug = computed(() => String(route.params.slug ?? ''))
const project = computed<Project | undefined>(() => findProjectBySlug(projectSlug.value))
const localizedCaseStudy = computed(() => findCaseStudyBySlug(projectSlug.value))

if (!project.value || !localizedCaseStudy.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found',
  })
}

const localizedProject = computed(() => project.value!)
const caseStudy = computed<CaseStudy>(() => localizedCaseStudy.value![currentLocale.value])

const formatIndex = (index: number) => String(index + 1).padStart(2, '0')
const projectLink = (slug: string) => localePath(`/projects/${slug}`)

const backToProjectsLink = computed(() => localePath('/projects'))
const contactLink = computed(() => localePath('/contact'))
const bookCallButton = ref<HTMLElement | { $el: HTMLElement } | null>(null)
const bookCallText = ref<HTMLElement | null>(null)
const visitWebsiteButton = ref<HTMLElement | null>(null)
const visitWebsiteText = ref<HTMLElement | null>(null)

useTextSlideAnimation(bookCallButton, bookCallText)
useTextSlideAnimation(visitWebsiteButton, visitWebsiteText)

const galleryImages = computed(() => {
  const heroImage = localizedProject.value.image
  const images = [
    ...localizedProject.value.screenshots.desktop,
    ...localizedProject.value.screenshots.mobile,
  ]

  return [...new Set(images)].filter((src) => Boolean(src) && src !== heroImage)
})

type GalleryItem = { key: string; src: string; span: 5 | 10 }

const galleryItems = computed<GalleryItem[]>(() => {
  const images = galleryImages.value
  const items: GalleryItem[] = []
  let index = 0
  let wantsPair = true

  while (index < images.length) {
    const size = wantsPair ? 2 : 1
    const chunk = images.slice(index, index + size)
    const span = chunk.length === 2 ? 5 : 10

    chunk.forEach((src) => items.push({ key: src, src, span }))

    index += chunk.length
    wantsPair = !wantsPair
  }

  return items
})

// The gallery is split in two so screenshots break up the text instead of stacking in one block
const GALLERY_FIRST_BLOCK_SIZE = 3
const galleryFirstBlock = computed(() => galleryItems.value.slice(0, GALLERY_FIRST_BLOCK_SIZE))
const gallerySecondBlock = computed(() => galleryItems.value.slice(GALLERY_FIRST_BLOCK_SIZE))

const projectTestimonial = computed(() => {
  const currentProject = project.value!

  if (!currentProject.testimonial) {
    return undefined
  }

  return {
    review: t(`projects.items.${currentProject.i18nKey}.testimonial.review`),
    job: t(`projects.items.${currentProject.i18nKey}.testimonial.job`),
    name: currentProject.testimonial.name,
    avatar: currentProject.testimonial.avatar,
  }
})

const categoryLabelKey = (category: string) => category.replace('-', '_')
const categoryLabel = (category: string) => t(`projects.filters.${categoryLabelKey(category)}`)

const moreProjects = computed(() => {
  const currentIndex = projects.findIndex((item) => item.slug === localizedProject.value.slug)

  if (currentIndex < 0) {
    return []
  }

  const others: Project[] = []

  for (let offset = 1; offset < projects.length && others.length < 3; offset++) {
    others.push(projects[(currentIndex + offset) % projects.length]!)
  }

  return others
})

useSeoMeta({
  title: () => `${localizedProject.value.title} | MC Studio`,
  description: () => caseStudy.value.subtitle,
  ogTitle: () => `${localizedProject.value.title} | MC Studio`,
  ogDescription: () => caseStudy.value.subtitle,
})
</script>

<template>
  <main class="project-detail-page min-h-screen bg-[#0f0f0f] text-white">
    <StudioNavbar tone="dark" />

    <!-- Main Content with Border Frame -->
    <div class="mx-auto w-[min(1240px,calc(100%-48px))] pb-24 sm:pb-36">
    <section class="mx-auto w-full">
      <article class="relative">
        <div class="relative z-10 py-[clamp(34px,6vw,72px)]">
          <section class="grid grid-cols-10 gap-x-4 sm:gap-x-6">
            <div class="col-span-10">
              <NuxtLink
                :to="backToProjectsLink"
                class="inline-flex items-center gap-2 text-sm text-white/50 no-underline transition-colors duration-200 hover:text-white"
                :aria-label="labels.back"
              >
                <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
                <span>{{ labels.back }}</span>
              </NuxtLink>

              <p class="m-0 mt-10 text-[11px] uppercase tracking-[0.16em] text-white/45 sm:mt-12">
                {{ caseStudy.category }}
              </p>

              <h1 class="case-study-title m-0 mt-4 max-w-[1000px] text-balance font-manrope font-medium tracking-[-0.07em] text-white">
                {{ localizedProject.title }}
              </h1>

              <p class="case-study-headline m-0 mt-8 max-w-[920px] text-balance font-manrope font-medium tracking-[-0.03em] text-white">
                {{ caseStudy.headline }}
              </p>

              <p class="case-study-copy m-0 mt-5 max-w-[700px] sm:text-lg">
                {{ caseStudy.subtitle }}
              </p>

              <div class="mt-8 flex flex-wrap items-center gap-3">
                <NuxtLink
                  ref="bookCallButton"
                  :to="contactLink"
                  class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0f0f0f] no-underline"
                >
                  <span class="sr-only">{{ labels.bookCall }}</span>
                  <span class="button-text-slide" aria-hidden="true">
                    <span ref="bookCallText" class="button-text-slide__track">
                      <span class="button-text-slide__line">{{ labels.bookCall }}</span>
                      <span class="button-text-slide__line">{{ labels.bookCall }}</span>
                    </span>
                  </span>
                  <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" />
                </NuxtLink>

                <a
                  ref="visitWebsiteButton"
                  :href="localizedProject.externalLink"
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-center text-sm font-medium text-white/75 no-underline"
                >
                  <span class="sr-only">{{ labels.visitWebsite }}</span>
                  <span class="button-text-slide" aria-hidden="true">
                    <span ref="visitWebsiteText" class="button-text-slide__track">
                      <span class="button-text-slide__line">{{ labels.visitWebsite }}</span>
                      <span class="button-text-slide__line">{{ labels.visitWebsite }}</span>
                    </span>
                  </span>
                  <UIcon name="i-lucide-arrow-up-right" class="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div class="col-span-10 mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] sm:mt-16">
              <NuxtImg
                :src="localizedProject.image"
                :alt="localizedProject.title"
                class="block aspect-[16/9] w-full object-cover"
              />
            </div>

            <div class="col-span-10 mt-10 border-y border-white/15 py-6 sm:mt-12">
              <h2 class="sr-only">{{ labels.keyFacts }}</h2>
              <ul class="m-0 grid list-none gap-x-6 gap-y-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
                <li v-for="(fact, index) in caseStudy.keyFacts" :key="fact" class="flex gap-3">
                  <span class="pt-[3px] text-[11px] tracking-[0.16em] text-white/40">{{ formatIndex(index) }}</span>
                  <span class="font-manrope text-base text-white">{{ fact }}</span>
                </li>
              </ul>
            </div>
          </section>

          <!-- Client & challenge -->
          <section class="case-study-section grid grid-cols-10 gap-x-4 gap-y-12 sm:gap-x-6">
            <div class="col-span-10 md:col-span-4">
              <h2 class="case-study-heading">{{ caseStudy.clientTitle ?? labels.client }}</h2>
              <div class="case-study-copy">
                <p v-for="paragraph in caseStudy.client" :key="paragraph">{{ paragraph }}</p>
              </div>
              <NuxtLink
                v-if="caseStudy.clientLink"
                :to="projectLink(caseStudy.clientLink.slug)"
                class="case-study-link mt-6"
              >
                {{ caseStudy.clientLink.label }}
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
              </NuxtLink>
            </div>

            <div class="col-span-10 md:col-span-5 md:col-start-6">
              <h2 class="case-study-heading">{{ labels.challenge }}</h2>
              <div class="case-study-copy case-study-copy--lead">
                <p v-for="paragraph in caseStudy.challenge" :key="paragraph" class="whitespace-pre-line">{{ paragraph }}</p>
              </div>
            </div>
          </section>

          <!-- Objectives -->
          <section class="case-study-section">
            <h2 class="case-study-heading">{{ labels.objectives }}</h2>
            <p v-if="caseStudy.objectivesIntro" class="case-study-copy m-0 mb-6">{{ caseStudy.objectivesIntro }}</p>
            <ol class="m-0 mt-8 grid list-none gap-x-6 gap-y-6 p-0 sm:grid-cols-2">
              <li
                v-for="(objective, index) in caseStudy.objectives"
                :key="objective"
                class="flex gap-4 border-t border-white/15 pt-5"
              >
                <span class="pt-1 text-[11px] tracking-[0.16em] text-white/40">{{ formatIndex(index) }}</span>
                <span class="font-manrope text-lg leading-snug text-white sm:text-xl">{{ objective }}</span>
              </li>
            </ol>
          </section>

          <!-- Approach -->
          <section class="case-study-section">
            <h2 class="case-study-heading">{{ labels.approach }}</h2>
            <div class="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2">
              <article v-for="(step, index) in caseStudy.approach" :key="step.title" class="border-t border-white/15 pt-5">
                <p class="m-0 font-manrope text-sm text-[#f0bf6c]">{{ formatIndex(index) }}</p>
                <h3 class="m-0 mt-3 font-manrope text-xl font-medium tracking-[-0.02em] text-white sm:text-2xl">{{ step.title }}</h3>
                <p class="case-study-copy m-0 mt-3">{{ step.body }}</p>
              </article>
            </div>
          </section>

          <section
            v-if="galleryFirstBlock.length"
            class="grid grid-cols-10 gap-4 pt-[clamp(56px,8vw,96px)] sm:gap-6"
          >
            <NuxtImg
              v-for="item in galleryFirstBlock"
              :key="item.key"
              :src="item.src"
              :alt="localizedProject.title"
              class="block w-full rounded-2xl border border-white/10 bg-white/[0.03] col-span-10"
              :class="item.span === 5 ? 'md:col-span-5' : 'md:col-span-10'"
            />
          </section>

          <!-- Solution -->
          <section class="case-study-section grid grid-cols-10 gap-x-4 gap-y-8 sm:gap-x-6">
            <div class="col-span-10 md:col-span-4">
              <h2 class="case-study-heading">{{ labels.solution }}</h2>
              <p v-if="caseStudy.solutionIntro" class="case-study-copy m-0">{{ caseStudy.solutionIntro }}</p>
            </div>

            <div class="col-span-10 flex flex-col gap-8 md:col-span-6">
              <div v-for="(group, index) in caseStudy.solution" :key="group.title ?? index">
                <h3 v-if="group.title" class="m-0 mb-3 text-[11px] uppercase tracking-[0.16em] text-white/45">{{ group.title }}</h3>
                <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
                  <li
                    v-for="item in group.items"
                    :key="item"
                    class="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-white/80"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Features -->
          <section class="case-study-section">
            <h2 class="case-study-heading">{{ labels.features }}</h2>
            <div
              class="mt-8 grid gap-4 sm:gap-6"
              :class="caseStudy.features.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'"
            >
              <article
                v-for="feature in caseStudy.features"
                :key="feature.title"
                class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7"
              >
                <h3 class="m-0 font-manrope text-xl font-medium leading-snug tracking-[-0.02em] text-white">{{ feature.title }}</h3>
                <p class="case-study-copy m-0 mt-4">{{ feature.body }}</p>
              </article>
            </div>
          </section>

          <section
            v-if="gallerySecondBlock.length"
            class="grid grid-cols-10 gap-4 pt-[clamp(56px,8vw,96px)] sm:gap-6"
          >
            <NuxtImg
              v-for="item in gallerySecondBlock"
              :key="item.key"
              :src="item.src"
              :alt="localizedProject.title"
              class="block w-full rounded-2xl border border-white/10 bg-white/[0.03] col-span-10"
              :class="item.span === 5 ? 'md:col-span-5' : 'md:col-span-10'"
            />
          </section>

          <!-- Result -->
          <section class="case-study-section">
            <h2 class="case-study-heading">{{ labels.result }}</h2>

            <dl
              v-if="caseStudy.resultStats?.length"
              class="m-0 mt-8 grid gap-4 sm:gap-6"
              :class="caseStudy.resultStats.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'"
            >
              <div
                v-for="stat in caseStudy.resultStats"
                :key="stat.label"
                class="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <dt class="sr-only">{{ stat.label }}</dt>
                <dd class="m-0 font-manrope text-5xl font-medium tracking-[-0.05em] text-white sm:text-6xl">{{ stat.value }}</dd>
                <dd class="m-0 mt-2 text-sm text-white/55">{{ stat.label }}</dd>
              </div>
            </dl>

            <div class="case-study-copy case-study-copy--lead mt-8 max-w-[760px]">
              <p v-for="paragraph in caseStudy.result" :key="paragraph">{{ paragraph }}</p>
            </div>

            <p
              v-if="caseStudy.resultEmphasis"
              class="m-0 mt-8 max-w-[760px] text-balance font-manrope text-2xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-3xl"
            >
              {{ caseStudy.resultEmphasis }}
            </p>

            <NuxtLink
              v-if="caseStudy.resultLink"
              :to="projectLink(caseStudy.resultLink.slug)"
              class="case-study-link mt-8"
            >
              {{ caseStudy.resultLink.label }}
              <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
            </NuxtLink>
          </section>

          <section
            v-if="caseStudy.quote && !projectTestimonial"
            class="grid grid-cols-10 gap-x-4 pt-[clamp(56px,8vw,96px)] sm:gap-x-6"
          >
            <figure class="col-span-10 m-0 border-l-2 border-white/30 py-1 pl-6 sm:pl-8 md:col-span-7">
              <blockquote class="m-0 text-balance font-manrope text-2xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-3xl">
                « {{ caseStudy.quote }} »
              </blockquote>
              <figcaption class="mt-5 font-inter text-sm text-white/50">{{ localizedProject.title }}</figcaption>
            </figure>
          </section>

          <section
            v-if="projectTestimonial"
            class="grid grid-cols-10 gap-x-4 pt-[clamp(56px,8vw,96px)] sm:gap-x-6"
          >
            <div class="col-span-10 flex flex-col gap-6 border-l-2 border-white/30 py-1 pl-6 sm:pl-8 md:col-span-7">
              <p v-if="caseStudy.testimonialContext" class="m-0 text-[11px] uppercase tracking-[0.16em] text-white/45">
                {{ caseStudy.testimonialContext }}
              </p>

              <p
                v-if="caseStudy.testimonialHighlight"
                class="m-0 text-balance font-manrope text-2xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-3xl"
              >
                « {{ caseStudy.testimonialHighlight }} »
              </p>

              <p class="m-0 whitespace-pre-line font-inter text-base leading-[1.7] text-white/70 transition-colors duration-300 sm:text-lg">
                {{ projectTestimonial.review }}
              </p>

              <div class="flex items-center gap-3">
                <NuxtImg
                  :src="projectTestimonial.avatar"
                  :alt="projectTestimonial.name"
                  class="h-11 w-11 shrink-0 rounded-full bg-white/10 object-cover"
                />
                <div class="flex flex-col gap-[2px]">
                  <span class="font-inter text-sm font-semibold text-white transition-colors duration-300">{{ projectTestimonial.name }}</span>
                  <span class="font-inter text-xs text-white/50 transition-colors duration-300">{{ projectTestimonial.job }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </article>
      </section>

      <section
        v-if="moreProjects.length"
        class="more-projects mx-auto w-full border-t border-white/15 pt-12 sm:pt-16"
      >
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="case-study-heading !mb-0">{{ labels.moreProjects }}</h2>
          <NuxtLink
            :to="localePath('/projects')"
            class="shrink-0 text-sm text-white/50 no-underline transition-colors duration-200 hover:text-white"
          >
            {{ t('projects.show_more') }}
          </NuxtLink>
        </div>

        <div class="mt-8 grid gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
          <NuxtLink
            v-for="item in moreProjects"
            :key="item.slug"
            :to="localePath(`/projects/${item.slug}`)"
            class="more-project-card group"
            :aria-label="`${item.title} — ${t('projects.cta')}`"
          >
            <div class="more-project-card__media">
              <NuxtImg
                :src="item.image"
                :alt="item.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="mt-4 flex items-baseline justify-between gap-3 border-t border-white/15 pt-3">
              <h3 class="font-manrope text-xl tracking-[-0.03em] text-white">{{ item.title }}</h3>
              <span class="shrink-0 text-[10px] uppercase tracking-[0.14em] text-white/40">
                {{ categoryLabel(item.categories[0]) }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>

    <FooterSection />
    <ScrollToTop />
  </main>
</template>

<style scoped>
.case-study-title {
  overflow-wrap: anywhere;
  font-size: clamp(3.5rem, 8vw, 8.5rem);
  line-height: 0.92;
}

.case-study-heading {
  margin: 0 0 14px;
  font-family: Manrope, sans-serif;
  font-size: clamp(1.7rem, 3vw, 3rem);
  font-weight: 500;
  line-height: 1.12;
  text-wrap: balance;
  color: white;
}

.case-study-copy {
  color: rgba(255, 255, 255, 0.62);
  font-size: clamp(15px, 1.6vw, 16px);
  line-height: 1.6;
}

.case-study-copy p {
  margin: 0;
}

.case-study-copy p + p {
  margin-top: 1.15em;
}

.case-study-copy--lead {
  color: rgba(255, 255, 255, 0.78);
}

.case-study-headline {
  font-size: clamp(1.5rem, 3.2vw, 2.6rem);
  line-height: 1.12;
}

.case-study-section {
  padding-top: clamp(56px, 8vw, 96px);
}

.case-study-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #f0bf6c;
  text-decoration: none;
  transition: gap 200ms ease;
}

.case-study-link:hover {
  gap: 12px;
}

.button-text-slide {
  display: block;
  height: 1.25rem;
  overflow: hidden;
}

.button-text-slide__track {
  display: flex;
  flex-direction: column;
}

.button-text-slide__line {
  display: block;
  height: 1.25rem;
  line-height: 1.25rem;
}

@media (max-width: 640px) {
  .case-study-title {
    font-size: clamp(3.2rem, 16vw, 5.4rem);
  }
}

.more-project-card {
  display: block;
  color: inherit;
  text-decoration: none;
  transition: transform 300ms cubic-bezier(.22, 1, .36, 1);
}


.more-project-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 18px;
  background: #191919;
}

.more-project-card:focus-visible {
  outline: 2px solid #f0bf6c;
  outline-offset: 7px;
}

@media (prefers-reduced-motion: reduce) {
  .more-project-card,
  .more-project-card__media img {
    transition: none;
  }

  .more-project-card:hover {
    transform: none;
  }
}
</style>
