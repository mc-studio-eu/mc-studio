<script setup lang="ts">
import { projects } from '~/data/projects'
import { findCaseStudyBySlug } from '~/data/caseStudies'
import { useStudioSeo } from '~/composables/useStudioSeo'
import '~/assets/css/studio-pages.css'

const localePath = useLocalePath()
const products = ['personal', 'arises']
const priority = ['crm-ra-energy', 'maison-awl']
const groups = [
  {
    title: 'Applications clients',
    items: [
      ...priority.map((slug) => projects.find((p) => p.slug === slug)!),
    ],
  },
  {
    title: 'Produits du studio',
    items: projects.filter((p) => products.includes(p.slug)),
  },
  {
    title: 'Autres réalisations',
    items: projects.filter((p) => !priority.includes(p.slug) && !products.includes(p.slug)),
  },
]
const covers: Record<string, string> = {
  'crm-ra-energy': '/img/studio/crm-ra-1280.webp',
  'maison-awl': '/img/studio/maison-awl-1280.webp',
  personal: '/img/studio/personal-1280.webp',
}
useStudioSeo(
  'Réalisations & produits | MC Studio',
  'Explorez les missions clients et les produits du studio, du CRM de R&A Energy à la marketplace Maison AWL et au SaaS IA Personal.',
)
</script>
<template>
  <div class="studio-page studio-work-index">
    <StudioNavbar />
    <main class="studio-page__wrap">
      <header class="studio-page__hero">
        <h1>Des applications<br />sur le terrain.</h1>
        <p class="studio-page__lead">
          Découvrez comment un besoin se traduit en logiciel, depuis la
          vérification d’un rendez-vous commercial jusqu’au paiement d’une
          prestation.
        </p>
      </header>
      <section
        v-for="(group, index) in groups"
        :key="group.title"
        class="studio-page__section"
        :class="{ 'studio-work-index__lead': index === 0 }"
      >
        <h2>{{ group.title }}</h2>
        <div class="work-grid">
          <NuxtLink
            v-for="project in group.items"
            :key="project.slug"
            class="work-entry"
            :to="localePath('/projects/' + project.slug)"
          >
            <div class="work-image">
              <img
                :src="covers[project.slug] || project.image"
                alt=""
                width="960"
                height="600"
                loading="lazy"
              />
            </div>
            <h3>{{ project.title }} <span aria-hidden="true">↗</span></h3>
            <p>{{ findCaseStudyBySlug(project.slug)?.fr.headline }}</p>
          </NuxtLink>
        </div>
      </section>
      <section class="studio-page__closing">
        <h2>Quel outil vous manque aujourd’hui ?</h2>
        <NuxtLink class="studio-page__button" :to="localePath('/contact')"
          >Parlons de votre projet ↗</NuxtLink
        >
      </section>
    </main>
    <FooterSection />
  </div>
</template>
<style scoped>
.studio-work-index .studio-page__section > h2 {
  margin-bottom: 30px;
  font-family: 'Host Grotesk', sans-serif;
  font-size: clamp(1.65rem, 2.8vw, 2.9rem);
  font-weight: 460;
  letter-spacing: -.055em;
}
.work-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(29px, 4.8vw, 68px) clamp(18px, 4vw, 58px);
}
.studio-work-index__lead .work-grid {
  grid-template-columns: minmax(0, 1.34fr) minmax(0, 1fr);
  align-items: start;
}
.studio-work-index__lead .work-entry:nth-child(2) { margin-top: clamp(15px, 5vw, 68px); }
.work-entry { display: block; text-decoration: none; color: inherit; }
.work-image { overflow: hidden; background: #e5ded0; }
.work-image img {
  display: block;
  width: 100%;
  aspect-ratio: 1.6;
  object-fit: cover;
  transition: transform .45s ease;
}
.studio-work-index__lead .work-entry:first-child img { aspect-ratio: 1.27; }
.work-entry:hover img { transform: scale(1.025); }
.work-entry h3 {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0 5px;
  padding-top: 13px;
  border-top: 1px solid var(--editorial-rule);
  font-size: clamp(1.4rem, 2.75vw, 2.6rem);
  letter-spacing: -.045em;
  line-height: 1.1;
}
.work-entry span { color: var(--editorial-gold); }
.work-entry p { max-width: 53ch; color: var(--editorial-muted); line-height: 1.55; }
@media (max-width: 700px) {
  .work-grid, .studio-work-index__lead .work-grid { grid-template-columns: minmax(0, 1fr); }
  .studio-work-index__lead .work-entry:nth-child(2) { margin-top: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .work-entry:hover img { transform: none; }
}
</style>
