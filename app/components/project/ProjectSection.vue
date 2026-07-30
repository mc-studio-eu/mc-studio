<script setup lang="ts">
import { projects as projectData } from '../../data/projects'
import type { ProjectCategory } from '../../data/projects'

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

type ProjectFilter = 'all' | ProjectCategory

interface ProjectCard {
  id: number
  slug: string
  title: string
  description: string
  image: string
  categories: ProjectCategory[]
  tags: string[]
  testimonial?: {
    review: string
    name: string
    job: string
    avatar: string
  }
}

const projects = computed<ProjectCard[]>(() =>
  projectData.map((project, index) => ({
    id: index + 1,
    slug: project.slug,
    title: project.title,
    description: t(`projects.items.${project.i18nKey}.description`),
    image: project.image,
    categories: project.categories,
    tags: Object.values(tm(`projects.items.${project.i18nKey}.tags`) as Record<string, string> || {}).map(tag => rt(tag)),
    testimonial: project.testimonial
      ? {
          review: t(`projects.items.${project.i18nKey}.testimonial.review`),
          name: project.testimonial.name,
          job: t(`projects.items.${project.i18nKey}.testimonial.job`),
          avatar: project.testimonial.avatar,
        }
      : undefined,
  }))
)

const filters: Array<{ value: ProjectFilter; labelKey: string }> = [
  { value: 'all', labelKey: 'projects.filters.all' },
  { value: 'branding', labelKey: 'projects.filters.branding' },
  { value: 'landing-page', labelKey: 'projects.filters.landing_page' },
  { value: 'app', labelKey: 'projects.filters.app' },
]

const selectedFilter = ref<ProjectFilter>('all')
const showAllProjects = ref(false)

const filteredProjects = computed(() => {
  const activeFilter = selectedFilter.value
  const matchingProjects = activeFilter === 'all'
    ? projects.value
    : projects.value.filter(project =>
        project.categories.includes(activeFilter)
      )

  return [...matchingProjects].sort((firstProject, secondProject) => {
    if (activeFilter === 'all') {
      const featuredProjectPriority =
        Number(secondProject.slug === 'ra-energy') - Number(firstProject.slug === 'ra-energy')

      if (featuredProjectPriority !== 0) return featuredProjectPriority
    }

    const testimonialPriority =
      Number(Boolean(secondProject.testimonial)) - Number(Boolean(firstProject.testimonial))

    if (testimonialPriority !== 0) return testimonialPriority
    if (activeFilter !== 'all') return 0

    return (
      Number(secondProject.categories.includes('landing-page')) -
      Number(firstProject.categories.includes('landing-page'))
    )
  })
})

const visibleProjects = computed(() =>
  showAllProjects.value
    ? filteredProjects.value
    : filteredProjects.value.slice(0, 4)
)

const hasMoreProjects = computed(() =>
  !showAllProjects.value && filteredProjects.value.length > 4
)

const selectFilter = (filter: ProjectFilter) => {
  selectedFilter.value = filter
  showAllProjects.value = false
}
</script>

<template>

  <section id="projets" class="py-16 md:py-20 px-6 transition-colors duration-300 bg-[var(--bg-primary)]">
    <div class="max-w-[1216px] mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 md:mb-16">
        <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-3 transition-colors duration-300 text-[var(--text-primary)]" v-html="$t('projects.title')">
        </h2>
        <p class="text-sm sm:text-base max-w-xl mx-auto leading-relaxed transition-colors duration-300 text-[var(--text-secondary)]" v-html="$t('projects.subtitle')">
        </p>

        <!-- Project Filters -->
        <div class="flex flex-wrap items-center justify-center gap-2 mt-6" role="group" :aria-label="$t('projects.filters.aria_label')">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            class="inline-flex min-h-9 items-center justify-center rounded-full border px-4 font-inter text-xs sm:text-sm font-medium transition-all duration-200"
            :class="selectedFilter === filter.value
              ? 'border-[var(--color-gold)] bg-[linear-gradient(110deg,#fff_0%,#f0bf6c_100%)] text-[#0f0f0f] shadow-[0_6px_20px_rgba(240,191,108,0.16)]'
              : 'border-[var(--border-subtle)] bg-[#181818] text-[var(--text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--text-primary)]'"
            :aria-pressed="selectedFilter === filter.value"
            @click="selectFilter(filter.value)"
          >
            {{ $t(filter.labelKey) }}
          </button>
        </div>
      </div>

      <!-- Project Cards -->
      <TransitionGroup
        name="project-grid"
        tag="div"
        class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
      >
        <article
          v-for="project in visibleProjects"
          :key="project.id"
          class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[#151515] transition-all duration-300 hover:border-[rgba(240,191,108,0.55)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
        >
          <NuxtLink
            :to="localePath(`/projects/${project.slug}`)"
            class="block overflow-hidden bg-[#0f0f0f]"
            :aria-label="`${$t('projects.cta')} — ${project.title}`"
          >
            <NuxtImg
              :src="project.image"
              :alt="project.title"
              class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            />
          </NuxtLink>

          <div class="flex grow flex-col p-5 sm:p-6">
            <h3 class="font-manrope text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              {{ project.title }}
            </h3>
            <p class="project-card-description mt-3 font-inter text-sm leading-relaxed text-[var(--text-secondary)]">
              {{ project.description }}
            </p>

            <div class="mt-4 flex flex-wrap gap-2">
              <UBadge
                v-for="tag in project.tags.slice(0, 3)"
                :key="tag"
                variant="outline"
                class="font-inter bg-white text-black"
                size="sm"
              >
                {{ tag }}
              </UBadge>
              <span
                v-if="project.tags.length > 3"
                class="inline-flex items-center rounded-md border border-[var(--border-subtle)] px-2 py-0.5 font-inter text-xs text-[var(--text-secondary)]"
                :aria-label="$t('projects.more_tags', { count: project.tags.length - 3 })"
              >
                +{{ project.tags.length - 3 }}
              </span>
            </div>

            <blockquote
              v-if="project.testimonial"
              class="mt-5 rounded-xl border border-[rgba(240,191,108,0.16)] bg-[#1d1d1d] p-4"
            >
              <p class="m-0 whitespace-pre-line font-inter text-xs leading-[1.65] text-[var(--text-primary)]">
                « {{ project.testimonial.review }} »
              </p>

              <footer class="mt-4 flex items-center gap-3">
                <NuxtImg
                  :src="project.testimonial.avatar"
                  :alt="project.testimonial.name"
                  class="h-10 w-10 shrink-0 rounded-full bg-white object-cover"
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
                class="inline-flex h-10 w-fit items-center justify-center rounded-lg bg-[linear-gradient(to_right,white_50%,#f0bf6c)] px-4 font-inter text-sm font-medium text-[#0f0f0f] no-underline shadow-[0_4px_4px_rgba(0,0,0,0.25),0_10px_10px_rgba(11,32,103,0.05)] transition-all duration-200 hover:brightness-105"
              >
                {{ $t('projects.cta') }}
                <UIcon
                  name="i-heroicons-arrow-right-20-solid"
                  class="ml-1.5 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </NuxtLink>
            </div>
          </div>
        </article>
      </TransitionGroup>

      <div v-if="hasMoreProjects" class="mt-8 flex justify-center">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[#181818] px-5 font-inter text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:border-[var(--color-gold)]"
          @click="showAllProjects = true"
        >
          {{ $t('projects.show_more') }}
        </button>
      </div>
    </div>
  </section>
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
