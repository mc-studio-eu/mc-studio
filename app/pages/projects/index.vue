<script setup lang="ts">
import { projectFilters, useProjectCards } from '../../composables/useProjectCards'
import type { ProjectFilter } from '../../composables/useProjectCards'
import Navbar from '../../components/layouts/Navbar.vue'

type ProjectView = 'grid' | 'list'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { filterProjects } = useProjectCards()

const filters = projectFilters

const isProjectFilter = (value: unknown): value is ProjectFilter =>
  filters.some(filter => filter.value === value)

const isProjectView = (value: unknown): value is ProjectView =>
  value === 'grid' || value === 'list'

const routeFilter = computed<ProjectFilter>(() =>
  isProjectFilter(route.query.filter) ? route.query.filter : 'all'
)

const routeView = computed<ProjectView>(() =>
  isProjectView(route.query.view) ? route.query.view : 'grid'
)

const selectedFilter = ref<ProjectFilter>(routeFilter.value)
const viewMode = ref<ProjectView>(routeView.value)

const filteredProjects = computed(() => filterProjects(selectedFilter.value))

const updateQuery = () => {
  router.replace({
    query: {
      ...(selectedFilter.value === 'all' ? {} : { filter: selectedFilter.value }),
      ...(viewMode.value === 'grid' ? {} : { view: viewMode.value }),
    },
  })
}

const selectFilter = (filter: ProjectFilter) => {
  selectedFilter.value = filter
  updateQuery()
}

const selectView = (view: ProjectView) => {
  viewMode.value = view
  updateQuery()
}

watch(routeFilter, filter => selectedFilter.value = filter)
watch(routeView, view => viewMode.value = view)

useSeoMeta({
  title: `${t('projects.all.meta_title')} | MC Studio`,
  description: t('projects.all.subtitle'),
  ogTitle: `${t('projects.all.meta_title')} | MC Studio`,
  ogDescription: t('projects.all.subtitle'),
})
</script>

<template>
  <main class="projects-page min-h-screen transition-colors duration-300">
    <Navbar floating-only always-floating />

    <section class="projects-gallery" aria-labelledby="projects-page-title">
      <h1
        id="projects-page-title"
        class="projects-heading"
        v-html="$t('projects.title')"
      >
      </h1>
      <p class="sr-only">
        {{ $t('projects.all.subtitle') }}
      </p>

      <div class="projects-toolbar">
        <div
          class="projects-filters scrollbar-hide"
          role="group"
          :aria-label="$t('projects.filters.aria_label')"
        >
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            class="projects-filter"
            :class="{ 'projects-filter--active': selectedFilter === filter.value }"
            :aria-pressed="selectedFilter === filter.value"
            @click="selectFilter(filter.value)"
          >
            {{ $t(filter.labelKey) }}
          </button>
        </div>

        <div
          class="projects-view-switcher"
          role="group"
          :aria-label="$t('projects.view.aria_label')"
        >
          <button
            type="button"
            class="projects-view-button"
            :class="{ 'projects-view-button--active': viewMode === 'grid' }"
            :aria-label="$t('projects.view.grid')"
            :aria-pressed="viewMode === 'grid'"
            @click="selectView('grid')"
          >
            <UIcon name="i-lucide-grid-2x2" class="h-5 w-5" />
          </button>
          <button
            type="button"
            class="projects-view-button"
            :class="{ 'projects-view-button--active': viewMode === 'list' }"
            :aria-label="$t('projects.view.list')"
            :aria-pressed="viewMode === 'list'"
            @click="selectView('list')"
          >
            <UIcon name="i-lucide-list" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <TransitionGroup
        name="project-grid"
        tag="div"
        class="projects-grid"
        :class="`projects-grid--${viewMode}`"
      >
        <ProjectGalleryCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          :layout="viewMode"
        />
      </TransitionGroup>

      <p v-if="!filteredProjects.length" class="projects-empty">
        {{ $t('projects.all.empty') }}
      </p>
    </section>

    <div class="projects-footer-content">
      <CtaSection />
      <FooterSection />
    </div>

    <ScrollToTop />
  </main>
