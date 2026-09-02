<script setup lang="ts">
import { findProjectBySlug, projects } from '../../data/projects'
import type { LocalizedValue, Project } from '../../data/projects'

type LocaleKey = 'fr' | 'en'

const PAGE_LABELS = {
  fr: {
    back: 'Retour aux projets',
    summaryTitle: 'Résumé',
    aboutTitle: 'À propos',
    visitWebsite: 'Visiter le site',
    bookCall: 'Réserver un appel',
    contextTitle: 'Contexte & enjeux',
    objectivesTitle: 'Objectifs',
    resultsTitle: 'Résultats',
  },
  en: {
    back: 'Back to projects',
    summaryTitle: 'Summary',
    aboutTitle: 'About',
    visitWebsite: 'Visit website',
    bookCall: 'Book a call',
    contextTitle: 'Context & challenges',
    objectivesTitle: 'Objectives',
    resultsTitle: 'Results',
  },
} satisfies Record<LocaleKey, Record<string, string>>

function getLocalizedValue<T>(value: LocalizedValue<T>, localeKey: LocaleKey): T {
  return value[localeKey]
}

const route = useRoute()
const localePath = useLocalePath()
const { locale, t } = useI18n()

const currentLocale = computed<LocaleKey>(() => (locale.value === 'en' ? 'en' : 'fr'))
const labels = computed(() => PAGE_LABELS[currentLocale.value])
const projectSlug = computed(() => String(route.params.slug ?? ''))
const project = computed<Project | undefined>(() => findProjectBySlug(projectSlug.value))

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found',
  })
}

const localizedProject = computed(() => {
  const currentProject = project.value!
  const localeKey = currentLocale.value

  return {
    ...currentProject,
    summary: getLocalizedValue(currentProject.summary, localeKey),
    aboutCompany: getLocalizedValue(currentProject.aboutCompany, localeKey),
    industry: getLocalizedValue(currentProject.industry, localeKey),
    supportBullets: getLocalizedValue(currentProject.supportBullets, localeKey),
    context: getLocalizedValue(currentProject.context, localeKey),
    solution: getLocalizedValue(currentProject.solution, localeKey),
    challenges: getLocalizedValue(currentProject.challenges, localeKey),
    objectives: getLocalizedValue(currentProject.objectives, localeKey),
    actions: getLocalizedValue(currentProject.actions, localeKey),
  }
})

const backToProjectsLink = computed(() => localePath('/projects'))
const contactLink = computed(() => localePath('/contact'))

const splitTextIntoParagraphs = (text: string) => {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [text]
  const paragraphs: string[] = []
  let current = ''

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence

    if (current && next.length > 220) {
      paragraphs.push(current)
      current = sentence
    } else {
      current = next
    }
  }

  if (current) {
    paragraphs.push(current)
  }

  return paragraphs
}

const projectImages = computed(() => {
  const images = [
    localizedProject.value.image,
    ...localizedProject.value.screenshots.desktop,
    ...localizedProject.value.screenshots.mobile,
  ]

  return [...new Set(images)].filter(Boolean)
})

type CaseStudyBlock =
  | { type: 'image'; key: string; src: string; alt: string }
  | { type: 'text'; key: string; title: string; body: string }

