<script setup lang="ts">
import { findProjectBySlug } from '~/data/projects'
import { findCaseStudyBySlug } from '~/data/caseStudies'
import { expertises } from '~/data/expertises'

const props = defineProps<{ city?: string }>()
const localePath = useLocalePath()

const work = [
  {
    slug: 'crm-ra-energy', name: 'CRM R&A Energy', image: 'crm-ra', width: 1254, height: 1254,
    category: 'Application métier', alt: 'Tableau de bord du CRM R&A Energy sur écran',
    headline: 'Du tableur au terrain.',
    text: 'Un CRM qui réunit prospects, planning et tournées, et vérifie les rendez-vous en tenant compte des temps de trajet.',
  },
  {
    slug: 'maison-awl', name: 'Maison AWL', image: 'maison-awl', width: 1280, height: 960,
    category: 'Marketplace', alt: 'Place de marché Maison AWL sur un ordinateur de bureau',
    headline: 'De la recherche au paiement.',
    text: 'Une place de marché où les particuliers trouvent un prestataire, échangent avec lui et règlent leur mission.',
  },
]

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
  ? `Développement logiciel sur mesure à ${props.city} | MC Studio`
  : 'MC Studio — Développement logiciel sur mesure, SaaS et IA')
const description = computed(() => `MC Studio conçoit et développe des applications métier, des SaaS et des solutions IA pour les entreprises et les fondateurs${props.city ? ` à ${props.city}` : ''}.`)
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
    <StudioNavbar />
    <main id="contenu" tabindex="-1">
      <section class="flagship-hero" aria-labelledby="studio-title">
        <img
          class="flagship-hero__image"
          src="/img/studio/clouds-1280.webp"
          srcset="/img/studio/clouds-640.webp 640w, /img/studio/clouds-1280.webp 1280w"
          sizes="100vw"
          width="1280"
          height="549"
          fetchpriority="high"
          alt=""
        >
        <div class="flagship__shell flagship-hero__inner">
          <div class="flagship-hero__content">
            <p class="flagship__kicker">Studio indépendant de développement logiciel<span v-if="city"> à {{ city }}</span></p>
            <h1 id="studio-title">Le logiciel,<br><em>à votre mesure.</em></h1>
            <p class="flagship-hero__lead">Nous concevons et développons des applications métier, des SaaS et des solutions IA pour les entreprises et les fondateurs qui veulent franchir un cap.</p>
            <div class="flagship__actions">
              <NuxtLink class="flagship__button" :to="localePath('/contact')">Parlons de votre projet <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
              <a class="flagship__text-link" href="#realisations">Voir les réalisations <UIcon name="i-tabler-arrow-down" aria-hidden="true" /></a>
            </div>
          </div>
          <div class="flagship-hero__rail">
            <span>Stratégie produit</span><span>Design</span><span>Ingénierie</span>
          </div>
        </div>
      </section>

      <section id="realisations" class="flagship__section flagship__shell" aria-labelledby="work-title">
        <header class="flagship__section-head">
          <div>
            <p class="flagship__kicker">Réalisations</p>
            <h2 id="work-title">Deux métiers.<br>Deux logiciels.</h2>
          </div>
          <p>Un outil commercial pour des équipes de terrain. Une place de marché pour une communauté. Deux façons de partir des usages pour concevoir le bon produit.</p>
        </header>
        <div class="flagship-work">
          <article v-for="item in work" :key="item.slug" class="flagship-work__item">
            <NuxtLink :to="localePath(`/projects/${item.slug}`)" class="flagship-work__link">
              <div class="flagship-work__media">
                <img :src="`/img/studio/${item.image}-1280.webp`"
                  :srcset="`/img/studio/${item.image}-640.webp 640w, /img/studio/${item.image}-1280.webp ${item.width}w`"
                  sizes="(max-width: 720px) calc(100vw - 40px), (max-width: 1440px) 50vw, 700px"
                  :alt="item.alt" :width="item.width" :height="item.height" loading="lazy" decoding="async">
                <span class="flagship-work__arrow"><UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></span>
              </div>
              <div class="flagship-work__caption">
                <p>{{ item.name }} <span>·</span> {{ item.category }}</p>
                <h3>{{ item.headline }}</h3>
              </div>
            </NuxtLink>
            <p class="flagship-work__description">{{ item.text }}</p>
          </article>
        </div>
        <div class="flagship__actions flagship__work-actions">
          <NuxtLink class="flagship__text-link" :to="localePath('/projects')">Toutes les réalisations <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
        </div>
      </section>

      <section class="flagship__section flagship-expertise" aria-labelledby="expertise-title">
        <div class="flagship__shell">
          <header class="flagship__section-head">
            <div>
              <p class="flagship__kicker">Expertises</p>
              <h2 id="expertise-title">Qu’est-ce que votre logiciel doit accomplir ?</h2>
            </div>
            <p>Nous réunissons la stratégie produit, le design et l’ingénierie pour passer d’un problème bien posé à une application en production.</p>
          </header>
          <div class="flagship-expertise__rows">
            <NuxtLink v-for="(item, index) in expertises" :key="item.slug" :to="localePath(`/expertises/${item.slug}`)" class="flagship-expertise__row">
              <h3>{{ item.title }}</h3>
              <p>{{ expertiseSummaries[index] }}</p>
              <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <section ref="productRoot" class="flagship__section flagship__shell flagship-product" aria-labelledby="personal-title">
        <header class="flagship__section-head">
          <div>
            <p class="flagship__kicker">Un produit du studio</p>
            <h2 id="personal-title">Personal<span>.</span></h2>
          </div>
          <p>Notre SaaS IA aide les créateurs à passer d’une idée à un contenu qui leur ressemble. Nous l’avons conçu de bout en bout, du cadrage du MVP à l’intégration des modèles et aux itérations d’interface.</p>
        </header>
        <div class="flagship-product__journey" :class="{ 'is-enhanced': hasProductObserver }">
          <div class="flagship-product__stage" aria-hidden="true">
            <div class="flagship-product__frame">
              <div class="flagship-product__bar"><span /><span /><span /> <span>usepersonal.app</span></div>
              <div class="flagship-product__screens">
                <img v-for="(step, index) in productSteps" :key="step.image"
                  :src="step.image"
                  :srcset="step.small ? `${step.small} 640w, ${step.image} 1280w` : undefined"
                  sizes="(max-width: 1440px) 58vw, 780px"
                  :width="step.width" :height="step.height" alt="" loading="lazy" decoding="async"
                  :class="{ 'is-current': activeProductStep === index }">
              </div>
            </div>
          </div>
          <ol class="flagship-product__steps">
            <li v-for="(step, index) in productSteps" :key="step.image" :data-step="index" :class="{ 'is-current': activeProductStep === index }">
              <p class="flagship__kicker">0{{ index + 1 }}</p>
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
          <a class="flagship__text-link" href="https://usepersonal.app/" target="_blank" rel="noopener noreferrer">Découvrir Personal <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></a>
          <NuxtLink class="flagship__text-link" :to="localePath('/projects/personal')">Les choix de conception <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" /></NuxtLink>
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
            <p class="flagship__kicker">Derrière le studio</p>
            <h2 id="founder-title">Mohamed Chettah</h2>
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

      <section class="flagship__section flagship__shell" aria-labelledby="process-title">
        <header class="flagship__section-head">
          <div>
            <p class="flagship__kicker">Notre méthode</p>
            <h2 id="process-title">Du premier échange aux premiers usages.</h2>
          </div>
          <p>À chaque étape, vous savez ce que nous construisons, ce qui reste à décider et ce que vous pouvez déjà essayer.</p>
        </header>
        <ol class="flagship-process">
          <li v-for="(phase, index) in phases" :key="phase.title">
            <span class="flagship__kicker" aria-hidden="true">0{{ index + 1 }}</span>
            <h3>{{ phase.title }}</h3>
            <p>{{ phase.text }}</p>
          </li>
        </ol>
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
        <header class="flagship__section-head">
          <div>
            <p class="flagship__kicker">Publications de Mohamed</p>
            <h2 id="notes-title">Dans les coulisses.</h2>
          </div>
          <p>Des projets racontés de l’intérieur et des étapes du parcours qui a donné naissance à MC Studio.</p>
        </header>
        <ul>
          <li v-for="post in posts" :key="post.href">
            <a :href="post.href" target="_blank" rel="noopener noreferrer">
              <p class="flagship__kicker">{{ post.network }}</p>
              <h3>{{ post.title }}</h3>
              <p>{{ post.context }}</p>
              <UIcon name="i-tabler-arrow-up-right" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>

      <section class="flagship-closing" aria-labelledby="closing-title">
        <div class="flagship__shell">
          <h2 id="closing-title">Quel logiciel vous ferait avancer ?</h2>
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
