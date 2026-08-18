<script setup lang="ts">
import { projectFilters, useProjectCards } from '../../composables/useProjectCards'
import type { ProjectFilter } from '../../composables/useProjectCards'

const localePath = useLocalePath()
const { filterProjects } = useProjectCards()

const filters = projectFilters
const selectedFilter = ref<ProjectFilter>('all')

const filteredProjects = computed(() => filterProjects(selectedFilter.value))
const visibleProjects = computed(() => filteredProjects.value.slice(0, 4))
const hasMoreProjects = computed(() => filteredProjects.value.length > 4)
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
              : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#d5b36f] hover:text-[var(--text-primary)]'"
            :aria-pressed="selectedFilter === filter.value"
            @click="selectedFilter = filter.value"
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
        <ProjectCard
          v-for="project in visibleProjects"
          :key="project.id"
          :project="project"
        />
      </TransitionGroup>

      <div v-if="hasMoreProjects" class="mt-8 flex justify-center">
        <NuxtLink
          :to="localePath('/projects')"
          class="site-cta inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 font-inter text-sm font-medium text-[var(--text-primary)] shadow-[0_10px_30px_rgba(88,67,33,0.07)] no-underline transition-colors hover:border-[#d5b36f]"
        >
          {{ $t('projects.show_more') }}
          <UIcon name="i-lucide-arrow-right" class="ml-2 h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
