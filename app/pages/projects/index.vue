<script setup lang="ts">
const { t } = useI18n()

const galleryProjects = [
  { title: 'Sotraya', image: '/img/project/sotraya/hero.jpg' },
  { title: 'Shika Consulting', image: '/img/project/shika-consulting/homepage.webp' },
  { title: 'Souji Nova', image: '/img/project/souji-nova-section.png' },
  { title: 'R&A Energy', image: '/img/project/hero-raenergy.png' },
  { title: 'Fontaines VTC', image: '/img/project/live-screens/fontaines-vtc.png' },
]

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

      <div class="project-screens">
        <div
          v-for="project in galleryProjects"
          :key="project.title"
          class="project-screen"
        >
          <NuxtImg :src="project.image" :alt="project.title" class="block h-auto w-full" loading="lazy" />
        </div>
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

.project-screens {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(48px, 8vw, 96px);
}

.project-screen {
  overflow: hidden;
  border-radius: 18px;
  background: #191919;
}
</style>
