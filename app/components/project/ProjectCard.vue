<script setup lang="ts">
import type { ProjectCard } from '../../composables/useProjectCards'

defineProps<{
  project: ProjectCard
}>()

const localePath = useLocalePath()
</script>

<template>
  <article
    class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[0_18px_55px_rgba(88,67,33,0.09)]"
  >
    <NuxtLink
      :to="localePath(`/projects/${project.slug}`)"
      class="block overflow-hidden bg-[var(--bg-soft)]"
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

      <div class="mt-4 flex flex-wrap gap-2">
        <UBadge
          v-for="tag in project.tags.slice(0, 3)"
          :key="tag"
          variant="outline"
          class="font-inter border-[#e5c990] bg-[var(--color-gold-soft)] text-[var(--color-gold-deep)]"
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

      <div class="mt-auto pt-6">
        <NuxtLink
          :to="localePath(`/projects/${project.slug}`)"
          class="cta-primary inline-flex items-center justify-center rounded-xl px-4 font-inter text-sm font-semibold text-[#0f0f0f] no-underline transition-all duration-200 hover:brightness-105"
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
