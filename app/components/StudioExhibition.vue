<script setup lang="ts">
defineProps<{ city?: string }>()
const localePath = useLocalePath()
const editions = [
  {
    slug: 'maison-awl',
    title: 'Maison AWL',
    type: 'Marketplace de services',
    description:
      'Trouver la bonne personne pour organiser son intérieur, échanger avec elle et réserver sa prestation.',
    image: 'awl-interface',
    alt: 'Recherche de prestataires sur Maison AWL',
  },
  {
    slug: 'crm-ra-energy',
    title: 'R&A Energy',
    type: 'Application métier',
    description:
      'Organiser les tournées commerciales en tenant compte des disponibilités et des trajets entre deux rendez-vous.',
    image: 'ra-interface',
    alt: 'Tableau de bord commercial de R&A Energy',
  },
  {
    slug: 'personal',
    title: 'Personal',
    type: 'Produit du studio · IA',
    description:
      'Relier une idée de publication à une expérience vécue, puis préparer un brouillon dans la voix du créateur.',
    image: 'personal-interface',
    alt: 'Fil d’inspiration dans l’application Personal',
  },
] as const
const selected = ref(0)
const current = computed(() => editions[selected.value]!)
</script>

<template>
  <section class="exhibition" aria-labelledby="exhibition-title">
    <header class="exhibition__mast">
      <h1 id="exhibition-title">Applications <em>sur mesure.</em></h1>
      <div class="exhibition__intro">
        <p>
          MC Studio conçoit et développe des applications pour les équipes de
          terrain et les entrepreneurs<span v-if="city"> à {{ city }}</span
          >.
        </p>
        <NuxtLink :to="localePath('/contact')"
          >Discuter d’un projet <span aria-hidden="true">↗</span></NuxtLink
        >
      </div>
    </header>
    <div
      id="realisations"
      class="exhibition__stage"
      :data-project="current.slug"
    >
      <div
        v-if="selected === 0"
        class="exhibition__room"
        aria-hidden="true"
      ></div>
      <div class="exhibition__project" aria-live="polite">
        <p>{{ current.type }}</p>
        <h2>{{ current.title }}</h2>
        <p class="exhibition__description">{{ current.description }}</p>
        <NuxtLink :to="localePath('/projects/' + current.slug)"
          >Ouvrir le projet <span aria-hidden="true">↗</span></NuxtLink
        >
      </div>
      <NuxtLink
        :key="current.image"
        class="exhibition__screen"
        :to="localePath('/projects/' + current.slug)"
        :aria-label="'Découvrir ' + current.title"
      >
        <img
          :src="'/img/studio/' + current.image + '-1440.webp'"
          :srcset="
            '/img/studio/' +
            current.image +
            '-640.webp 640w, /img/studio/' +
            current.image +
            '-1440.webp 1440w'
          "
          sizes="(max-width: 680px) 95vw, 56vw"
          width="1440"
          height="810"
          :alt="current.alt"
        />
      </NuxtLink>
    </div>
    <div class="exhibition__index">
      <nav aria-label="Applications à découvrir">
        <button
          v-for="(item, i) in editions"
          :key="item.slug"
          type="button"
          :aria-pressed="selected === i"
          @click="selected = i"
        >
          {{ item.title }}
        </button>
      </nav>
      <NuxtLink :to="localePath('/projects')"
        >Toutes les réalisations ↗</NuxtLink
      >
    </div>
  </section>
</template>

