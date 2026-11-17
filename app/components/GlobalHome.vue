<script setup lang="ts">
import { findProjectBySlug } from '~/data/projects'
import { findCaseStudyBySlug } from '~/data/caseStudies'
import { expertises } from '~/data/expertises'

const props = defineProps<{ city?: string }>()
const localePath = useLocalePath()

const expertiseSummaries = [
  'Vos équipes retrouvent leurs données, leurs rendez-vous et leurs décisions au même endroit. CRM, portails et outils internes conçus autour de leur façon de travailler.',
  'Donnez une forme testable à votre idée, puis un socle solide au produit. Nous concevons et développons des MVP, plateformes et applications SaaS.',
  'Confiez une tâche précise à l’IA, avec des critères pour juger la qualité du résultat. Assistants, traitement de documents et automatisation de vos flux.',
]

const phases = [
  { title: 'Découverte', text: 'Nous observons les usages, les outils en place et les points où votre équipe ou vos clients perdent du temps.' },
  { title: 'Stratégie', text: 'Nous choisissons le premier périmètre, les critères de réussite et les étapes de livraison.' },
  { title: 'Design', text: 'Nous donnons forme aux parcours prioritaires dans un prototype que vous pouvez tester.' },
  { title: 'Développement', text: 'Nous construisons par étapes, avec des versions à essayer et des décisions techniques que nous vous expliquons.' },
  { title: 'Lancement', text: 'Nous vérifions les parcours, préparons la mise en ligne et documentons la prise en main.' },
  { title: 'Évolution', text: 'Les retours d’usage guident les prochaines versions et les intégrations à développer.' },
]

const posts = [
  {
    title: 'Premier projet avec une créatrice de contenu',
    context: 'Retour sur une collaboration entre produit et communauté.',
    network: 'LinkedIn',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7464933521166585856/',
  },
  {
    title: 'Remise des diplômes',
    context: 'Une étape dans mon parcours d’ingénierie web.',
    network: 'LinkedIn',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7467107715304022016/',
  },
  {
    title: 'Mon parcours scolaire',
    context: 'Le chemin qui m’a conduit au développement logiciel.',
    network: 'X',
    href: 'https://x.com/MohameDevWeb/status/1975230337425805704',
  },
]

const client = findProjectBySlug('ra-energy')!
const clientQuote = findCaseStudyBySlug(client.slug)!.fr.testimonialHighlight
const productSteps = [
  { image: '/img/studio/personal-1280.webp', small: '/img/studio/personal-640.webp', width: 1280, height: 729, alt: 'Page d’accueil du produit Personal', title: 'Trouver ce qui mérite d’être raconté', text: 'Personal rapproche des formats qui ont fait leurs preuves des expériences que le créateur souhaite partager.' },
  { image: '/img/project/personal/feed.webp', width: 3024, height: 1724, alt: 'Interface du fil de contenus de Personal', title: 'Affiner une idée avec l’IA', text: 'Le créateur choisit une piste et l’enrichit de son vécu. Personal l’aide à en faire un brouillon fidèle à sa voix.' },
  { image: '/img/project/personal/closing.webp', width: 3024, height: 1726, alt: 'Écran de présentation de Personal', title: 'Garder la main jusqu’à la publication', text: 'Le texte reste un brouillon que le créateur peut relire, modifier et décider de publier.' },
]
const activeProductStep = ref(0)
const hasProductObserver = ref(false)
const productRoot = ref<HTMLElement>()
let productObserver: IntersectionObserver | undefined

onMounted(() => {
  if (!productRoot.value || !('IntersectionObserver' in window) || !window.matchMedia('(min-width: 781px) and (prefers-reduced-motion: no-preference)').matches) return
  productObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) activeProductStep.value = Number((entry.target as HTMLElement).dataset.step)
    }
  }, { rootMargin: '-36% 0px -40% 0px' })

  hasProductObserver.value = true
  productRoot.value.querySelectorAll('[data-step]').forEach(step => productObserver?.observe(step))
})
onBeforeUnmount(() => productObserver?.disconnect())

const title = computed(() => props.city
  ? `Développement d’applications sur mesure à ${props.city} | MC Studio`
  : 'MC Studio — Studio d’applications sur mesure')
