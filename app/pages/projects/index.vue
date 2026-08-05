<script setup lang="ts">
import { projects as projectData } from '../../data/projects'
import type { ProjectCategory } from '../../data/projects'
import Navbar from '../../components/layouts/Navbar.vue'

type ProjectFilter = 'all' | ProjectCategory

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

const allProjects = computed(() =>
  projectData.map((project) => ({
    slug: project.slug,
    title: project.title,
    image: project.image,
    categories: project.categories,
    description: t(`projects.items.${project.i18nKey}.description`),
    tags: Object.values(
      (tm(`projects.items.${project.i18nKey}.tags`) as Record<string, unknown>) || {}
    ).map((tag) => rt(tag)),
    testimonial: project.testimonial
      ? {
          review: t(`projects.items.${project.i18nKey}.testimonial.review`),
          name: project.testimonial.name,
          job: t(`projects.items.${project.i18nKey}.testimonial.job`),
          avatar: project.testimonial.avatar
        }
      : undefined
  }))
)

const filters: Array<{ value: ProjectFilter; labelKey: string }> = [
  { value: 'all', labelKey: 'projects.filters.all' },
  { value: 'branding', labelKey: 'projects.filters.branding' },
  { value: 'landing-page', labelKey: 'projects.filters.landing_page' },
  { value: 'app', labelKey: 'projects.filters.app' }
]

const selectedFilter = ref<ProjectFilter>('all')

const filteredProjects = computed(() => {
  const activeFilter = selectedFilter.value
  const matchingProjects =
    activeFilter === 'all'
      ? allProjects.value
      : allProjects.value.filter((project) => project.categories.includes(activeFilter))

  // Projects with a client quote first, they carry more weight on this page
  return [...matchingProjects].sort(
    (first, second) => Number(Boolean(second.testimonial)) - Number(Boolean(first.testimonial))
  )
})

// `|` is the plural separator in vue-i18n, so the suffix is appended here, not in the locale file
const pageTitle = computed(() => `${t('projects.page.meta_title')} | MC Studio`)

useSeoMeta({
  title: () => pageTitle.value,
  description: () => t('projects.page.meta_description'),
  ogTitle: () => pageTitle.value,
  ogDescription: () => t('projects.page.meta_description')
})
</script>

<template>
  <main class="min-h-screen bg-[var(--bg-primary)] px-5 py-5 transition-colors duration-300 sm:px-6 sm:py-6">
    <Navbar floating-only always-floating />

    <section class="mx-auto w-full max-w-[1216px] px-1 pb-8 pt-[clamp(96px,12vw,140px)] sm:px-2">
      <div class="mx-auto mb-10 max-w-[640px] text-center md:mb-14">
        <NuxtLink
          :to="localePath('/')"
          class="mb-6 inline-flex items-center gap-1.5 font-inter text-sm text-[var(--text-secondary)] no-underline transition-colors duration-200 hover:text-[var(--text-primary)]"
        >
          <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
          {{ t('projects.page.back') }}
        </NuxtLink>

        <h1
          class="section-title font-manrope text-3xl font-medium leading-tight text-[var(--text-primary)] sm:text-4xl md:text-[40px]"
          v-html="t('projects.page.title')"
        />
        <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          {{ t('projects.page.subtitle') }}
        </p>

        <div
          class="mt-6 flex flex-wrap items-center justify-center gap-2"
          role="group"
          :aria-label="t('projects.filters.aria_label')"
        >
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            class="inline-flex min-h-9 items-center justify-center rounded-full border px-4 font-inter text-xs font-medium transition-all duration-200 sm:text-sm"
            :class="
              selectedFilter === filter.value
                ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-color)] hover:text-[var(--text-primary)]'
            "
            :aria-pressed="selectedFilter === filter.value"
            @click="selectedFilter = filter.value"
          >
            {{ t(filter.labelKey) }}
          </button>
        </div>
      </div>

      <TransitionGroup
        name="project-grid"
        tag="div"
        class="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
      >
        <article
          v-for="project in filteredProjects"
          :key="project.slug"
          class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--card-shadow)] transition-all duration-300 hover:border-[var(--border-color)]"
        >
          <NuxtLink
            :to="localePath(`/projects/${project.slug}`)"
            class="block overflow-hidden bg-[var(--bg-primary)]"
            :aria-label="`${t('projects.cta')} — ${project.title}`"
          >
            <NuxtImg
              :src="project.image"
              :alt="project.title"
              class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              loading="lazy"
            />
          </NuxtLink>

          <div class="flex grow flex-col p-5 sm:p-6">
            <h2 class="font-manrope text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {{ project.title }}
            </h2>
            <p class="project-card-description mt-3 font-inter text-sm leading-relaxed text-[var(--text-secondary)]">
              {{ project.description }}
            </p>

            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="tag in project.tags.slice(0, 3)"
                :key="tag"
                class="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-0.5 font-inter text-xs text-[var(--text-secondary)]"
              >
                {{ tag }}
              </span>
              <span
                v-if="project.tags.length > 3"
                class="inline-flex items-center rounded-md border border-[var(--border-subtle)] px-2 py-0.5 font-inter text-xs text-[var(--text-secondary)]"
                :aria-label="t('projects.more_tags', { count: project.tags.length - 3 })"
              >
                +{{ project.tags.length - 3 }}
              </span>
            </div>

            <blockquote
              v-if="project.testimonial"
              class="mt-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"
            >
              <p class="m-0 whitespace-pre-line font-inter text-xs leading-[1.65] text-[var(--text-primary)]">
                « {{ project.testimonial.review }} »
              </p>
              <footer class="mt-4 flex items-center gap-3">
                <NuxtImg
                  :src="project.testimonial.avatar"
                  :alt="project.testimonial.name"
                  class="h-10 w-10 shrink-0 rounded-full bg-white object-cover"
                  loading="lazy"
                />
                <div class="min-w-0">
                  <cite class="block truncate font-inter text-sm font-semibold not-italic text-[var(--text-primary)]">
                    {{ project.testimonial.name }}
                  </cite>
                  <span class="block truncate font-inter text-xs text-[var(--text-secondary)]">
                    {{ project.testimonial.job }}
                  </span>
                </div>
              </footer>
            </blockquote>

            <div class="mt-auto pt-6">
              <NuxtLink
                :to="localePath(`/projects/${project.slug}`)"
                class="inline-flex h-10 w-fit items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 font-inter text-sm font-medium text-[var(--text-primary)] no-underline transition-colors duration-200 hover:border-[var(--border-color)]"
              >
                {{ t('projects.cta') }}
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </NuxtLink>
            </div>
          </div>
        </article>
      </TransitionGroup>

      <p
        v-if="!filteredProjects.length"
        class="py-12 text-center font-inter text-sm text-[var(--text-secondary)]"
      >
        {{ t('projects.page.empty') }}
      </p>
    </section>

    <FooterSection class="mt-16" />
    <ScrollToTop />
  </main>
</template>

<style scoped>
.project-card-description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.project-grid-enter-active,
.project-grid-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.project-grid-enter-from,
.project-grid-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
