<script setup lang="ts">
import { projects as projectData } from '../../data/projects'

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

// Only the projects where the studio shipped a CRM or a business application
const appProjects = computed(() =>
  projectData
    .filter((project) => project.categories.includes('app'))
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      image: project.image,
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
    // Projects with a client quote first, they carry more weight on this page
    .sort((first, second) => Number(Boolean(second.testimonial)) - Number(Boolean(first.testimonial)))
)
</script>

<template>
  <section id="realisations" class="bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="mx-auto max-w-[1216px]">
      <div class="mx-auto mb-10 max-w-[640px] text-center md:mb-14">
        <h2
          class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] sm:text-3xl md:text-[32px]"
          v-html="t('crm_offer.work.title')"
        />
        <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          {{ t('crm_offer.work.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        <article
          v-for="project in appProjects"
          :key="project.slug"
          class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--card-shadow)] transition-all duration-300 hover:border-[var(--border-color)]"
        >
          <NuxtLink
            :to="localePath(`/projects/${project.slug}`)"
            class="block overflow-hidden bg-[var(--bg-primary)]"
            :aria-label="`${t('crm_offer.work.cta')} — ${project.title}`"
          >
            <NuxtImg
              :src="project.image"
              :alt="project.title"
              class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              loading="lazy"
            />
          </NuxtLink>

          <div class="flex grow flex-col p-5 sm:p-6">
            <h3 class="font-manrope text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {{ project.title }}
            </h3>
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
                {{ t('crm_offer.work.cta') }}
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <div class="mt-8 flex justify-center">
        <NuxtLink
          :to="localePath('/projects')"
          class="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 font-inter text-sm font-medium text-[var(--text-primary)] no-underline transition-colors duration-200 hover:border-[var(--border-color)]"
        >
          {{ t('crm_offer.work.all') }}
        </NuxtLink>
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
</style>
