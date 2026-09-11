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
    client: 'Client',
    problem: 'Problème',
    solution: 'Solution',
    moreProjects: 'Autres projets',
  },
  en: {
    back: 'Back to projects',
    visitWebsite: 'Visit website',
    bookCall: 'Book a call',
    client: 'Client',
    problem: 'Problem',
    solution: 'Solution',
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

const overview = computed(() => [
  { label: caseStudy.value.clientLabel ?? labels.value.client, text: caseStudy.value.client },
  { label: labels.value.problem, text: caseStudy.value.problem },
  { label: labels.value.solution, text: caseStudy.value.solution },
])

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
  description: () => caseStudy.value.headline,
  ogTitle: () => `${localizedProject.value.title} | MC Studio`,
  ogDescription: () => caseStudy.value.headline,
})
</script>

<template>
  <main class="project-detail-page min-h-screen bg-[#0f0f0f] text-white">
    <StudioNavbar tone="dark" />

    <div class="mx-auto w-[min(1240px,calc(100%-48px))] pb-24 sm:pb-36">
      <article class="relative py-[clamp(34px,6vw,72px)]">
        <header>
          <NuxtLink
            :to="backToProjectsLink"
            class="inline-flex items-center gap-2 text-sm text-white/50 no-underline transition-colors duration-200 hover:text-white"
            :aria-label="labels.back"
          >
            <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
            <span>{{ labels.back }}</span>
          </NuxtLink>

          <h1 class="case-study-title m-0 mt-10 max-w-[1000px] sm:mt-12 text-balance font-manrope font-medium tracking-[-0.07em] text-white">
            {{ localizedProject.title }}
          </h1>

          <div class="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <p class="case-study-headline m-0 max-w-[760px] text-balance font-manrope font-medium tracking-[-0.03em] text-white/85">
              {{ caseStudy.headline }}
            </p>

            <div class="flex flex-wrap items-center gap-3">
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
        </header>

        <div class="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] sm:mt-16">
          <NuxtImg
            :src="localizedProject.image"
            :alt="localizedProject.title"
            class="block aspect-[16/9] w-full object-cover"
          />
        </div>

        <dl class="m-0 mt-12 grid gap-x-10 gap-y-8 sm:mt-16 md:grid-cols-3">
          <div v-for="item in overview" :key="item.label" class="border-t border-white/15 pt-5">
            <dt class="text-[11px] uppercase tracking-[0.16em] text-white/45">{{ item.label }}</dt>
            <dd class="m-0 mt-4 font-manrope text-lg leading-snug tracking-[-0.01em] text-white/85">{{ item.text }}</dd>
          </div>
        </dl>

        <NuxtLink
          v-if="caseStudy.link"
          :to="localePath(`/projects/${caseStudy.link.slug}`)"
          class="case-study-link mt-8"
        >
          {{ caseStudy.link.label }}
          <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
        </NuxtLink>

        <section
          v-if="galleryItems.length"
          class="grid grid-cols-10 gap-4 pt-[clamp(56px,8vw,96px)] sm:gap-6"
        >
          <NuxtImg
            v-for="item in galleryItems"
            :key="item.key"
            :src="item.src"
            :alt="localizedProject.title"
            class="block w-full rounded-2xl border border-white/10 bg-white/[0.03] col-span-10"
            :class="item.span === 5 ? 'md:col-span-5' : 'md:col-span-10'"
          />
        </section>

        <figure
          v-if="projectTestimonial"
          class="m-0 mt-[clamp(56px,8vw,96px)] max-w-[760px] border-l-2 border-white/30 py-1 pl-6 sm:pl-8"
        >
          <p v-if="caseStudy.testimonialContext" class="m-0 mb-4 text-[11px] uppercase tracking-[0.16em] text-white/45">
            {{ caseStudy.testimonialContext }}
          </p>
          <blockquote class="m-0 text-balance font-manrope text-2xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-3xl">
            « {{ caseStudy.testimonialHighlight ?? projectTestimonial.review }} »
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <NuxtImg
              :src="projectTestimonial.avatar"
              :alt="projectTestimonial.name"
              class="h-11 w-11 shrink-0 rounded-full bg-white/10 object-cover"
            />
            <span class="flex flex-col gap-[2px]">
              <span class="font-inter text-sm font-semibold text-white">{{ projectTestimonial.name }}</span>
              <span class="font-inter text-xs text-white/50">{{ projectTestimonial.job }}</span>
            </span>
          </figcaption>
        </figure>

        <figure
          v-else-if="caseStudy.quote"
          class="m-0 mt-[clamp(56px,8vw,96px)] max-w-[760px] border-l-2 border-white/30 py-1 pl-6 sm:pl-8"
        >
          <blockquote class="m-0 text-balance font-manrope text-2xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-3xl">
            « {{ caseStudy.quote }} »
          </blockquote>
          <figcaption class="mt-5 font-inter text-sm text-white/50">{{ localizedProject.title }}</figcaption>
        </figure>
      </article>

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

.case-study-headline {
  font-size: clamp(1.4rem, 2.6vw, 2.2rem);
  line-height: 1.15;
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
