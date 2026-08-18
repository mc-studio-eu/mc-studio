<script setup lang="ts">
import { findProjectBySlug, projects } from '../../data/projects'
import type { LocalizedValue, Project, ProjectCategory } from '../../data/projects'
import Navbar from '../../components/layouts/Navbar.vue'

type LocaleKey = 'fr' | 'en'
type GalleryRow = {
  layout: 'wide' | 'split'
  images: string[]
}

const PAGE_LABELS = {
  fr: {
    back: 'Retour aux projets',
    overview: 'Le projet',
    industry: 'Secteur',
    services: 'Services',
    team: 'Équipe',
    visitWebsite: 'Voir le site',
    bookCall: 'Parler de votre projet',
    context: 'Contexte',
    objectives: 'Objectifs',
    response: 'Notre réponse',
    execution: 'Ce que nous avons réalisé',
    testimonial: 'Le mot du client',
    moreProjects: 'Plus de projets',
    allProjects: 'Tous les projets',
    viewProject: 'Voir le projet',
  },
  en: {
    back: 'Back to projects',
    overview: 'The project',
    industry: 'Industry',
    services: 'Services',
    team: 'Team',
    visitWebsite: 'Visit website',
    bookCall: 'Discuss your project',
    context: 'Context',
    objectives: 'Objectives',
    response: 'Our response',
    execution: 'What we delivered',
    testimonial: 'Client words',
    moreProjects: 'More projects',
    allProjects: 'All projects',
    viewProject: 'View project',
  },
} satisfies Record<LocaleKey, Record<string, string>>

const CATEGORY_LABELS: Record<LocaleKey, Record<ProjectCategory, string>> = {
  fr: {
    branding: 'Identité de marque',
    'landing-page': 'Site web',
    app: 'Produit digital',
  },
  en: {
    branding: 'Brand identity',
    'landing-page': 'Website',
    app: 'Digital product',
  },
}

function getLocalizedValue<T>(value: LocalizedValue<T>, localeKey: LocaleKey): T {
  return value[localeKey]
}

const route = useRoute()
const localePath = useLocalePath()
const { locale, t } = useI18n()

const currentLocale = computed<LocaleKey>(() => (locale.value === 'en' ? 'en' : 'fr'))
const labels = computed(() => PAGE_LABELS[currentLocale.value])
const projectSlug = computed(() => String(route.params.slug ?? ''))
const project = computed<Project | undefined>(() => findProjectBySlug(projectSlug.value))

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found',
  })
}

const localizedProject = computed(() => {
  const currentProject = project.value!
  const localeKey = currentLocale.value

  return {
    ...currentProject,
    summary: getLocalizedValue(currentProject.summary, localeKey),
    aboutCompany: getLocalizedValue(currentProject.aboutCompany, localeKey),
    industry: getLocalizedValue(currentProject.industry, localeKey),
    supportBullets: getLocalizedValue(currentProject.supportBullets, localeKey),
    context: getLocalizedValue(currentProject.context, localeKey),
    solution: getLocalizedValue(currentProject.solution, localeKey),
    challenges: getLocalizedValue(currentProject.challenges, localeKey),
    objectives: getLocalizedValue(currentProject.objectives, localeKey),
    actions: getLocalizedValue(currentProject.actions, localeKey),
  }
})

const backToProjectsLink = computed(() => localePath('/#projets'))
const contactLink = computed(() => localePath({ path: '/', hash: '#contact' }))

const services = computed(() =>
  localizedProject.value.categories.map((category) => CATEGORY_LABELS[currentLocale.value][category]),
)

const galleryRows = computed<GalleryRow[]>(() => {
  const heroImage = localizedProject.value.image
  const desktopImages = [...new Set(localizedProject.value.screenshots.desktop)]
    .filter((image) => image && image !== heroImage)
  const mobileImages = [...new Set(localizedProject.value.screenshots.mobile)]
    .filter((image) => image && image !== heroImage && !desktopImages.includes(image))
  const rows: GalleryRow[] = []

  desktopImages.forEach((image) => {
    rows.push({ layout: 'wide', images: [image] })
  })

  while (mobileImages.length) {
    rows.push({
      layout: mobileImages.length > 1 ? 'split' : 'wide',
      images: mobileImages.splice(0, 2),
    })
  }

  if (!rows.length) {
    rows.push({ layout: 'wide', images: [heroImage] })
  }

  return rows
})

