<script setup lang="ts">
import type { ProjectCard } from '../../composables/useProjectCards'

defineProps<{
  project: ProjectCard
}>()

const localePath = useLocalePath()
const projectCtaBtn = ref(null)
const projectCtaWrapper = ref(null)

useTextSlideAnimation(projectCtaBtn, projectCtaWrapper)
</script>

<template>
  <article
    class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[#151515]"
  >
    <NuxtLink
      :to="localePath(`/projects/${project.slug}`)"
      class="block overflow-hidden bg-[#0f0f0f]"
      :aria-label="`${$t('projects.cta')} — ${project.title}`"
    >
      <NuxtImg
        :src="project.image"
        :alt="project.title"
        class="aspect-[16/10] w-full object-cover transition-transform duration-500"
      />
    </NuxtLink>

    <div class="flex grow flex-col p-5 sm:p-6">
      <h3 class="font-manrope text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
        {{ project.title }}
      </h3>
      <p class="project-card-description mt-3 font-inter text-sm leading-relaxed text-[var(--text-secondary)]">
        {{ project.description }}
      </p>

      <div class="mt-auto pt-6">
        <NuxtLink
          ref="projectCtaBtn"
          :to="localePath(`/projects/${project.slug}`)"
          class="inline-flex h-10 w-fit items-center justify-center rounded-lg bg-[linear-gradient(to_right,white_50%,#f0bf6c)] px-4 font-inter text-sm font-medium text-[#0f0f0f] no-underline shadow-[0_4px_4px_rgba(0,0,0,0.25),0_10px_10px_rgba(11,32,103,0.05)] transition-all duration-200 hover:brightness-105"
        >
          <span class="text-slide-container h-5">
            <span ref="projectCtaWrapper" class="text-slide-wrapper">
              <span class="text-slide-text h-5 leading-5">{{ $t('projects.cta') }}</span>
              <span class="text-slide-text h-5 leading-5" aria-hidden="true">{{ $t('projects.cta') }}</span>
            </span>
          </span>
          <UIcon
            name="i-heroicons-arrow-right-20-solid"
            class="ml-1.5 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-card-description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
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
