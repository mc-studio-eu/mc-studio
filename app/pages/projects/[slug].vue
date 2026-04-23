<script setup lang="ts">
import { findProjectBySlug, projects } from '../../data/projects'

type DeviceMode = 'desktop' | 'mobile'
type LocaleKey = 'fr' | 'en'

const route = useRoute()
const localePath = useLocalePath()
const { locale, t } = useI18n()

const currentLocale = computed<LocaleKey>(() => (locale.value === 'en' ? 'en' : 'fr'))
const project = computed(() => findProjectBySlug(route.params.slug as string))

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
    summary: currentProject.summary[localeKey],
    aboutCompany: currentProject.aboutCompany[localeKey],
    industry: currentProject.industry[localeKey],
    supportBullets: currentProject.supportBullets[localeKey],
    context: currentProject.context[localeKey],
    solution: currentProject.solution[localeKey],
    challenges: currentProject.challenges[localeKey],
    objectives: currentProject.objectives[localeKey],
    actions: currentProject.actions[localeKey],
  }
})

const screenshots = computed(() => localizedProject.value.screenshots[selectedDevice.value])
const activeScreenshot = computed(() => screenshots.value[selectedIndex.value] || localizedProject.value.image)
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

const labels = computed(() =>
  currentLocale.value === 'fr'
    ? {
        back: 'Retour aux projets',
        project: 'Projet',
        aboutCompany: "A propos de l'entreprise",
        industry: 'Secteur',
        companySize: 'Taille',
        visitWebsite: 'Visiter le site',
        supportTitle: "Besoin d'un accompagnement expert sur votre prochain projet ?",
        contactUs: 'Nous contacter',
        challengeTitle: 'Contexte & enjeux',
        objectivesTitle: 'Objectifs client',
        actionsTitle: 'Actions menées',
        nextProject: 'Projet suivant',
      }
    : {
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
      }
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
    <div class="mx-auto max-w-[1360px]">
      <NuxtLink
        :to="localePath('/#projets')"
        class="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2 text-sm text-[var(--text-secondary)] no-underline transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--text-primary)]"
      >
        <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
        <span>{{ labels.back }}</span>
      </NuxtLink>

      <section class="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
        <div class="space-y-6 lg:sticky lg:top-8">
          <div class="rounded-[28px] border border-[var(--border-subtle)] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <div class="mb-5">
              <p class="font-manrope text-[44px] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)] sm:text-[56px]">
                {{ localizedProject.title }}
              </p>
            </div>

            <p class="max-w-[36ch] text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
              {{ localizedProject.summary }}
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
            <div class="space-y-5">
              <div>
                <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5db4ff]">
                  {{ labels.project }}
                </p>
                <h2 class="font-manrope text-2xl font-semibold text-[var(--text-primary)]">
                  {{ labels.aboutCompany }}
                </h2>
                <p class="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {{ localizedProject.aboutCompany }}
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-4">
                  <p class="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {{ labels.industry }}
                  </p>
                  <p class="mt-2 text-sm font-medium text-[var(--text-primary)]">
                    {{ localizedProject.industry }}
                  </p>
                </div>

                <div class="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-4">
                  <p class="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {{ labels.companySize }}
                  </p>
                  <p class="mt-2 text-sm font-medium text-[var(--text-primary)]">
                    {{ localizedProject.companySize }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[24px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
            <h3 class="max-w-[18ch] font-manrope text-[30px] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)]">
              {{ labels.supportTitle }}
            </h3>

            <ul class="mt-5 space-y-3">
              <li
                v-for="item in localizedProject.supportBullets"
                :key="item"
                class="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
              >
                <UIcon name="i-heroicons-check-circle-solid" class="mt-0.5 h-4 w-4 shrink-0 text-[#7bd88f]" />
                <span>{{ item }}</span>
              </li>
            </ul>

            <NuxtLink
              :to="localePath({ path: '/', hash: '#contact' })"
              class="mt-6 inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#fff_0%,#f0bf6c_100%)] px-4 py-3 font-inter text-sm font-medium text-[#121212] no-underline transition-all duration-200 hover:brightness-105"
            >
              {{ labels.contactUs }}
              <UIcon name="i-heroicons-arrow-up-right-20-solid" class="ml-1 h-4 w-4" />
            </NuxtLink>
          </div>
        </div>

        <div class="space-y-8">
          <div class="rounded-[32px] border border-[var(--border-subtle)] bg-white/[0.03] p-4 sm:p-6">
            <div class="mb-5 flex flex-wrap items-center justify-end gap-4">
              <a
                :href="localizedProject.externalLink"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] no-underline transition-colors duration-200 hover:text-[var(--text-primary)]"
              >
                {{ labels.visitWebsite }}
                <UIcon name="i-heroicons-arrow-up-right-20-solid" class="h-4 w-4" />
              </a>
            </div>

            <div
              class="overflow-hidden rounded-[26px] border border-[var(--border-subtle)] bg-[#0f0f0f] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
              :class="selectedDevice === 'mobile' ? 'mx-auto max-w-[360px]' : ''"
            >
              <NuxtImg
                :src="activeScreenshot"
                :alt="localizedProject.title"
                class="w-full rounded-[20px] object-cover"
                :class="selectedDevice === 'mobile' ? 'h-[560px]' : 'h-[520px]'"
              />
            </div>

            <div class="mt-4 flex flex-wrap gap-3">
              <button
                v-for="(screen, index) in screenshots"
                :key="`${selectedDevice}-${screen}-${index}`"
                class="overflow-hidden rounded-2xl border p-1 transition-all duration-200"
                :class="selectedIndex === index ? 'border-[var(--color-gold)] bg-white/10' : 'border-[var(--border-subtle)] bg-transparent'"
                @click="selectedIndex = index"
              >
                <NuxtImg
                  :src="screen"
                  :alt="`${localizedProject.title} preview ${index + 1}`"
                  class="h-16 w-24 rounded-xl object-cover"
                />
              </button>
            </div>
          </div>

          <div class="grid gap-8 xl:grid-cols-2">
            <section>
              <h2 class="font-manrope text-[44px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                {{ labels.challengeTitle }}
              </h2>
              <p class="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {{ localizedProject.context }}
              </p>

              <ul class="mt-5 space-y-3">
                <li
                  v-for="item in localizedProject.challenges"
                  :key="item"
                  class="flex items-start gap-3 text-sm leading-7 text-[var(--text-primary)]"
                >
                  <span class="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 class="font-manrope text-[44px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                {{ labels.objectivesTitle }}
              </h2>
              <p class="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {{ localizedProject.solution }}
              </p>

              <ul class="mt-5 space-y-3">
                <li
                  v-for="item in localizedProject.objectives"
                  :key="item"
                  class="flex items-start gap-3 text-sm leading-7 text-[var(--text-primary)]"
                >
                  <span class="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7bd88f]"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>
          </div>

          <section>
            <h2 class="font-manrope text-[44px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              {{ labels.actionsTitle }}
            </h2>

            <div class="mt-6 space-y-5">
              <article
                v-for="(action, index) in localizedProject.actions"
                :key="action.title"
                class="rounded-[24px] border border-[var(--border-subtle)] bg-white/[0.03] p-6"
              >
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-gold)]">
                      {{ index + 1 < 10 ? `0${index + 1}` : index + 1 }}
                    </p>
                    <h3 class="mt-2 font-manrope text-2xl font-semibold text-[var(--text-primary)]">
                      {{ action.title }}
                    </h3>
                  </div>

                  <p class="max-w-[52ch] text-sm leading-7 text-[var(--text-secondary)]">
                    {{ action.body }}
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section
            v-if="nextProject"
            class="rounded-[28px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6"
          >
            <p class="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {{ labels.nextProject }}
            </p>
            <div class="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 class="font-manrope text-3xl font-semibold text-[var(--text-primary)]">
                  {{ nextProject.title }}
                </h3>
                <p class="mt-2 text-sm text-[var(--text-secondary)]">
                  {{ currentLocale === 'fr' ? 'Continuer la visite avec un autre case study.' : 'Continue browsing with another case study.' }}
                </p>
              </div>

              <NuxtLink
                :to="localePath(`/projects/${nextProject.slug}`)"
                class="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-5 py-3 text-sm text-[var(--text-primary)] no-underline transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                {{ t('projects.cta') }}
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