const projectTestimonial = computed(() => {
  const currentProject = project.value!

  if (!currentProject.testimonial) {
    return undefined
  }

  return {
    review: t(`projects.items.${currentProject.i18nKey}.testimonial.review`),
    job: t(`projects.items.${currentProject.i18nKey}.testimonial.job`),
    name: currentProject.testimonial.name,
    avatar: currentProject.testimonial.avatar,
  }
})

const moreProjects = computed(() => {
  const currentIndex = projects.findIndex((item) => item.slug === localizedProject.value.slug)
  const availableProjects = projects.length - 1

  return Array.from({ length: Math.min(3, availableProjects) }, (_, index) => {
    const nextProject = projects[(currentIndex + index + 1) % projects.length]

    return {
      ...nextProject,
      industry: getLocalizedValue(nextProject.industry, currentLocale.value),
      link: localePath(`/projects/${nextProject.slug}`),
    }
  })
})

useSeoMeta({
  title: `${localizedProject.value.title} | MC Studio`,
  description: localizedProject.value.summary,
  ogTitle: `${localizedProject.value.title} | MC Studio`,
  ogDescription: localizedProject.value.summary,
  ogImage: localizedProject.value.image,
})
</script>

<template>
  <main class="case-study-page">
    <Navbar floating-only always-floating />

    <article>
      <header class="case-hero">
        <NuxtImg
          :src="localizedProject.image"
          :alt="localizedProject.title"
          class="case-hero__image"
          preload
        />
        <div class="case-hero__veil" />

        <NuxtLink
          :to="backToProjectsLink"
          class="case-hero__back"
          :aria-label="labels.back"
        >
          <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
          <span>{{ labels.back }}</span>
        </NuxtLink>

        <div class="case-hero__caption">
          <p class="case-kicker">{{ services[0] }}</p>
          <h1 class="case-hero__title">{{ localizedProject.title }}</h1>
        </div>

        <a
          :href="localizedProject.externalLink"
          target="_blank"
          rel="noreferrer"
          class="case-hero__website"
        >
          {{ labels.visitWebsite }}
          <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" />
        </a>
      </header>

      <section class="case-intro case-shell">
        <div class="case-intro__story">
          <p class="case-section-label">{{ labels.overview }}</p>
          <div class="case-intro__copy">
            <p>{{ localizedProject.summary }}</p>
            <p>{{ localizedProject.aboutCompany }}</p>
            <p>{{ localizedProject.context }}</p>
          </div>
        </div>

        <dl class="case-facts">
          <div>
            <dt>{{ labels.industry }}</dt>
            <dd>{{ localizedProject.industry }}</dd>
          </div>
          <div>
            <dt>{{ labels.services }}</dt>
            <dd>{{ services.join(' · ') }}</dd>
          </div>
          <div>
            <dt>{{ labels.team }}</dt>
            <dd>{{ localizedProject.companySize }}</dd>
          </div>
        </dl>
      </section>

      <section class="case-strategy case-shell">
        <article>
          <p class="case-section-label">01 — {{ labels.objectives }}</p>
          <ul class="case-editorial-list">
            <li v-for="objective in localizedProject.objectives" :key="objective">
              {{ objective }}
            </li>
          </ul>
        </article>

        <article>
          <p class="case-section-label">02 — {{ labels.response }}</p>
          <p class="case-strategy__lead">{{ localizedProject.solution }}</p>
        </article>
      </section>

      <section v-if="galleryRows.length" class="case-gallery case-shell">
        <div
          v-for="(row, rowIndex) in galleryRows"
          :key="`${row.layout}-${rowIndex}`"
          class="case-gallery__row"
          :class="`case-gallery__row--${row.layout}`"
        >
          <figure
            v-for="(image, imageIndex) in row.images"
            :key="image"
            class="case-media"
          >
            <NuxtImg
              :src="image"
              :alt="`${localizedProject.title} — ${rowIndex + imageIndex + 1}`"
              class="case-media__image"
              loading="lazy"
            />
          </figure>
        </div>
      </section>

      <section class="case-execution case-shell">
        <div class="case-execution__heading">
          <p class="case-section-label">03 — {{ labels.execution }}</p>
          <h2>{{ localizedProject.title }}</h2>
        </div>

        <ol class="case-actions">
          <li v-for="(action, index) in localizedProject.actions" :key="action.title">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ action.title }}</h3>
            <p>{{ action.body }}</p>
          </li>
        </ol>
      </section>

      <section v-if="projectTestimonial" class="case-quote case-shell">
        <p class="case-section-label">{{ labels.testimonial }}</p>
        <blockquote>“{{ projectTestimonial.review }}”</blockquote>
        <div class="case-quote__person">
          <NuxtImg
            :src="projectTestimonial.avatar"
            :alt="projectTestimonial.name"
            class="h-11 w-11 rounded-full object-cover"
          />
          <p>
            <strong>{{ projectTestimonial.name }}</strong>
            <span>{{ projectTestimonial.job }}</span>
          </p>
        </div>
      </section>

      <section class="case-contact case-shell">
        <p>{{ currentLocale === 'fr' ? 'Un projet en tête ?' : 'Have a project in mind?' }}</p>
        <NuxtLink :to="contactLink" class="site-cta">
          {{ labels.bookCall }}
          <UIcon name="i-lucide-arrow-up-right" class="h-5 w-5" />
        </NuxtLink>
      </section>

      <section class="case-more">
        <div class="case-shell case-more__heading">
          <h2>{{ labels.moreProjects }}</h2>
          <NuxtLink :to="backToProjectsLink">{{ labels.allProjects }}</NuxtLink>
        </div>

        <div class="case-shell case-more__grid">
          <NuxtLink
            v-for="relatedProject in moreProjects"
            :key="relatedProject.slug"
            :to="relatedProject.link"
            class="case-project-card"
          >
            <div class="case-project-card__media">
              <NuxtImg
                :src="relatedProject.image"
                :alt="relatedProject.title"
                class="case-project-card__image"
                loading="lazy"
              />
            </div>
            <div class="case-project-card__meta">
              <div>
                <p>{{ relatedProject.industry }}</p>
                <h3>{{ relatedProject.title }}</h3>
              </div>
              <span>
                {{ labels.viewProject }}
                <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" />
              </span>
            </div>
          </NuxtLink>
        </div>
      </section>
    </article>

    <FooterSection />
    <ScrollToTop />
  </main>
