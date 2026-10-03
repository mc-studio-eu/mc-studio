<script setup lang="ts">
import { useProjectCards } from '../../composables/useProjectCards'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const { filterProjects } = useProjectCards()

const creatorSlugs = new Set(['personal', 'maison-awl'])
const websiteProjects = computed(() => filterProjects('landing-page'))

const projectKind = (slug: string) => creatorSlugs.has(slug) ? 'Creator' : 'Business'

useSeoMeta({
  title: `${t('projects.all.meta_title')} | MC Studio`,
  description: t('projects.all.subtitle'),
  ogTitle: `${t('projects.all.meta_title')} | MC Studio`,
  ogDescription: t('projects.all.subtitle'),
})
</script>

<template>
  <main class="projects-page min-h-screen bg-[#0f0f0f] text-white">
    <StudioNavbar tone="dark" />

    <section class="projects-page__intro mx-auto w-[min(1240px,calc(100%-48px))] pb-20 pt-[clamp(80px,12vw,150px)] sm:pb-28">
      <div class="max-w-[820px]">
        <h1 class="projects-page__title font-manrope text-[clamp(3.4rem,8vw,7.8rem)] font-medium leading-[0.92] tracking-[-0.075em] text-white">
          {{ t('globalHome.projects.title') }}
        </h1>
        <p class="mt-8 max-w-[560px] text-balance font-inter text-base leading-7 text-white/60 sm:text-lg">
          {{ t('projects.all.subtitle') }}
        </p>
      </div>

    </section>

    <section class="projects-page__work mx-auto w-[min(1240px,calc(100%-48px))] pb-28 sm:pb-40" aria-labelledby="projects-grid-title">
      <h2 id="projects-grid-title" class="sr-only">{{ t('globalHome.projects.title') }}</h2>

      <div class="grid gap-x-5 gap-y-14 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-20">
        <NuxtLink
          v-for="project in websiteProjects"
          :key="project.id"
          :to="localePath(`/projects/${project.slug}`)"
          class="project-showcase group"
          :aria-label="`${project.title} — ${locale === 'fr' ? 'Voir le projet' : 'View project'}`"
        >
          <div class="project-showcase__media">
            <NuxtImg :src="project.image" :alt="project.title" class="h-full w-full object-cover" loading="lazy" />
            <span class="project-showcase__open" aria-hidden="true">↗</span>
          </div>
          <div class="mt-5 flex items-baseline justify-between gap-5 border-t border-white/15 pt-4">
            <h3 class="font-manrope text-2xl tracking-[-0.045em] sm:text-3xl">{{ project.title }}</h3>
            <span class="shrink-0 text-[10px] uppercase tracking-[0.16em] text-white/40">{{ projectKind(project.slug) }}</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <FooterSection />
  </main>
</template>

<style scoped>
.projects-page__intro,
.projects-page__work {
  scroll-margin-top: 80px;
}

.projects-page__title {
  background: none;
  color: #fff;
  -webkit-background-clip: border-box;
  -webkit-text-fill-color: #fff;
}

.project-showcase {
  display: block;
  color: inherit;
  text-decoration: none;
  transition: transform 300ms cubic-bezier(.22,1,.36,1);
}

.project-showcase__media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 18px;
  background: #191919;
}

.project-showcase__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 54%, rgba(0,0,0,.22));
  pointer-events: none;
}

.project-showcase__open {
  position: absolute;
  right: 18px;
  top: 18px;
  z-index: 1;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(255,255,255,.55);
  border-radius: 50%;
  background: rgba(15,15,15,.2);
  font-size: 20px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 250ms ease, transform 450ms cubic-bezier(.22,1,.36,1), background 300ms ease, color 300ms ease, border-color 300ms ease;
}

.project-showcase:hover .project-showcase__open,
.project-showcase:focus-visible .project-showcase__open {
  opacity: 1;
  transform: translateY(0);
}

@media (hover: hover) {
  .project-showcase:hover .project-showcase__open,
  .project-showcase:focus-visible .project-showcase__open {
    transform: translateY(0) rotate(45deg);
    border-color: #fff;
    background: #fff;
    color: #17130f;
  }
}

.project-showcase:focus-visible {
  outline: 2px solid #f0bf6c;
  outline-offset: 7px;
}

@media (max-width: 640px) {
  .project-showcase__open {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-showcase,
  .project-showcase__media img,
  .project-showcase__open {
    transition: none;
  }

  .project-showcase:hover {
    transform: none;
  }

  .project-showcase:hover .project-showcase__open,
  .project-showcase:focus-visible .project-showcase__open {
    transform: none;
  }
}
</style>
