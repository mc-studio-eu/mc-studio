<script setup lang="ts">
import { findProjectBySlug, projects } from '~/data/projects'
import { findCaseStudyBySlug } from '~/data/caseStudies'

const route = useRoute()
const localePath = useLocalePath()
const { locale, t } = useI18n()
const lang = computed(() => locale.value === 'en' ? 'en' : 'fr')

const labels = computed(() => lang.value === 'fr' ? {
  back: 'Toutes les réalisations', client: 'Client', challenge: 'L’enjeu', solution: 'Le produit',
  result: 'Résultat', gallery: 'Le projet en images', screen: 'Écran', quote: 'Retour client',
  more: 'À découvrir aussi', visit: 'Voir le site', contact: 'Parlons de votre projet',
  closing: 'Vous avez un produit à construire ?', own: 'Produit du studio',
} : {
  back: 'All work', client: 'Client', challenge: 'The challenge', solution: 'The product',
  result: 'Outcome', gallery: 'A closer look', screen: 'Screen', quote: 'Client feedback',
  more: 'More work', visit: 'Visit website', contact: 'Let’s talk about your project',
  closing: 'Have a product to build?', own: 'Studio product',
})

const slug = computed(() => String(route.params.slug ?? ''))
const project = computed(() => findProjectBySlug(slug.value))
const caseData = computed(() => findCaseStudyBySlug(slug.value))

if (!project.value || !caseData.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

const current = computed(() => project.value!)
const study = computed(() => caseData.value![lang.value])
const isStudioProduct = computed(() => ['personal', 'arises'].includes(current.value.slug))
const optimizedCovers: Record<string, { basename: string; width: number; height: number } | undefined> = {
  'crm-ra-energy': { basename: 'crm-ra', width: 1254, height: 1254 },
  'maison-awl': { basename: 'maison-awl', width: 1280, height: 960 },
  personal: { basename: 'personal', width: 1280, height: 729 },
}
const optimizedCover = computed(() => optimizedCovers[current.value.slug])

const details = computed(() => [
  { label: study.value.clientLabel ?? (isStudioProduct.value ? labels.value.own : labels.value.client), text: study.value.client },
  { label: labels.value.challenge, text: study.value.problem },
  { label: labels.value.solution, text: study.value.solution },
  ...(study.value.result ? [{ label: labels.value.result, text: study.value.result }] : []),
])

const images = computed(() => [...new Set([
  ...current.value.screenshots.desktop,
  ...current.value.screenshots.mobile,
])].filter(src => src !== current.value.image))

const testimonial = computed(() => {
  const item = current.value.testimonial
  if (!item) return
  return {
    ...item,
    role: t(`projects.items.${current.value.i18nKey}.testimonial.job`),
    text: study.value.testimonialHighlight ?? t(`projects.items.${current.value.i18nKey}.testimonial.review`),
  }
})

const related = computed(() => {
  const slugs = [study.value.link?.slug, 'crm-ra-energy', 'maison-awl', 'personal', ...projects.map(item => item.slug)]
  return Array.from(new Set(slugs))
    .filter((item): item is string => typeof item === 'string' && item !== current.value.slug)
    .slice(0, 3)
    .map(item => findProjectBySlug(item)!)
})

useStudioSeo(() => `${current.value.title} | MC Studio`, () => study.value.headline)
useHead(() => ({ htmlAttrs: { lang: lang.value } }))
useSeoMeta({ ogImage: () => `https://www.mc-studio.eu${optimizedCover.value ? `/img/studio/${optimizedCover.value.basename}-1280.webp` : current.value.image}` })
</script>

<template>
  <div class="studio-page project-case">
    <StudioNavbar />
    <main>
      <article>
        <header class="studio-page__hero">
          <div class="studio-page__wrap">
            <NuxtLink class="project-case__back" :to="localePath('/projects')">
              <UIcon name="i-tabler-arrow-left" aria-hidden="true" /> {{ labels.back }}
            </NuxtLink>
            <p class="studio-page__eyebrow">{{ isStudioProduct ? labels.own : current.categories.map(category => t(`projects.filters.${category.replace('-', '_')}`)).join(' · ') }}</p>
            <h1>{{ current.title }}</h1>
            <p class="studio-page__lead">{{ study.headline }}</p>
            <a v-if="current.slug !== 'crm-ra-energy'" class="studio-page__text-link" :href="current.externalLink" target="_blank" rel="noopener noreferrer">
              {{ labels.visit }} <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" />
            </a>
          </div>
        </header>

        <figure class="studio-page__wrap project-case__cover" :class="`project-case__cover--${current.slug}`">
          <img
            v-if="optimizedCover"
            :src="`/img/studio/${optimizedCover.basename}-1280.webp`"
            :srcset="`/img/studio/${optimizedCover.basename}-640.webp 640w, /img/studio/${optimizedCover.basename}-1280.webp ${optimizedCover.width}w`"
            sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1344px) calc(100vw - 64px), 1280px"
            :width="optimizedCover.width" :height="optimizedCover.height"
            :alt="current.title" fetchpriority="high"
          >
          <NuxtImg
            v-else :src="current.image" :alt="current.title" format="webp"
            sizes="100vw md:95vw xl:1280px" fetchpriority="high"
          />
        </figure>

        <section class="studio-page__section">
          <div class="studio-page__wrap">
            <dl class="project-case__facts">
              <div v-for="item in details" :key="item.label">
                <dt class="studio-page__eyebrow">{{ item.label }}</dt>
                <dd>{{ item.text }}</dd>
              </div>
            </dl>
            <NuxtLink
              v-if="study.link" :to="localePath(`/projects/${study.link.slug}`)"
              class="studio-page__text-link project-case__related-link"
            >
              {{ study.link.label }} <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" />
            </NuxtLink>
          </div>
        </section>

        <section v-if="images.length" class="studio-page__section" aria-labelledby="gallery-title">
          <div class="studio-page__wrap">
            <h2 id="gallery-title">{{ labels.gallery }}</h2>
            <div class="project-case__gallery">
              <figure v-for="(image, index) in images" :key="image">
                <NuxtImg
                  :src="image" :alt="`${current.title} — ${labels.screen} ${index + 1}`" format="webp"
                  sizes="100vw md:48vw xl:635px" loading="lazy" decoding="async"
                />
              </figure>
            </div>
          </div>
        </section>

        <section v-if="testimonial" class="studio-page__section project-case__quote">
          <div class="studio-page__wrap">
            <p class="studio-page__eyebrow">{{ study.testimonialContext ?? labels.quote }}</p>
            <figure>
              <blockquote>« {{ testimonial.text }} »</blockquote>
              <figcaption>
                <img :src="testimonial.avatar" width="48" height="48" alt="" loading="lazy">
                <span><strong>{{ testimonial.name }}</strong><br>{{ testimonial.role }}</span>
              </figcaption>
            </figure>
          </div>
        </section>
        <section v-else-if="study.quote" class="studio-page__section project-case__quote">
          <div class="studio-page__wrap">
            <figure>
              <blockquote>« {{ study.quote }} »</blockquote>
              <figcaption>{{ current.title }}</figcaption>
            </figure>
          </div>
        </section>
      </article>

      <section v-if="related.length" class="studio-page__section" aria-labelledby="related-title">
        <div class="studio-page__wrap">
          <h2 id="related-title">{{ labels.more }}</h2>
          <div class="project-case__more">
            <NuxtLink v-for="item in related" :key="item.slug" :to="localePath(`/projects/${item.slug}`)">
              <NuxtImg :src="item.image" alt="" format="webp" sizes="100vw sm:50vw md:33vw xl:425px" loading="lazy" decoding="async" />
              <span>{{ item.title }} <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <section class="studio-page__closing">
        <div class="studio-page__wrap">
          <h2>{{ labels.closing }}</h2>
          <NuxtLink class="studio-page__button" :to="localePath('/contact')">{{ labels.contact }} <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
        </div>
      </section>
    </main>
    <FooterSection />
  </div>
