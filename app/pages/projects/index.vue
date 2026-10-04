<script setup lang="ts">
const { t } = useI18n()

const galleryProjects = [
  { title: 'Automatisation, intégrations et IA', image: '/img/project/automation-integrations-ai-screen.png' },
  { title: 'Sotraya — écran d’accueil', image: '/img/project/sotraya/hero-screen.png' },
  { title: 'Personal — hero', image: '/img/project/personal-hero.png' },
  { title: 'Personal — footer', image: '/img/project/personal-footer.png' },
  { title: 'Personal — dashboard', image: '/img/project/personal-dashboard.png' },
  { title: 'Arises — connexion', image: '/img/project/arises-login-screen.png' },
  { title: 'Souji Nova', image: '/img/project/souji-nova-section.png' },
  { title: 'R&A Energy', image: '/img/project/hero-raenergy.png' },
  { title: 'R&A Energy — comment ça marche', image: '/img/project/ra-energy-how-it-works.png' },
  { title: 'Automatisation, intégrations et IA', image: '/img/project/automation-integrations-ai.webp' },
  { title: 'Shika Consulting — footer', image: '/img/project/shika-footer.png' },
  { title: 'MC Studio — espace créateurs', image: '/img/project/mc-studio-creators-hero.png' },
  { title: 'Gestion d’association — vue d’ensemble', image: '/img/project/association-management.png' },
  { title: 'Shika Consulting', image: '/img/project/shika-consulting/homepage.webp' },
  { title: 'AMG Promotion — showroom', image: '/img/project/amg-promotion-showroom.png' },
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
.projects-page__work {
  scroll-margin-top: 80px;
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
