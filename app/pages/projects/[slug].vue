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
    result: 'Résultats',
    screen: 'Écran',
    moreProjects: 'Autres projets',
  },
  en: {
    back: 'Back to projects',
    visitWebsite: 'Visit website',
    bookCall: 'Book a call',
    client: 'Client',
    problem: 'Problem',
    solution: 'Solution',
    result: 'Results',
    screen: 'Screen',
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

const result = computed(() => caseStudy.value.result)

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

        </header>

        <div class="project-case-layout mt-10 sm:mt-12">
          <div class="project-case-copy">
            <h1 class="case-study-title m-0 text-balance font-manrope font-medium tracking-[-0.07em] text-white">
              {{ localizedProject.title }}
            </h1>
            <p class="case-study-headline m-0 mt-5 text-balance font-manrope font-medium tracking-[-0.03em] text-white/75">
              {{ caseStudy.headline }}
            </p>

            <div class="mt-7 flex flex-wrap items-center gap-3">
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

            <dl class="m-0 mt-10 space-y-8">
              <div v-for="item in overview" :key="item.label" class="border-t border-white/15 pt-4">
                <dt class="text-[11px] uppercase tracking-[0.16em] text-white/45">{{ item.label }}</dt>
                <dd class="m-0 mt-3 whitespace-pre-line font-manrope text-base leading-relaxed text-white/80">{{ item.text }}</dd>
              </div>
              <div v-if="result" class="border-t border-white/15 pt-4">
                <dt class="text-[11px] uppercase tracking-[0.16em] text-white/45">{{ labels.result }}</dt>
                <dd class="m-0 mt-3 whitespace-pre-line font-manrope text-base leading-relaxed text-white/80">{{ result }}</dd>
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
          </div>

          <section v-if="galleryImages.length" class="project-case-gallery" :aria-label="`${localizedProject.title} screenshots`">
            <div class="project-case-gallery__viewport">
              <div class="project-case-gallery__track">
                <div v-for="copy in 2" :key="copy" class="project-case-gallery__group" :aria-hidden="copy === 2 ? 'true' : undefined">
                  <figure v-for="(src, index) in galleryImages" :key="`${copy}-${src}`" class="m-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                    <NuxtImg
                      :src="src"
                      :alt="copy === 1 ? `${localizedProject.title} — ${labels.screen} ${index + 1}` : ''"
                      class="block h-auto w-full"
                      :loading="index > 1 || copy === 2 ? 'lazy' : 'eager'"
                    />
                  </figure>
                </div>
              </div>
            </div>
          </section>
        </div>

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
  font-size: clamp(2.8rem, 5vw, 5.5rem);
  line-height: 0.98;
  /* Override the site-wide h1 gold gradient for case-study titles. */
  background: none;
  color: #fff;
  -webkit-background-clip: border-box;
  -webkit-text-fill-color: #fff;
}

.case-study-headline {
  font-size: clamp(1.2rem, 1.8vw, 1.65rem);
  line-height: 1.15;
}

.project-case-layout {
  display: grid;
  grid-template-columns: minmax(300px, 0.78fr) minmax(0, 1.22fr);
  align-items: start;
  gap: clamp(36px, 6vw, 88px);
}

.project-case-copy {
  position: sticky;
  top: 32px;
  align-self: start;
}

.project-case-gallery {
  position: sticky;
  top: 0;
  height: calc(100vh - 48px);
  overflow: hidden;
  border-radius: 18px;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 1%, #000 99%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 1%, #000 99%, transparent);
}

.project-case-gallery__track {
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: project-gallery-scroll 24s linear infinite;
  will-change: transform;
}

.project-case-gallery__group {
  display: grid;
  flex: 0 0 auto;
  gap: 18px;
  padding-bottom: 18px;
}

.project-case-gallery:hover .project-case-gallery__track,
.project-case-gallery:focus-within .project-case-gallery__track {
  animation-play-state: paused;
}

@keyframes project-gallery-scroll {
  to { transform: translateY(-50%); }
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

@media (max-width: 800px) {
  .project-case-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 36px;
  }

  .project-case-copy {
    position: static;
  }

  .project-case-gallery {
    position: relative;
    top: auto;
    height: min(72vh, 680px);
  }
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
  .project-case-gallery__track {
    animation: none;
    will-change: auto;
  }

  .more-project-card,
  .more-project-card__media img {
    transition: none;
  }

  .more-project-card:hover {
    transform: none;
  }
}
</style>
