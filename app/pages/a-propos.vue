<script setup lang="ts">
import '~/assets/css/studio-pages.css'
import { useStudioSeo } from '~/composables/useStudioSeo'

const localePath = useLocalePath()
useStudioSeo(
  'Mohamed Chettah, fondateur de MC Studio',
  'Découvrez le parcours de Mohamed Chettah et sa manière de concevoir des applications métier, des SaaS et des produits IA chez MC Studio.',
)
</script>

<template>
  <div class="studio-page">
    <StudioNavbar />
    <main class="studio-page__wrap">
      <header class="studio-page__hero studio-page__split founder-intro">
        <div>
          <p class="studio-page__eyebrow">Le fondateur</p>
          <h1>Mohamed<br />Chettah</h1>
          <p class="studio-page__lead">
            En 2024, pendant ses études en ingénierie du web, Mohamed crée MC
            Studio. Aujourd’hui, il partage son temps entre les logiciels du
            studio et le développement de Personal, son produit pour les
            créateurs.
          </p>
          <a
            class="studio-page__button"
            href="https://www.linkedin.com/in/mohamed-chettah/"
            >Retrouver Mohamed sur LinkedIn ↗</a
          >
        </div>
        <figure>
          <img
          src="/img/studio/founder-1280.webp"
          srcset="
            /img/studio/founder-640.webp   640w,
            /img/studio/founder-1280.webp 1280w
          "
          sizes="(max-width:760px) 100vw, 45vw"
          alt="Portrait de Mohamed Chettah"
          width="1280"
          height="1125"
          />
          <figcaption>Mohamed Chettah · Fondateur de MC Studio</figcaption>
        </figure>
      </header>
      <section class="studio-page__section studio-page__split">
        <h2>Du besoin terrain à la première version.</h2>
        <div class="studio-page__body">
          <p>
            Chez R&amp;A Energy, un créneau libre dans l’agenda ne suffisait pas
            pour fixer un rendez-vous. Il fallait aussi tenir compte du trajet
            du commercial. Cette contrainte est devenue une règle du CRM conçu
            par le studio.
          </p>
          <p>
            Avec Personal, Mohamed travaille sur une autre question concrète :
            comment un créateur peut-il préparer un brouillon avec l’IA tout en
            gardant sa propre voix ? Il expérimente ces choix de produit dans le
            logiciel qu’il développe lui-même.
          </p>
          <NuxtLink
            class="studio-page__text-link"
            :to="localePath('/projects/crm-ra-energy')"
            >Découvrir le CRM de R&amp;A Energy ↗</NuxtLink
          >
        </div>
      </section>
      <section class="studio-page__section studio-page__split">
        <h2>Dans les coulisses du studio.</h2>
        <div class="studio-page__body">
          <p>
            Mohamed documente ses projets et son parcours, du premier travail
            avec une créatrice à la fin de ses études en ingénierie du web.
          </p>
          <ul class="studio-page__list">
            <li>
              <a
                class="studio-page__text-link"
                href="https://www.linkedin.com/feed/update/urn:li:activity:7464933521166585856/"
                >Premier projet avec une créatrice · LinkedIn ↗</a
              >
            </li>
            <li>
              <a
                class="studio-page__text-link"
                href="https://www.linkedin.com/feed/update/urn:li:activity:7467107715304022016/"
                >Remise des diplômes · LinkedIn ↗</a
              >
            </li>
            <li>
              <a
                class="studio-page__text-link"
                href="https://mohamedchettah.fr/"
                >Le site personnel de Mohamed ↗</a
              >
            </li>
          </ul>
        </div>
      </section>
      <section class="studio-page__closing">
        <h2>Que souhaitez-vous construire ?</h2>
        <NuxtLink class="studio-page__button" :to="localePath('/contact')"
          >Parlons de votre projet ↗</NuxtLink
        >
      </section>
    </main>
    <FooterSection />
  </div>
</template>

<style scoped>
.founder-intro {
  align-items: center;
  grid-template-columns: minmax(0, 1fr) minmax(0, .82fr);
}
.founder-intro figure { margin: 0; min-width: 0; }
.founder-intro img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: .92;
  object-fit: cover;
  object-position: 49% 47%;
  filter: grayscale(1) sepia(.12);
}
.founder-intro figcaption {
  padding: 11px 0 0;
  border-top: 1px solid var(--editorial-ink);
  color: var(--editorial-muted);
  font-size: .83rem;
}
@media (max-width: 720px) {
  .founder-intro { grid-template-columns: minmax(0, 1fr); }
  .founder-intro img { aspect-ratio: 1.2; }
}
</style>