</template>

<style scoped>
.case-study-page {
  min-height: 100vh;
  overflow: clip;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.case-shell {
  width: min(100% - 40px, 1240px);
  margin-inline: auto;
}

.case-hero {
  position: relative;
  width: calc(100% - 48px);
  min-height: max(650px, calc(100svh - 48px));
  margin: 24px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--bg-soft);
  color: white;
  box-shadow: var(--shadow-soft);
}

.case-hero__image,
.case-hero__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.case-hero__image {
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.case-hero:hover .case-hero__image {
  transform: scale(1.018);
}

.case-hero__veil {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 34%),
    linear-gradient(0deg, rgba(23, 22, 18, 0.68) 0%, transparent 45%),
    linear-gradient(120deg, rgba(166, 111, 24, 0.12), transparent 46%);
}

.case-hero__back,
.case-hero__website {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-family: Inter, sans-serif;
  font-size: 13px;
  text-decoration: none;
}

.case-hero__back {
  top: 26px;
  left: clamp(20px, 3vw, 48px);
}

.case-hero__website {
  right: clamp(20px, 3vw, 48px);
  bottom: clamp(104px, 9vw, 132px);
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
}

.case-hero__caption {
  position: absolute;
  z-index: 2;
  left: clamp(20px, 3vw, 48px);
  right: clamp(20px, 3vw, 48px);
  bottom: clamp(104px, 9vw, 132px);
}

