<script setup lang="ts">
import { projectFilters, useProjectCards } from '../../composables/useProjectCards'
import type { ProjectFilter } from '../../composables/useProjectCards'
import Navbar from '../../components/layouts/Navbar.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const { filterProjects } = useProjectCards()

const filters = projectFilters

const isProjectFilter = (value: unknown): value is ProjectFilter =>
  filters.some(filter => filter.value === value)

const initialFilter = computed<ProjectFilter>(() => {
  const queryFilter = route.query.filter
  return isProjectFilter(queryFilter) ? queryFilter : 'all'
})

const selectedFilter = ref<ProjectFilter>(initialFilter.value)

const filteredProjects = computed(() => filterProjects(selectedFilter.value))

const selectFilter = (filter: ProjectFilter) => {
  selectedFilter.value = filter
  router.replace({
    query: filter === 'all' ? {} : { filter },
  })
}

watch(initialFilter, (filter) => {
  selectedFilter.value = filter
})

useSeoMeta({
  title: `${t('projects.all.meta_title')} | MC Studio`,
  description: t('projects.all.subtitle'),
  ogTitle: `${t('projects.all.meta_title')} | MC Studio`,
  ogDescription: t('projects.all.subtitle'),
})
</script>

<template>
  <main class="main-container min-h-screen px-5 py-5 transition-colors duration-300 sm:px-6 sm:py-6">
    <Navbar floating-only always-floating />

    <!-- Main Content with Border Frame -->
    <div class="relative mx-auto max-w-[1440px]">
      <!-- Left Border Line -->
      <div class="border-line absolute left-0 xl:left-[50px] top-0 bottom-0 w-px"></div>

      <!-- Right Border Line -->
      <div class="border-line absolute right-0 xl:right-[50px] top-0 bottom-0 w-px"></div>

      <section class="mx-auto w-full max-w-[1216px] px-4 pb-8 pt-[clamp(72px,10vw,120px)] sm:px-8">
      <NuxtLink
        :to="localePath('/')"
        class="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white/[0.03] px-4 py-2 font-inter text-xs font-medium text-[var(--text-secondary)] no-underline backdrop-blur transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--text-primary)] sm:text-sm"
      >
        <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
        {{ $t('projects.all.back') }}
      </NuxtLink>

      <div class="mt-8 text-center md:mt-12">
        <h1
          class="font-manrope text-3xl font-medium leading-[1.1] text-[var(--text-primary)] transition-colors duration-300 sm:text-4xl md:text-[44px]"
          v-html="$t('projects.all.title')"
        />
        <p class="mx-auto mt-4 max-w-xl font-inter text-sm leading-relaxed text-[var(--text-secondary)] transition-colors duration-300 sm:text-base">
          {{ $t('projects.all.subtitle') }}
        </p>

        <div
          class="mt-6 flex flex-wrap items-center justify-center gap-2"
          role="group"
          :aria-label="$t('projects.filters.aria_label')"
        >
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

        <p class="mt-4 font-inter text-xs text-[var(--text-secondary)]">
          {{ $t('projects.all.count', filteredProjects.length) }}
        </p>
      </div>

      <TransitionGroup
        name="project-grid"
        tag="div"
        class="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 md:gap-6"
      >
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
        />
      </TransitionGroup>

      <p
        v-if="!filteredProjects.length"
        class="mt-12 text-center font-inter text-sm text-[var(--text-secondary)]"
      >
        {{ $t('projects.all.empty') }}
      </p>
      </section>

      <div class="section-separator mt-16"></div>

      <CtaSection />

      <div class="section-separator mb-10 mt-10"></div>
    </div>

    <FooterSection />
    <ScrollToTop />
  </main>
</template>

<style scoped>
/* Main container */
.main-container {
  background-color: var(--bg-primary);
}

/* Border lines */
.border-line {
  background: linear-gradient(to bottom, var(--border-color) 0%, var(--border-color) 50%, transparent 100%);
}

:global(.dark) .border-line {
  background: linear-gradient(to bottom, rgba(240, 191, 108, 0.4) 0%, rgba(240, 191, 108, 0.2) 50%, transparent 100%);
}

:global(.light) .border-line {
  background: linear-gradient(to bottom, rgba(26, 26, 26, 0.15) 0%, rgba(26, 26, 26, 0.08) 50%, transparent 100%);
}

/* Section separator line */
.section-separator {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--border-color) 20%, var(--border-color) 80%, transparent 100%);
  margin-bottom: 40px;
  margin-left: auto;
  margin-right: auto;
  max-width: calc(100% - 146px);
}

:global(.dark) .section-separator {
  background: linear-gradient(90deg, transparent 0%, rgba(240, 191, 108, 0.25) 20%, rgba(240, 191, 108, 0.25) 80%, transparent 100%);
}

:global(.light) .section-separator {
  background: linear-gradient(90deg, transparent 0%, rgba(26, 26, 26, 0.12) 20%, rgba(26, 26, 26, 0.12) 80%, transparent 100%);
}

@media (max-width: 1024px) {
  .section-separator {
    max-width: 100%;
  }
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