<style scoped>
.exhibition {
  background: #f2f0e8;
  color: #1b201d;
  padding: 0 clamp(18px, 3.1vw, 64px) 0;
}
.exhibition__mast {
  display: grid;
  grid-template-columns: 1fr minmax(210px, 22%);
  gap: 5%;
  align-items: end;
  padding: clamp(38px, 5vw, 88px) 0 clamp(32px, 3.5vw, 58px);
}
.exhibition h1 {
  background: none;
  color: inherit;
  -webkit-text-fill-color: currentColor;
  font:
    480 clamp(68px, 8.7vw, 172px)/0.82 'Host Grotesk',
    sans-serif;
  letter-spacing: -0.083em;
  margin: 0;
}
.exhibition h1 em {
  display: block;
  font:
    italic 0.99em/.91 Georgia,
    serif;
  letter-spacing: -0.075em;
  margin-left: clamp(24px, 8vw, 160px);
}
.exhibition__intro {
  padding-bottom: 4px;
  max-width: 32ch;
}
.exhibition__intro p,
.exhibition__description {
  font-size: clamp(14px, 1.06vw, 18px);
  line-height: 1.48;
}
.exhibition__intro a,
.exhibition__project a,
.exhibition__index > a {
  display: inline-flex;
  align-items: center;
  gap: 1.4em;
  min-height: 44px;
  border-bottom: 1px solid;
  font-size: 14px;
  font-weight: 550;
}
.exhibition__stage {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: clamp(390px, 33vw, 660px);
  display: flex;
  align-items: flex-end;
  padding: clamp(24px, 4vw, 76px);
  color: #fffaf0;
  background: #484138;
}
.exhibition__room {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: center 54% / cover url('/img/studio/awl-room-1440.webp');
}
.exhibition__stage::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(85deg, #12130fba, transparent 78%);
}
.exhibition__stage[data-project='crm-ra-energy'] {
  background: linear-gradient(120deg, #133629, #458173 55%, #a7baa6);
}
.exhibition__stage[data-project='personal'] {
  background: linear-gradient(120deg, #201c26, #91452e 66%, #ec9a65);
}
.exhibition__project {
  position: relative;
  z-index: 2;
  max-width: 37%;
}
.exhibition__project > p:first-child {
  font:
    500 11px/1.5 ui-monospace,
    monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.exhibition__project h2 {
  font:
    normal clamp(44px, 5.1vw, 98px)/1.06 Georgia,
    serif;
  letter-spacing: -0.068em;
  margin: 10px 0;
}
.exhibition__description {
  max-width: 36ch;
}
.exhibition__screen {
  position: absolute;
  right: 0;
  top: 14%;
  width: 54%;
  display: block;
  padding: clamp(6px, 0.7vw, 14px);
  border: 1px solid #d1cbc2;
  background: #212323;
  border-radius: 12px;
  box-shadow: 0 35px 74px #0006;
  transform: perspective(1600px) rotateY(-12deg) rotateZ(-3deg);
  transform-origin: center;
}
.exhibition__screen img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
}
.exhibition__index {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #2226;
  padding: 12px 0;
}
.exhibition__index nav {
  display: flex;
  gap: clamp(12px, 3vw, 60px);
}
.exhibition__index button {
  cursor: pointer;
  font-size: 14px;
  min-height: 44px;
  color: #575952;
  border-bottom: 2px solid transparent;
}
.exhibition__index button[aria-pressed='true'] {
  border-color: currentColor;
  color: #171c17;
}
.exhibition :is(a, button):focus-visible {
  outline: 2px solid #ac7729;
  outline-offset: 4px;
}
@media (prefers-reduced-motion: no-preference) {
  .exhibition__screen {
    animation: enter-screen 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }
  @keyframes enter-screen {
    from {
      opacity: 0.2;
      translate: 2% 7%;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }
}
@media (max-width: 680px) {
  .exhibition__mast {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 32px 0 22px;
  }
  .exhibition h1 {
    font-size: clamp(55px, 15vw, 100px);
  }
  .exhibition__intro {
    max-width: 38ch;
  }
  .exhibition__stage {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    min-height: 0;
    padding: 24px 20px 0;
    gap: 20px;
  }
  .exhibition__project {
    max-width: none;
  }
  .exhibition__project h2 {
    margin: 4px 0;
  }
  .exhibition__screen {
    position: relative;
    top: auto;
    width: 100%;
    margin: 0 0 -7%;
    transform: perspective(800px) rotateY(-7deg) rotateZ(-3deg);
  }
  .exhibition__room {
    background-image: url('/img/studio/awl-room-640.webp');
  }
  .exhibition__index {
    flex-wrap: wrap;
    gap: 0;
  }
  .exhibition__index nav {
    width: 100%;
    justify-content: space-between;
  }
}
@supports (animation-timeline: view()) {
  @media (min-width: 681px) and (prefers-reduced-motion: no-preference) {
    .exhibition__stage {
      view-timeline-name: --exhibit;
    }
    .exhibition__screen img {
      animation: reveal-interface linear both;
      animation-timeline: --exhibit;
      animation-range: entry 0% exit 85%;
    }
    @keyframes reveal-interface {
      from {
        clip-path: inset(0 0 6%);
      }
      to {
        clip-path: inset(0);
      }
    }
    .exhibition__room {
      animation: room-perspective linear both;
      animation-timeline: --exhibit;
      animation-range: entry 0% exit 85%;
    }
    @keyframes room-perspective {
      from {
        transform: scale(1.1) translateY(-2%);
      }
      to {
        transform: scale(1.03);
      }
    }
  }
}
</style>