const description = computed(() => `MC Studio conçoit des applications sur mesure, des outils métier aux plateformes clients pour les entreprises et les fondateurs${props.city ? ` à ${props.city}` : ''}.`)
useStudioSeo(title, description)
useHead({
  htmlAttrs: { lang: 'fr' },
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Organization', name: 'MC Studio', url: 'https://www.mc-studio.eu/',
      logo: 'https://www.mc-studio.eu/img/logo/mc-studio.svg',
      founder: { '@type': 'Person', name: 'Mohamed Chettah', url: 'https://mohamedchettah.fr/', sameAs: ['https://www.linkedin.com/in/mohamed-chettah/'] },
    }),
  }],
})
</script>

<template>
  <div class="flagship">
    <a class="flagship__skip" href="#contenu">Aller au contenu</a>
    <StudioNavbar tone="light" />
    <main id="contenu" tabindex="-1">
      <StudioExhibition :city="city" />

      <section class="flagship__section flagship-expertise" aria-labelledby="expertise-title">
        <div class="flagship__shell flagship-expertise__layout">
          <header class="flagship-expertise__intro">
            <p class="flagship__kicker">Expertises</p>
            <h2 id="expertise-title">Que doit faire votre application ?</h2>
            <p>Stratégie produit, design et ingénierie, du problème à résoudre jusqu’à la mise en production.</p>
            <NuxtLink class="flagship__text-link" :to="localePath('/expertises')">Explorer les expertises <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
          </header>
          <div class="flagship-expertise__rows">
            <NuxtLink v-for="(item, index) in expertises" :key="item.slug" :to="localePath(`/expertises/${item.slug}`)" class="flagship-expertise__row">
              <h3>{{ item.title }}</h3>
              <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" />
              <p>{{ expertiseSummaries[index] }}</p>
            </NuxtLink>
          </div>
        </div>
      </section>

      <section ref="productRoot" class="flagship__section flagship__shell flagship-product" aria-labelledby="personal-title">
        <header class="flagship-product__intro">
          <div>
            <p class="flagship__kicker">Produit du studio</p>
            <h2 id="personal-title">Personal</h2>
          </div>
          <div>
            <p>Notre SaaS IA aide les créateurs à écrire à partir de leur propre vécu. Nous l’avons conçu du premier prototype à l’intégration des modèles.</p>
            <a class="flagship__text-link" href="https://usepersonal.app/" target="_blank" rel="noopener noreferrer">Découvrir Personal <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></a>
          </div>
        </header>
        <div class="flagship-product__journey" :class="{ 'is-enhanced': hasProductObserver }">
          <figure class="flagship-product__stage">
            <div class="flagship-product__frame">
              <div class="flagship-product__screens">
                <img v-for="(step, index) in productSteps" :key="step.image"
                  :src="step.image"
                  :srcset="step.small ? `${step.small} 640w, ${step.image} 1280w` : undefined"
                  sizes="(max-width: 1440px) 58vw, 780px"
                  :width="step.width" :height="step.height" :alt="step.alt" loading="lazy" decoding="async"
                  :aria-hidden="activeProductStep !== index"
                  :class="{ 'is-current': activeProductStep === index }">
              </div>
            </div>
            <figcaption>Personal <span>usepersonal.app</span></figcaption>
          </figure>
          <ol class="flagship-product__steps">
            <li v-for="(step, index) in productSteps" :key="step.image" :data-step="index" :class="{ 'is-current': activeProductStep === index }">
              <h3>{{ step.title }}</h3>
              <p>{{ step.text }}</p>
              <img
                class="flagship-product__mobile"
                :src="step.small ?? step.image"
                :width="step.width" :height="step.height" :alt="step.alt"
                loading="lazy" decoding="async"
              >
            </li>
          </ol>
        </div>
        <div class="flagship__actions">
          <NuxtLink class="flagship__text-link" :to="localePath('/projects/personal')">Lire le dossier de conception <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
        </div>
      </section>

      <section class="flagship-founder" aria-labelledby="founder-title">
        <div class="flagship__shell flagship-founder__layout">
          <figure class="flagship-founder__portrait">
            <img
              src="/img/studio/founder-640.webp"
              srcset="/img/studio/founder-640.webp 640w, /img/studio/founder-1280.webp 1280w"
              sizes="(max-width: 720px) calc(100vw - 40px), 42vw"
              alt="Portrait de Mohamed Chettah" width="1280" height="1125" loading="lazy" decoding="async"
            >
            <figcaption>Fondateur de MC Studio · Depuis 2024</figcaption>
          </figure>
          <div class="flagship-founder__copy">
            <p class="flagship__kicker">Le fondateur</p>
            <h2 id="founder-title">Mohamed<br>Chettah</h2>
            <p class="flagship-founder__statement">Je conçois, je développe et je lance mes propres produits.</p>
            <p>J’ai fondé MC Studio pour relier les décisions d’un entrepreneur au travail de celles et ceux qui construisent le produit. Sur Personal, je fais les mêmes arbitrages qu’avec mes clients. Que faut-il livrer d’abord ? Que comprend l’utilisateur ? Que faudra-t-il maintenir dans six mois ?</p>
            <p>Vous échangez directement avec moi, du premier cadrage aux décisions de design et d’architecture.</p>
            <div class="flagship__actions">
              <NuxtLink class="flagship__text-link" :to="localePath('/a-propos')">Le studio <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
              <a class="flagship__text-link" href="https://mohamedchettah.fr/" target="_blank" rel="noopener noreferrer">Site personnel <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></a>
              <a class="flagship__text-link" href="https://www.linkedin.com/in/mohamed-chettah/" target="_blank" rel="noopener noreferrer">LinkedIn <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      </section>

      <section class="flagship__section flagship__shell flagship-method" aria-labelledby="process-title">
        <div class="flagship-method__layout">
          <header>
            <p class="flagship__kicker">Notre méthode</p>
            <h2 id="process-title">Du premier échange aux premiers usages.</h2>
            <p>À chaque étape, vous savez ce que nous construisons, ce qui reste à décider et ce que vous pouvez déjà essayer.</p>
          </header>
          <ol class="flagship-process">
            <li v-for="phase in phases" :key="phase.title">
              <h3>{{ phase.title }}</h3>
              <p>{{ phase.text }}</p>
            </li>
          </ol>
        </div>
        <figure v-if="clientQuote" class="flagship-quote">
          <blockquote>« {{ clientQuote }} »</blockquote>
          <figcaption>
            <img v-if="client.testimonial" :src="client.testimonial.avatar" alt="" width="48" height="48" loading="lazy">
            <span><strong>{{ client.testimonial?.name }}</strong><br>Cofondateur de R&amp;A Energy</span>
            <NuxtLink :to="localePath('/projects/ra-energy')">Sur la création du site R&amp;A Energy <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
          </figcaption>
        </figure>
      </section>

      <section class="flagship__section flagship__shell flagship-notes" aria-labelledby="notes-title">
        <header>
          <h2 id="notes-title">Dans les coulisses</h2>
          <p>Mohamed raconte ses projets et le parcours qui a donné naissance au studio.</p>
        </header>
        <ul>
          <li v-for="post in posts" :key="post.href">
            <a :href="post.href" target="_blank" rel="noopener noreferrer">
              <div>
                <h3>{{ post.title }}</h3>
                <p>{{ post.context }}</p>
              </div>
              <span class="flagship-notes__source">{{ post.network }} <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></span>
            </a>
          </li>
        </ul>
      </section>

      <section class="flagship-closing" aria-labelledby="closing-title">
        <div class="flagship__shell">
          <h2 id="closing-title">Quelle application vous manque ?</h2>
          <div>
            <p>Parlez-nous du produit que vous voulez lancer ou du travail que vous aimeriez simplifier. Nous commencerons par comprendre le besoin.</p>
            <NuxtLink class="flagship__button" :to="localePath('/contact')">Parlons de votre projet <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
          </div>
        </div>
      </section>
    </main>
    <FooterSection />
  </div>
</template>

<style scoped src="../assets/css/flagship.css"></style>
<style src="../assets/css/studio-editorial.css"></style>
