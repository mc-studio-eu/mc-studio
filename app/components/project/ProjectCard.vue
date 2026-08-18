<script setup lang="ts">
import type { ProjectCard } from '../../composables/useProjectCards'

defineProps<{
  project: ProjectCard
}>()

const localePath = useLocalePath()
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
</template>

<style scoped>
.project-card-description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
