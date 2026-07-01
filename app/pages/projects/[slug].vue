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

const backToProjectsLink = computed(() => localePath('/#projets'))
const contactLink = computed(() => localePath({ path: '/', hash: '#contact' }))

const bookCallBtn = ref(null)
const bookCallWrapper1 = ref(null)
const bookCallWrapper2 = ref(null)

useTextSlideAnimation(bookCallBtn, [bookCallWrapper1, bookCallWrapper2])

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
  nextProject.value ? localePath(`/projects/${nextProject.value.slug}`) : localePath('/#projets')
)

useSeoMeta({
  title: `${localizedProject.value.title} | MC Studio`,
  description: localizedProject.value.summary,
  ogTitle: `${localizedProject.value.title} | MC Studio`,
  ogDescription: localizedProject.value.summary,
})
</script>

<template>
  <main class="min-h-screen bg-[var(--bg-primary)] px-5 py-5 transition-colors duration-300 sm:px-6 sm:py-6">
    <section class="mx-auto w-full">
      <article class="relative">
        <div class="relative z-10 px-[clamp(18px,5vw,72px)] py-[clamp(56px,8vw,96px)] max-sm:pt-[88px]">
          <NuxtLink
            :to="backToProjectsLink"
            class="absolute left-[clamp(16px,2.4vw,32px)] top-[clamp(16px,2.4vw,32px)] inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-white/[0.03] text-[var(--text-secondary)] no-underline backdrop-blur transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--text-primary)]"
            :aria-label="labels.back"
          >
            <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
          </NuxtLink>

          <section class="mx-auto w-full max-w-[760px]">
            <h1 class="case-study-title m-0 text-center text-balance font-manrope font-medium tracking-normal">
              {{ localizedProject.title }}
            </h1>

            <div class="mt-[clamp(34px,5vw,48px)] h-px w-full bg-[var(--border-subtle)]" />

            <div class="grid grid-cols-2 gap-[clamp(34px,8vw,88px)] pt-[clamp(44px,7vw,72px)] max-md:grid-cols-1 max-md:gap-10">
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

                <div class="mt-7 flex flex-wrap items-center gap-x-3 gap-y-3 sm:flex-nowrap">
                  <NuxtLink
                    ref="bookCallBtn"
                    :to="contactLink"
                    class="cta-primary flex cursor-pointer items-center justify-center gap-2.5 rounded-xl px-3 py-2 text-[15px] font-medium text-[#0f0f0f] no-underline backdrop-blur-md transition-all duration-200"
                  >
                    <NuxtImg
                      src="/img/main/founder.jpeg"
                      alt="MC Studio"
                      class="h-9 w-9 shrink-0 scale-[1.18] rounded-xl object-cover object-[center_18%] shadow-[0_8px_16px_rgba(15,15,15,0.16)] ring-1 ring-black/10 md:h-10 md:w-10"
                    />
                    <div class="flex shrink-0 flex-col items-start gap-px">
                      <span class="text-slide-container h-[18px]">
                        <span ref="bookCallWrapper1" class="text-slide-wrapper">
                          <span class="text-slide-text h-[18px] whitespace-nowrap font-inter text-sm font-semibold leading-[18px]">{{ t('hero.cta.book') }}</span>
                          <span class="text-slide-text h-[18px] whitespace-nowrap font-inter text-sm font-semibold leading-[18px]">{{ t('hero.cta.book') }}</span>
                        </span>
                      </span>
                      <span class="text-slide-container h-[12px]">
                        <span ref="bookCallWrapper2" class="text-slide-wrapper">
                          <span class="text-slide-text h-[12px] whitespace-nowrap font-inter text-[9px] font-normal leading-[12px]">{{ t('nav.free_call') }}</span>
                          <span class="text-slide-text h-[12px] whitespace-nowrap font-inter text-[9px] font-normal leading-[12px]">{{ t('nav.free_call') }}</span>
                        </span>
                      </span>
                    </div>
                  </NuxtLink>

                  <a
                    :href="localizedProject.externalLink"
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex shrink-0 items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-xl border border-[var(--border-subtle)] bg-white/[0.03] px-5 text-center text-sm font-medium text-[var(--text-primary)] no-underline transition-all duration-200 hover:border-[var(--color-gold)]"
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
                class="mx-auto block w-full rounded-lg border border-[var(--border-subtle)] bg-[#0f0f0f]"
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
            <div class="flex w-full flex-col gap-6 rounded-2xl border border-[var(--border-subtle)] bg-[#232323] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors duration-300 dark:shadow-none">
              <p class="m-0 whitespace-pre-line font-inter text-xs leading-[1.7] text-white transition-colors duration-300 sm:text-sm">
                {{ projectTestimonial.review }}
              </p>

              <div class="flex items-center gap-3">
                <NuxtImg
                  :src="projectTestimonial.avatar"
                  :alt="projectTestimonial.name"
                  class="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[#e8a84c] object-cover"
                />
                <div class="flex flex-col gap-[2px]">
                  <span class="font-inter text-sm font-semibold text-[var(--text-primary)] transition-colors duration-300">{{ projectTestimonial.name }}</span>
                  <span class="font-inter text-xs text-[var(--text-secondary)] transition-colors duration-300">{{ projectTestimonial.job }}</span>
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

    <FooterSection class="mt-16" />
    <ScrollToTop />
  </main>
</template>

<style scoped>
.case-study-title {
  overflow-wrap: anywhere;
  font-size: clamp(30px, 3.6vw, 52px);
  line-height: 1.08;
}

.case-study-heading {
  margin: 0 0 14px;
  font-family: Manrope, sans-serif;
  font-size: clamp(23px, 3vw, 32px);
  font-weight: 500;
  line-height: 1.12;
  text-wrap: balance;
  background: var(--gold-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.case-study-copy {
  color: var(--text-secondary);
  font-size: clamp(15px, 1.6vw, 16px);
  line-height: 1.6;
}

.case-study-copy p {
  margin: 0;
}

.case-study-copy p + p {
  margin-top: 1.15em;
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