</template>

<style src="~/assets/css/studio-pages.css"></style>
<style scoped>
.project-case .studio-page__hero { border-bottom: 0; padding: clamp(44px, 7vw, 94px) 0 38px; }
.project-case .studio-page__hero h1 { font-size: clamp(3rem, 8vw, 8.2rem); line-height: .95; overflow-wrap: anywhere; }
.project-case .studio-page__lead { margin-bottom: 14px; }
.project-case__back { display: inline-flex; align-items: center; gap: 9px; min-height: 44px; margin-bottom: 32px; color: var(--editorial-muted); }
.project-case__back:hover { color: var(--editorial-gold); }
.project-case__cover { overflow: hidden; background: #e6dece; }
.project-case__cover img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; object-position: center; }
.project-case__cover--crm-ra-energy img { object-position: center 42%; }
.project-case__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(32px, 5vw, 65px) clamp(22px, 6vw, 80px); }
.project-case__facts > div { padding-top: 22px; border-top: 1px solid var(--editorial-rule); }
.project-case__facts dt { margin-bottom: 14px; }
.project-case__facts dd { margin: 0; color: var(--editorial-ink); font-size: clamp(1.03rem, 1.6vw, 1.32rem); line-height: 1.55; white-space: pre-line; }
.project-case__related-link { margin-top: 30px; }
.project-case__gallery { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(14px, 2vw, 26px); }
.project-case__gallery figure { display: grid; align-items: center; overflow: hidden; background: #e9e0d0; }
.project-case__gallery img { display: block; width: 100%; height: auto; }
.project-case__gallery figure:last-child:nth-child(odd) { grid-column: 1 / -1; }
.project-case__quote { background: #e9e0d0; }
.project-case__quote blockquote { max-width: 960px; font: 400 clamp(2.5rem, 6vw, 6.2rem)/.95 var(--editorial-display); letter-spacing: -.032em; }
.project-case__quote figcaption { display: flex; align-items: center; gap: 14px; margin-top: 25px; color: var(--editorial-muted); font-size: .9rem; }
.project-case__quote figcaption img { border-radius: 50%; object-fit: cover; }
.project-case__more { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(14px, 2vw, 26px); }
.project-case__more a { display: block; overflow: hidden; }
.project-case__more img { display: block; width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; }
.project-case__more a > span { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 14px; }
.project-case__more a:hover { color: var(--editorial-gold); }
@media (max-width: 720px) {
  .project-case__facts, .project-case__gallery { grid-template-columns: minmax(0, 1fr); }
  .project-case__more { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .project-case__cover img { aspect-ratio: 4 / 3; }
}
</style>
