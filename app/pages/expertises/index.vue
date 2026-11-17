<script setup lang="ts">
import { useStudioSeo } from '~/composables/useStudioSeo'
import { expertises } from '~/data/expertises'
import '~/assets/css/studio-pages.css'
const localePath = useLocalePath()
useStudioSeo(
  'Conception d’applications sur mesure | MC Studio',
  'Trois expertises pour construire votre logiciel : applications métier sur mesure, SaaS et intégrations IA. Du cadrage au lancement avec MC Studio.',
)
</script>

<template>
  <div class="studio-page">
    <StudioNavbar tone="dark" />
    <main class="studio-page__wrap">
      <header class="studio-page__hero">
        <p class="studio-page__eyebrow">Nos expertises</p>
        <h1>Une application conçue<br />pour vos usages.</h1>
        <p class="studio-page__lead">
          Un outil pour vos équipes, un SaaS à lancer, une application qui
          intègre l’IA : nous réunissons stratégie, design produit et
          développement autour d’un usage précis.
        </p>
        <NuxtLink class="studio-page__button" :to="localePath('/contact')"
          >Parlons de votre projet <span aria-hidden="true">↗</span></NuxtLink
        >
      </header>
      <section
        class="studio-page__section"
        aria-label="Nos trois domaines d’intervention"
      >
        <article
          v-for="item in expertises"
          :key="item.slug"
          class="studio-page__row"
        >
          <span class="studio-page__number">{{ item.number }}</span>
          <div>
            <h2>{{ item.title }}</h2>
            <NuxtLink
              class="studio-page__text-link"
              :aria-label="`Explorer l’expertise ${item.title}`"
              :to="localePath(`/expertises/${item.slug}`)"
              >Explorer cette expertise
              <span aria-hidden="true">↗</span></NuxtLink
            >
          </div>
          <p>{{ item.intro }}</p>
        </article>
      </section>
      <section class="studio-page__section studio-page__split">
        <h2>Le point de départ,<br />c’est votre réalité.</h2>
        <div class="studio-page__body">
          <p>
            Vous connaissez vos utilisateurs, vos contraintes et votre marché.
            Nous apportons le regard produit et les choix techniques pour
            construire une solution que vous pourrez réellement utiliser.
          </p>
          <p>
            Avant de proposer une stack ou un calendrier, nous clarifions le
            problème, les intégrations nécessaires et le périmètre de la
            première livraison.
          </p>
        </div>
      </section>
      <section class="studio-page__closing">
        <p class="studio-page__eyebrow">Construisons la suite</p>
        <h2>
          Vous avez un problème à résoudre.<br />Commençons par en parler.
        </h2>
        <NuxtLink class="studio-page__button" :to="localePath('/contact')"
          >Parlons de votre projet <span aria-hidden="true">↗</span></NuxtLink
        >
      </section>
    </main>
    <FooterSection />
  </div>
</template>
