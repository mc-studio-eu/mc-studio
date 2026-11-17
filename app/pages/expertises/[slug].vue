<script setup lang="ts">
import { useStudioSeo } from '~/composables/useStudioSeo'
import { expertises } from '~/data/expertises'
import '~/assets/css/studio-pages.css'
const route = useRoute()
const localePath = useLocalePath()
const expertise = computed(() =>
  expertises.find((item) => item.slug === route.params.slug),
)
if (!expertise.value)
  throw createError({ statusCode: 404, statusMessage: 'Expertise introuvable' })
useStudioSeo(
  () => `${expertise.value?.title} | MC Studio`,
  () => expertise.value?.intro ?? '',
)
</script>

<template>
  <div v-if="expertise" class="studio-page">
    <StudioNavbar tone="dark" />
    <main class="studio-page__wrap">
      <header class="studio-page__hero">
        <NuxtLink class="studio-page__text-link" :to="localePath('/expertises')"
          >← Toutes les expertises</NuxtLink
        >
        <p class="studio-page__context">
          {{ expertise.title }}
        </p>
        <h1>{{ expertise.headline }}</h1>
        <p class="studio-page__lead">{{ expertise.intro }}</p>
        <NuxtLink class="studio-page__button" :to="localePath('/contact')"
          >Parlons de votre projet <span aria-hidden="true">↗</span></NuxtLink
        >
      </header>
      <section class="studio-page__section">
        <p class="studio-page__eyebrow">Les usages</p>
        <h2>{{ expertise.audience }}</h2>
        <article
          v-for="use in expertise.uses"
          :key="use[0]"
          class="studio-page__row"
        >
          <h3>{{ use[0] }}</h3>
          <p>{{ use[1] }}</p>
        </article>
      </section>
      <section class="studio-page__section studio-page__split">
        <div>
          <p class="studio-page__eyebrow">Notre approche</p>
          <h2>Un périmètre clair.<br />Des étapes visibles.</h2>
        </div>
        <div class="studio-page__body">
          <p>{{ expertise.approach }}</p>
          <ul class="studio-page__list">
            <li v-for="item in expertise.delivery" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>
      <section class="studio-page__section studio-page__split">
        <div>
          <p class="studio-page__eyebrow">Un exemple concret</p>
          <h2>{{ expertise.proof }}</h2>
          <p class="studio-page__body">{{ expertise.proofText }}</p>
          <NuxtLink
            class="studio-page__text-link"
            :to="localePath(`/projects/${expertise.proofSlug}`)"
            >Découvrir le projet <span aria-hidden="true">↗</span></NuxtLink
          >
        </div>
        <NuxtLink
          :to="localePath(`/projects/${expertise.proofSlug}`)"
          :aria-label="`Découvrir ${expertise.proof}`"
          ><img
            class="studio-page__proof"
            :src="expertise.image"
            :srcset="`${expertise.image.replace('-1280', '-640')} 640w, ${expertise.image} 1280w`"
            sizes="(max-width: 760px) calc(100vw - 40px), 50vw"
            :alt="`Interface du projet ${expertise.proof}`"
            width="1280"
            height="800"
            loading="lazy"
        /></NuxtLink>
      </section>
      <section class="studio-page__closing">
        <p class="studio-page__eyebrow">Votre prochain projet</p>
        <h2>Un besoin à préciser ?<br />C’est un bon point de départ.</h2>
        <NuxtLink class="studio-page__button" :to="localePath('/contact')"
          >Parlons de votre projet <span aria-hidden="true">↗</span></NuxtLink
        >
      </section>
    </main>
    <FooterSection />
  </div>
</template>