</template>

<style scoped>
.projects-page {
  --projects-surface: var(--bg-primary);
  --projects-control: var(--bg-soft);
  --projects-control-active: var(--gold-cta-gradient);
  --projects-control-text: var(--text-secondary);
  --projects-control-active-text: var(--text-primary);
  --projects-switch-active: var(--bg-card);
  background: var(--projects-surface);
}

:global(.dark) .projects-page {
  --projects-surface: var(--bg-primary);
  --projects-control: var(--bg-soft);
  --projects-control-active: var(--gold-cta-gradient);
  --projects-control-text: var(--text-secondary);
  --projects-control-active-text: var(--text-primary);
  --projects-switch-active: var(--bg-card);
}

.projects-gallery {
  width: min(100%, 1680px);
  min-height: 70vh;
  margin: 0 auto;
  padding: clamp(58px, 7vw, 108px) clamp(16px, 2.6vw, 48px) clamp(64px, 7vw, 112px);
}

.projects-heading {
  margin: 0 0 clamp(48px, 6vw, 82px);
  font-family: var(--font-manrope);
  font-size: clamp(54px, 7.2vw, 104px);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.065em;
  text-align: left;
  color: var(--projects-control-text);
  -webkit-text-fill-color: currentColor;
  background: none;
}

.projects-heading :deep(.text-gradient) {
  background: linear-gradient(100deg, #9d6413 0%, #f0bf6c 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.projects-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.projects-filters {
  display: flex;
  min-width: 0;
  gap: 9px;
  overflow-x: auto;
}

.projects-filter {
  display: inline-flex;
  min-height: 44px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-subtle);
  border-radius: 11px;
  background: var(--projects-control);
  padding: 10px 22px;
  font-family: var(--font-inter);
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  color: var(--projects-control-text);
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.projects-filter:hover {
  transform: translateY(-1px);
  border-color: #d5b36f;
}

.projects-filter--active {
  background: var(--projects-control-active);
  color: var(--projects-control-active-text);
  border-color: #d5b36f;
  box-shadow: 0 10px 26px rgba(166, 111, 24, 0.14);
}

.projects-view-switcher {
  display: flex;
  flex: 0 0 auto;
  gap: 3px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: var(--projects-control);
  padding: 4px;
}

.projects-view-button {
  display: grid;
  width: 44px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.projects-view-button--active {
  background: var(--projects-switch-active);
  color: var(--projects-control-text);
  color: var(--color-gold-readable);
  box-shadow: 0 6px 18px rgba(88, 67, 33, 0.08);
}

.projects-filter:focus-visible,
.projects-view-button:focus-visible {
  outline: 3px solid var(--color-gold);
  outline-offset: 2px;
}

.projects-grid {
  display: grid;
  margin-top: clamp(54px, 6vw, 84px);
  gap: clamp(12px, 1.25vw, 20px);
}

.projects-grid--grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.projects-grid--list {
  grid-template-columns: minmax(0, 1fr);
}

.projects-empty {
  margin-top: 80px;
  text-align: center;
  color: var(--text-secondary);
}

.projects-footer-content {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-primary);
}

.project-grid-enter-active,
.project-grid-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.project-grid-enter-from,
.project-grid-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1023px) {
  .projects-grid--grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .projects-gallery {
    padding-top: 52px;
  }

  .projects-heading {
    margin-bottom: 40px;
    font-size: clamp(46px, 15vw, 62px);
  }

  .projects-toolbar {
    align-items: flex-start;
  }

  .projects-filter {
    min-height: 40px;
    padding: 9px 16px;
    font-size: 14px;
  }

  .projects-view-switcher {
    display: none;
  }

  .projects-grid {
    margin-top: 42px;
  }

  .projects-grid--grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .projects-filter,
  .projects-view-button,
  .project-grid-enter-active,
  .project-grid-leave-active {
    transition: none;
  }
}
</style>
