<script setup lang="ts">
import type { ProjectCard } from '../../composables/useProjectCards'

withDefaults(defineProps<{
  project: ProjectCard
  layout?: 'grid' | 'list'
}>(), {
  layout: 'grid',
})

const localePath = useLocalePath()
</script>

<template>
  <article class="project-gallery-card" :class="`project-gallery-card--${layout}`">
    <NuxtLink
      :to="localePath(`/projects/${project.slug}`)"
      class="project-gallery-card__link"
      :aria-label="`${$t('projects.cta')} — ${project.title}`"
    >
      <NuxtImg
        :src="project.image"
        :alt="project.title"
        class="project-gallery-card__image"
        sizes="100vw sm:50vw xl:33vw"
      />

      <div class="project-gallery-card__scrim" />

      <div class="project-gallery-card__content">
        <p class="project-gallery-card__eyebrow">
          {{ project.tags[0] || project.categories[0] }}
        </p>
        <h2 class="project-gallery-card__title">
          {{ project.title }}
        </h2>
      </div>

      <span class="project-gallery-card__arrow" aria-hidden="true">
        <UIcon name="i-lucide-arrow-up-right" class="h-5 w-5" />
      </span>
    </NuxtLink>
  </article>
</template>

<style scoped>
.project-gallery-card {
  min-width: 0;
}

.project-gallery-card__link {
  position: relative;
  display: block;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--bg-soft);
  color: #fff;
  text-decoration: none;
  isolation: isolate;
  box-shadow: var(--shadow-soft);
}

.project-gallery-card--grid .project-gallery-card__link {
  aspect-ratio: 3 / 4;
}

.project-gallery-card--list .project-gallery-card__link {
  aspect-ratio: 16 / 6;
  min-height: 300px;
}

.project-gallery-card__image {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 700ms cubic-bezier(0.2, 0.75, 0.25, 1), filter 400ms ease;
}

.project-gallery-card__scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.02) 45%, rgba(0, 0, 0, 0.74) 100%),
    linear-gradient(90deg, rgba(0, 0, 0, 0.12), transparent 45%);
  transition: background-color 300ms ease;
}

.project-gallery-card__content {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: clamp(20px, 2.2vw, 32px);
}

.project-gallery-card__eyebrow {
  margin: 0 0 3px;
  font-family: var(--font-inter);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #f7d99e;
}

.project-gallery-card__title {
  margin: 0;
  max-width: calc(100% - 48px);
  font-family: var(--font-manrope);
  font-size: clamp(24px, 2.15vw, 35px);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: #fff;
}

.project-gallery-card__arrow {
  position: absolute;
  right: 24px;
  bottom: 25px;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid rgba(240, 191, 108, 0.72);
  border-radius: 999px;
  background: rgba(240, 191, 108, 0.18);
  opacity: 0;
  transform: translate(-6px, 6px);
  backdrop-filter: blur(12px);
  transition: opacity 250ms ease, transform 350ms ease, background-color 250ms ease;
}

.project-gallery-card__link:hover .project-gallery-card__image {
  transform: scale(1.035);
  filter: saturate(1.04);
}

.project-gallery-card__link:hover .project-gallery-card__arrow,
.project-gallery-card__link:focus-visible .project-gallery-card__arrow {
  opacity: 1;
  transform: translate(0, 0);
}

.project-gallery-card__link:hover .project-gallery-card__arrow {
  background: rgba(240, 191, 108, 0.3);
}

.project-gallery-card__link:focus-visible {
  outline: 3px solid var(--color-gold);
  outline-offset: 3px;
}

@media (max-width: 767px) {
  .project-gallery-card--list .project-gallery-card__link {
    aspect-ratio: 4 / 3;
    min-height: 0;
  }

  .project-gallery-card__arrow {
    display: none;
  }

  .project-gallery-card__title {
    max-width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-gallery-card__image,
  .project-gallery-card__arrow {
    transition: none;
  }
}
</style>