.case-kicker,
.case-section-label {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.case-kicker {
  margin-bottom: 9px;
  color: #f7d99e;
}

.case-hero__title {
  max-width: 12ch;
  margin: 0;
  color: transparent;
  background: var(--gold-gradient-on-dark);
  background-clip: text;
  -webkit-background-clip: text;
  font-family: 'Host Grotesk', sans-serif;
  font-size: clamp(52px, 8.4vw, 124px);
  font-weight: 500;
  line-height: 0.86;
  letter-spacing: -0.055em;
  text-wrap: balance;
  -webkit-text-fill-color: transparent;
}

.case-intro {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(290px, 0.85fr);
  gap: clamp(64px, 10vw, 150px);
  padding-block: clamp(88px, 11vw, 160px);
}

.case-section-label {
  color: var(--color-gold-readable);
}

.case-intro__story {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 32px;
}

.case-intro__copy {
  max-width: 670px;
}

.case-intro__copy p,
.case-strategy__lead {
  margin: 0;
  font-family: 'Host Grotesk', sans-serif;
  font-size: clamp(21px, 2vw, 30px);
  font-weight: 400;
  line-height: 1.22;
  letter-spacing: -0.025em;
}

.case-intro__copy p + p {
  margin-top: 1.15em;
}

.case-facts {
  display: grid;
  align-content: start;
  gap: 0;
  margin: 0;
  border-top: 1px solid var(--border-subtle);
}

.case-facts > div {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 24px;
  padding-block: 18px;
  border-bottom: 1px solid var(--border-subtle);
}

.case-facts dt,
.case-facts dd {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 1.4;
}

.case-facts dt {
  color: var(--text-secondary);
}

.case-strategy {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(48px, 9vw, 130px);
  padding-bottom: clamp(88px, 11vw, 150px);
}

.case-strategy article {
  padding-top: 18px;
  border-top: 1px solid var(--border-subtle);
}

.case-editorial-list {
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
}

.case-editorial-list li {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 16px;
  padding-block: 15px;
  border-bottom: 1px solid var(--border-subtle);
  font-family: Inter, sans-serif;
  font-size: 15px;
  line-height: 1.5;
}

.case-editorial-list li::before {
  content: '↳';
  color: var(--color-gold-readable);
}

.case-strategy__lead {
  margin-top: 32px;
}

.case-gallery {
  display: grid;
  gap: clamp(12px, 1.5vw, 22px);
}

.case-gallery__row {
  display: grid;
  gap: clamp(12px, 1.5vw, 22px);
}

.case-gallery__row--split {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.case-media {
  display: grid;
  place-items: center;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--bg-soft);
  box-shadow: var(--shadow-soft);
}

.case-gallery__row--wide .case-media {
  aspect-ratio: 16 / 9.7;
}

.case-gallery__row--split .case-media {
  aspect-ratio: 9 / 16;
}

.case-media__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
}

.case-media:hover .case-media__image {
  transform: scale(1.012);
}

.case-execution {
  display: grid;
  grid-template-columns: minmax(250px, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(48px, 10vw, 150px);
  padding-block: clamp(100px, 12vw, 170px);
}

.case-execution__heading h2,
.case-more__heading h2 {
  margin: 22px 0 0;
  color: var(--text-primary);
  background: none;
  font-family: 'Host Grotesk', sans-serif;
  font-size: clamp(42px, 5vw, 72px);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.05em;
  -webkit-text-fill-color: var(--text-primary);
}

.case-actions {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--border-subtle);
}

.case-actions li {
  display: grid;
  grid-template-columns: 48px minmax(150px, 0.7fr) minmax(0, 1fr);
  gap: 24px;
  padding-block: 24px;
  border-bottom: 1px solid var(--border-subtle);
}

.case-actions span,
.case-actions h3,
.case-actions p {
  margin: 0;
  font-family: Inter, sans-serif;
}

.case-actions span {
  color: var(--color-gold-readable);
  font-size: 12px;
}

.case-actions h3 {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
}

