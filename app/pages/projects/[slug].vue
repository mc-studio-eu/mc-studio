<script setup lang="ts">
import { findProjectBySlug, projects } from '../../data/projects'
import type { LocalizedValue, Project, ProjectActionItem } from '../../data/projects'
import Navbar from '../../components/layouts/Navbar.vue'

type DeviceMode = 'desktop' | 'mobile'
type LocaleKey = 'fr' | 'en'

const PAGE_LABELS = {
  fr: {
    back: 'Retour aux projets',
    project: 'Projet',
    aboutCompany: "À propos de l'entreprise",
    industry: 'Secteur',
    companySize: 'Taille',
    visitWebsite: 'Visiter le site',
    supportTitle: "Besoin d'un accompagnement expert sur votre prochain projet ?",
    contactUs: 'Nous contacter',
    challengeTitle: 'Contexte & enjeux',
    objectivesTitle: 'Objectifs client',
    actionsTitle: 'Actions menées',
    nextProject: 'Projet suivant',
    browseNext: 'Continuer la visite avec un autre case study.',
  },
  en: {
    back: 'Back to projects',
    project: 'Project',
    aboutCompany: 'About the company',
    industry: 'Industry',
    companySize: 'Company size',
    visitWebsite: 'Visit website',
    supportTitle: 'Looking for expert support on your next project?',
    contactUs: 'Contact us',
    challengeTitle: 'Context & challenges',
    objectivesTitle: 'Client objectives',
    actionsTitle: 'Actions taken',
    nextProject: 'Next project',
    browseNext: 'Continue browsing with another case study.',
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

const selectedDevice = ref<DeviceMode>('desktop')
const selectedIndex = ref(0)

watch(selectedDevice, () => {
  selectedIndex.value = 0
})

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
const screenshots = computed(() => localizedProject.value.screenshots[selectedDevice.value])
const activeScreenshot = computed(() => screenshots.value[selectedIndex.value] || localizedProject.value.image)
const screenshotFrameClass = computed(() =>
  selectedDevice.value === 'mobile' ? 'mx-auto max-w-[360px]' : ''
)
const screenshotImageClass = computed(() =>
  selectedDevice.value === 'mobile' ? 'h-[560px]' : 'h-[520px]'
)

const projectFacts = computed(() => [
  { label: labels.value.industry, value: localizedProject.value.industry },
  { label: labels.value.companySize, value: localizedProject.value.companySize },
])

const contentSections = computed(() => [
  {
    title: labels.value.challengeTitle,
    description: localizedProject.value.context,
    items: localizedProject.value.challenges,
    bulletClass: 'bg-[var(--color-gold)]',
  },
  {
    title: labels.value.objectivesTitle,
    description: localizedProject.value.solution,
    items: localizedProject.value.objectives,
    bulletClass: 'bg-[#7bd88f]',
  },
])

const actionItems = computed(() =>
  localizedProject.value.actions.map((action: ProjectActionItem, index: number) => ({
    ...action,
    number: index + 1 < 10 ? `0${index + 1}` : String(index + 1),
  }))
)

const websiteLabel = computed(() => {
  try {
    return new URL(localizedProject.value.externalLink).hostname.replace(/^www\./, '')
  } catch {
    return localizedProject.value.externalLink
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
  <main class="min-h-screen bg-[var(--bg-primary)] px-6 py-6 transition-colors duration-300">
    <Navbar />

    <div class="mx-auto max-w-[1360px]">
      <NuxtLink
        :to="backToProjectsLink"
        class="mb-8 inline-flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] no-underline transition-all duration-200 hover:text-[var(--text-primary)]"
      >
        <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
        <span>{{ labels.back }}</span>
      </NuxtLink>

      <section class="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
        <ProjectDetailSidebar
          :title="localizedProject.title"
          :summary="localizedProject.summary"
          :contact-link="contactLink"
          :book-label="t('hero.cta.book')"
          :free-call-label="t('nav.free_call')"
          :project-label="labels.project"
          :about-company-label="labels.aboutCompany"
          :about-company="localizedProject.aboutCompany"
          :facts="projectFacts"
          :support-title="labels.supportTitle"
          :support-bullets="localizedProject.supportBullets"
          :contact-us-label="labels.contactUs"
        />

        <div class="space-y-8">
          <ProjectDetailGallery
            :visit-website-label="labels.visitWebsite"
            :external-link="localizedProject.externalLink"
            :title="localizedProject.title"
            :active-screenshot="activeScreenshot"
            :frame-class="screenshotFrameClass"
            :image-class="screenshotImageClass"
            :screenshots="screenshots"
            :selected-index="selectedIndex"
            @select-screenshot="selectedIndex = $event"
          />

          <div class="grid gap-8 xl:grid-cols-2">
            <ProjectDetailContentSection
              v-for="section in contentSections"
              :key="section.title"
              :title="section.title"
              :description="section.description"
              :items="section.items"
              :bullet-class="section.bulletClass"
            />
          </div>

          <ProjectDetailActionsSection
            :title="labels.actionsTitle"
            :actions="actionItems"
          />

          <ProjectDetailNextProject
            v-if="nextProject"
            :kicker="labels.nextProject"
            :title="nextProject.title"
            :description="labels.browseNext"
            :link="nextProjectLink"
            :cta-label="t('projects.cta')"
          />
        </div>
      </section>
    </div>

    <FooterSection class="mt-16" />
    <ScrollToTop />
  </main>
</template>