const caseStudyFlow = computed<CaseStudyBlock[]>(() => {
  const textSections = [
    { title: labels.value.contextTitle, body: localizedProject.value.context },
    { title: labels.value.objectivesTitle, body: localizedProject.value.objectives.join(' ') },
    { title: labels.value.resultsTitle, body: localizedProject.value.solution },
  ]

  const blocks: CaseStudyBlock[] = []

  textSections.forEach((section, index) => {
    const image = projectImages.value[index]

    if (image) {
      blocks.push({
        type: 'image',
        key: `image-${index}`,
        src: image,
        alt: `${localizedProject.value.title} - ${section.title}`,
      })
    }

    blocks.push({
      type: 'text',
      key: `text-${index}`,
      title: section.title,
      body: section.body,
    })
  })

  const closingImage = projectImages.value[textSections.length]

  if (closingImage) {
    blocks.push({
      type: 'image',
      key: 'image-closing',
      src: closingImage,
      alt: localizedProject.value.title,
    })
  }

  return blocks
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

const nextProject = computed(() => {
  const currentIndex = projects.findIndex((item) => item.slug === localizedProject.value.slug)

  if (currentIndex < 0) {
    return undefined
  }

  return projects[(currentIndex + 1) % projects.length]
})

const nextProjectLink = computed(() =>
  nextProject.value ? localePath(`/projects/${nextProject.value.slug}`) : localePath('/projects')
)

useSeoMeta({
  title: `${localizedProject.value.title} | MC Studio`,
  description: localizedProject.value.summary,
  ogTitle: `${localizedProject.value.title} | MC Studio`,
  ogDescription: localizedProject.value.summary,
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
          <NuxtLink
            :to="backToProjectsLink"
            class="inline-flex items-center gap-2 text-sm text-white/50 no-underline transition-colors duration-200 hover:text-white"
            :aria-label="labels.back"
          >
            <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
            <span>{{ labels.back }}</span>
          </NuxtLink>

          <section class="mx-auto w-full max-w-[1100px]">
            <h1 class="case-study-title m-0 mt-14 max-w-[900px] text-balance font-manrope font-medium tracking-[-0.07em] text-white sm:mt-20">
              {{ localizedProject.title }}
            </h1>

            <div class="mt-8 h-px w-full bg-white/15 sm:mt-12" />

            <div class="grid grid-cols-2 gap-[clamp(34px,8vw,88px)] pt-[clamp(34px,5vw,56px)] max-md:grid-cols-1 max-md:gap-10">
              <div>
                <h2 class="case-study-heading">{{ labels.summaryTitle }}</h2>
                <div class="case-study-copy">
                  <p
                    v-for="paragraph in splitTextIntoParagraphs(localizedProject.summary)"
                    :key="paragraph"
                  >
                    {{ paragraph }}
                  </p>
                </div>

                <div class="mt-7 flex flex-wrap items-center gap-3">
                  <NuxtLink
                    :to="contactLink"
                    class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0f0f0f] no-underline transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <span>{{ labels.bookCall }}</span>
                    <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" />
                  </NuxtLink>

                  <a
                    :href="localizedProject.externalLink"
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-center text-sm font-medium text-white/75 no-underline transition-colors duration-200 hover:border-white/50 hover:text-white"
                  >
                    <span>{{ labels.visitWebsite }}</span>
                    <UIcon name="i-lucide-arrow-up-right" class="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div>
                <h2 class="case-study-heading">{{ labels.aboutTitle }}</h2>
                <div class="case-study-copy">
                  <p
                    v-for="paragraph in splitTextIntoParagraphs(localizedProject.aboutCompany)"
                    :key="paragraph"
                  >
                    {{ paragraph }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <template v-for="block in caseStudyFlow" :key="block.key">
            <section
              v-if="block.type === 'image'"
              class="mx-auto w-full max-w-[760px] pt-[clamp(48px,7vw,72px)]"
            >
              <NuxtImg
                :src="block.src"
                :alt="block.alt"
                class="mx-auto block w-full rounded-2xl border border-white/10 bg-white/[0.03]"
              />
            </section>

            <section
              v-else
              class="mx-auto w-full max-w-[760px] pt-[clamp(48px,7vw,72px)]"
            >
              <h2 class="case-study-heading">{{ block.title }}</h2>
              <div class="case-study-copy">
                <p
                  v-for="paragraph in splitTextIntoParagraphs(block.body)"
                  :key="paragraph"
                >
                  {{ paragraph }}
                </p>
              </div>
            </section>
          </template>

          <section
            v-if="projectTestimonial"
            class="mx-auto w-full max-w-[760px] pt-[clamp(48px,7vw,72px)]"
          >
            <div class="flex w-full flex-col gap-6 border-l-2 border-white/30 py-1 pl-6 sm:pl-8">
              <p class="m-0 whitespace-pre-line font-inter text-base leading-[1.7] text-white/80 transition-colors duration-300 sm:text-lg">
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

          <section
            v-if="nextProject"
            class="mx-auto w-full max-w-[760px] pt-[clamp(48px,7vw,72px)]"
          >
            <ProjectDetailNextProject
              :title="nextProject.title"
              :link="nextProjectLink"
              :cta-label="t('projects.cta')"
            />
          </section>
        </div>
      </article>
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

@media (max-width: 640px) {
  .case-study-title {
    font-size: clamp(3.2rem, 16vw, 5.4rem);
  }
}

</style>