.case-actions p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.case-quote {
  padding-block: clamp(70px, 9vw, 120px);
  border-top: 1px solid var(--border-subtle);
}

.case-quote blockquote {
  max-width: 950px;
  margin: 42px 0 38px;
  font-family: 'Host Grotesk', sans-serif;
  font-size: clamp(32px, 4.6vw, 66px);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.case-quote__person {
  display: flex;
  align-items: center;
  gap: 14px;
}

.case-quote__person p {
  display: grid;
  gap: 2px;
  margin: 0;
  font-size: 13px;
}

.case-quote__person span {
  color: var(--text-secondary);
}

.case-contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-block: 36px;
  border-top: 1px solid var(--border-subtle);
}

.case-contact p {
  margin: 0;
  font-size: 14px;
}

.case-contact a,
.case-more__heading a {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--color-gold-deep);
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.case-contact a {
  justify-content: center;
  border: 1px solid var(--color-gold-readable);
  border-radius: 12px;
  background: var(--gold-cta-gradient);
  color: #171612;
}

.case-more {
  padding-block: clamp(88px, 11vw, 150px);
  border-top: 1px solid var(--border-subtle);
  background:
    radial-gradient(circle at 12% 16%, rgba(240, 191, 108, 0.16), transparent 28%),
    var(--bg-soft);
  color: var(--text-primary);
}

.case-more__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}

.case-more__heading h2 {
  margin: 0;
  color: var(--text-primary);
  -webkit-text-fill-color: var(--text-primary);
}

.case-more__heading a {
  color: var(--color-gold-deep);
}

.case-more__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(18px, 2vw, 30px);
  margin-top: clamp(48px, 6vw, 80px);
}

.case-project-card {
  display: block;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--bg-card);
  color: var(--text-primary);
  text-decoration: none;
  box-shadow: var(--shadow-soft);
}

.case-project-card__media {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--bg-soft);
}

.case-project-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
}

.case-project-card:hover .case-project-card__image {
  transform: scale(1.035);
}

.case-project-card__meta {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
}

.case-project-card__meta p,
.case-project-card__meta h3 {
  margin: 0;
}

.case-project-card__meta p {
  color: var(--color-gold-readable);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.case-project-card__meta h3 {
  margin-top: 6px;
  font-family: 'Host Grotesk', sans-serif;
  font-size: clamp(22px, 2vw, 30px);
  font-weight: 500;
  letter-spacing: -0.03em;
}

.case-project-card__meta > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  color: var(--text-secondary);
  font-family: Inter, sans-serif;
  font-size: 12px;
}

@media (max-width: 900px) {
  .case-intro,
  .case-strategy,
  .case-execution {
    grid-template-columns: 1fr;
  }

  .case-intro {
    gap: 64px;
  }

  .case-execution {
    gap: 52px;
  }

  .case-more__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .case-project-card:last-child {
    display: none;
  }
}

@media (max-width: 640px) {
  .case-shell {
    width: min(100% - 24px, 1240px);
  }

  .case-hero {
    width: calc(100% - 24px);
    min-height: calc(100svh - 24px);
    margin: 12px;
    border-radius: 14px;
  }

  .case-hero__back {
    top: 18px;
  }

  .case-hero__back span,
  .case-hero__website {
    font-size: 11px;
  }

  .case-hero__caption {
    bottom: 132px;
  }

  .case-hero__website {
    left: 20px;
    right: auto;
    bottom: 86px;
  }

  .case-intro__story {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .case-gallery__row--split {
    grid-template-columns: 1fr;
  }

  .case-gallery__row--split .case-media {
    aspect-ratio: 9 / 16;
  }

  .case-actions li {
    grid-template-columns: 34px 1fr;
    gap: 14px;
  }

  .case-actions p {
    grid-column: 2;
  }

  .case-contact,
  .case-more__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .case-more__grid {
    grid-template-columns: 1fr;
  }

  .case-project-card:last-child {
    display: block;
  }

  .case-project-card__meta > span {
    font-size: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .case-hero__image,
  .case-media__image,
  .case-project-card__image {
    transition: none;
  }
}
</style>
