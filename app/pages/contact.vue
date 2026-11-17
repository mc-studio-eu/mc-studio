<script setup lang="ts">
import { useStudioSeo } from '~/composables/useStudioSeo'
import '~/assets/css/studio-pages.css'
const localePath = useLocalePath()
const form = reactive({
  name: '',
  email: '',
  company: '',
  projectType: '',
  timeline: '',
  budget: '',
  message: '',
  website: '',
})
const pending = ref(false)
const submitted = ref(false)
const error = ref('')
const status = ref<HTMLElement | null>(null)
const showCalendar = ref(false)
useStudioSeo(
  'Parlons de votre application | MC Studio',
  'Décrivez votre application métier, votre SaaS ou votre projet IA. Échangez directement avec Mohamed Chettah, fondateur de MC Studio.',
)
async function submit() {
  if (pending.value) return
  error.value = ''
  if (form.name.trim().length < 2 || form.message.trim().length < 20) {
    error.value =
      'Indiquez votre nom et décrivez votre projet en au moins 20 caractères.'
    await nextTick()
    status.value?.focus()
    return
  }
  pending.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        audience: 'business',
        name: form.name,
        email: form.email,
        company: form.company,
        projectType: form.projectType,
        website: form.website,
        message: `${form.message.trim()}\n\nÉchéance souhaitée : ${form.timeline || 'À définir'}\nBudget estimé : ${form.budget || 'À définir'}`,
      },
    })
    submitted.value = true
  } catch {
    error.value =
      'Votre demande n’a pas pu être envoyée. Réessayez ou écrivez-nous à contact@mc-studio.eu.'
  } finally {
    pending.value = false
    await nextTick()
    status.value?.focus()
  }
}
</script>

<template>
  <div class="studio-page contact-studio">
    <StudioNavbar tone="dark" />
    <main class="studio-page__wrap">
      <header class="studio-page__hero">
        <p class="studio-page__eyebrow">Votre application sur mesure</p>
        <h1>Parlons de ce que<br />vous voulez construire.</h1>
        <p class="studio-page__lead">
          Une idée à cadrer, un outil qui vous freine ou un produit à faire
          évoluer. Expliquez-nous le contexte, même si tout n’est pas encore
          défini.
        </p>
      </header>
      <section
        class="studio-page__section studio-page__split"
        aria-labelledby="contact-heading"
      >
        <aside>
          <h2 id="contact-heading">
            Un premier échange.<br />Des questions concrètes.
          </h2>
          <p class="studio-page__body">
            Vous échangez directement avec Mohamed, fondateur de MC Studio. Nous
            parlons de vos utilisateurs, de vos objectifs et des contraintes du
            projet pour identifier la prochaine étape utile.
          </p>
          <div class="contact-studio__person">
            <img
              src="/img/studio/founder-640.webp"
              alt="Mohamed Chettah"
              width="72"
              height="72"
            />
            <div>
              <strong>Mohamed Chettah</strong
              ><span>Fondateur · Design & développement</span>
            </div>
          </div>
          <a class="studio-page__text-link" href="mailto:contact@mc-studio.eu"
            >contact@mc-studio.eu ↗</a
          >
          <div class="contact-studio__alternatives">
            <a
              class="studio-page__text-link"
              href="https://cal.com/mc-studio/discutons-de-votre-projet"
              target="_blank"
              rel="noopener noreferrer"
              >Choisir un créneau <span aria-hidden="true">↗</span></a
            ><a
              class="studio-page__text-link"
              href="https://api.whatsapp.com/send/?phone=%2B33781724683"
              target="_blank"
              rel="noopener noreferrer"
              >Échanger sur WhatsApp <span aria-hidden="true">↗</span></a
            >
          </div>
        </aside>
        <div>
          <div
            v-if="submitted"
            ref="status"
            class="contact-studio__success"
            role="status"
            tabindex="-1"
          >
            <p class="studio-page__eyebrow">Demande reçue</p>
            <h2>Merci pour votre confiance.</h2>
            <p>
              Nous avons bien reçu votre projet. Mohamed reviendra vers vous par
              e-mail pour poursuivre l’échange.
            </p>
            <NuxtLink
              class="studio-page__text-link"
              :to="localePath('/projects')"
              >Explorer les projets du studio ↗</NuxtLink
            >
          </div>
          <form
            v-else
            class="contact-studio__form"
            :aria-busy="pending"
            @submit.prevent="submit"
          >
            <p class="contact-studio__hint">
              Les champs marqués d’un * sont obligatoires.
            </p>
            <div class="contact-studio__fields">
              <label
                >Votre nom *<input
                  v-model="form.name"
                  name="name"
                  autocomplete="name"
                  required
                  minlength="2"
                  maxlength="100"
                  placeholder="Prénom et nom"
              /></label>
              <label
                >Votre e-mail *<input
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  maxlength="160"
                  placeholder="vous@entreprise.fr"
              /></label>
              <label class="contact-studio__full"
                >Entreprise<input
                  v-model="form.company"
                  name="company"
                  autocomplete="organization"
                  maxlength="120"
                  placeholder="Votre entreprise ou votre projet"
              /></label>
              <label class="contact-studio__full"
                >Ce que vous souhaitez construire<select
                  v-model="form.projectType"
                  name="projectType"
                >
                  <option value="">À définir ensemble</option>
                  <option>Application métier</option>
                  <option>SaaS ou MVP</option>
                  <option>Application ou automatisation IA</option>
                  <option>Évolution d’un produit existant</option>
                </select></label
              >
              <label
                >Échéance souhaitée<select
                  v-model="form.timeline"
                  name="timeline"
                >
                  <option value="">À définir</option>
                  <option>Dès que possible</option>
                  <option>Dans 1 à 3 mois</option>
                  <option>Dans 3 à 6 mois</option>
                  <option>Plus tard</option>
                </select></label
              >
              <label
                >Budget estimé<select v-model="form.budget" name="budget">
                  <option value="">À définir ensemble</option>
                  <option>Moins de 10 000 €</option>
                  <option>10 000 à 25 000 €</option>
                  <option>25 000 à 50 000 €</option>
                  <option>Plus de 50 000 €</option>
                </select></label
              >
              <label class="contact-studio__full"
                >Votre projet et vos objectifs *<textarea
                  v-model="form.message"
                  name="message"
                  required
                  minlength="20"
                  maxlength="3500"
                  rows="6"
                  placeholder="Quel problème souhaitez-vous résoudre ? Pour qui ? Quels outils utilisez-vous aujourd’hui ?"
                  aria-describedby="project-help"
                />
              </label>
            </div>
            <p id="project-help" class="contact-studio__hint">
              Quelques phrases suffisent. Au moins 20 caractères.
            </p>
            <div class="contact-studio__trap" aria-hidden="true">
              <label
                >Site internet<input
                  v-model="form.website"
                  name="website"
                  tabindex="-1"
                  autocomplete="off"
              /></label>
            </div>
            <p class="contact-studio__hint">
              Vos informations servent à traiter votre demande.
              <NuxtLink :to="localePath('/privacy')"
                >Politique de confidentialité</NuxtLink
              >.
            </p>
            <p
              v-if="error"
              ref="status"
              role="alert"
              tabindex="-1"
              class="contact-studio__error"
            >
              {{ error }}
            </p>
            <button
              class="studio-page__button"
              type="submit"
              :disabled="pending"
            >
              {{ pending ? 'Envoi en cours…' : 'Envoyer mon projet' }}
              <span aria-hidden="true">↗</span>
            </button>
          </form>
        </div>
      </section>
      <section class="studio-page__section" aria-labelledby="calendar-heading">
        <h2 id="calendar-heading">Vous préférez en parler de vive voix ?</h2>
        <p class="studio-page__body">
          Choisissez un créneau pour nous présenter votre projet.
        </p>
        <button
          class="studio-page__text-link contact-studio__calendar-button"
          type="button"
          :aria-expanded="showCalendar"
          aria-controls="booking-calendar"
          @click="showCalendar = !showCalendar"
        >
          {{ showCalendar ? 'Fermer le calendrier' : 'Afficher les créneaux' }}
          <span aria-hidden="true">{{ showCalendar ? '−' : '+' }}</span>
        </button>
        <div v-if="showCalendar" id="booking-calendar">
          <iframe
            class="contact-studio__calendar"
            src="https://cal.com/mc-studio/discutons-de-votre-projet?embed=true&theme=dark"
            title="Réserver un échange avec MC Studio"
            loading="lazy"
          />
          <p class="contact-studio__hint">
            Le calendrier ne s’affiche pas ?
            <a
              href="https://cal.com/mc-studio/discutons-de-votre-projet"
              target="_blank"
              rel="noopener noreferrer"
              >Ouvrir la réservation dans un nouvel onglet</a
            >.
          </p>
        </div>
      </section>
    </main>
    <FooterSection />
  </div>
</template>

<style scoped>
.contact-studio__person {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0 18px;
}
.contact-studio__person img {
  border-radius: 50%;
  object-fit: cover;
  height: 72px;
}
.contact-studio__person strong,
.contact-studio__person span {
  display: block;
}
.contact-studio__person span {
  font-size: 13px;
  color: #b8b5ae;
  margin-top: 5px;
}
.contact-studio__alternatives {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 24px;
}
.contact-studio__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 20px;
}
.contact-studio__full {
  grid-column: 1/-1;
}
.contact-studio__form label {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
}
.contact-studio__form input,
.contact-studio__form select,
.contact-studio__form textarea {
  width: 100%;
  min-width: 0;
  background: #191919;
  color: #f5f3ee;
  border: 1px solid #ffffff38;
  border-radius: 4px;
  padding: 14px;
  font:
    400 16px/1.5 'Host Grotesk',
    sans-serif;
  min-height: 52px;
  color-scheme: dark;
}
.contact-studio__form textarea {
  resize: vertical;
}
.contact-studio__form input::placeholder,
.contact-studio__form textarea::placeholder {
  color: #95938e;
}
.contact-studio__hint {
  font-size: 12px;
  line-height: 1.7;
  color: #aaa69e;
  margin: 0 0 24px;
}
.contact-studio__fields + .contact-studio__hint {
  margin: 12px 0 24px;
}
.contact-studio__hint a {
  text-decoration: underline;
  text-underline-offset: 3px;
  color: #e4dfd5;
}
.contact-studio__trap {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.contact-studio__error {
  color: #ffc4b5;
  margin-bottom: 24px;
}
.contact-studio__form button:disabled {
  opacity: 0.65;
  cursor: wait;
}
.contact-studio__success {
  padding: 32px;
  background: #191919;
  border-top: 2px solid #f0bf6c;
}
.contact-studio__success p {
  line-height: 1.7;
}
.contact-studio__calendar-button {
  border: 0;
  background: none;
  cursor: pointer;
}
.contact-studio__calendar {
  display: block;
  width: 100%;
  height: 720px;
  border: 0;
  margin-top: 24px;
}
@media (max-width: 480px) {
  .contact-studio__fields {
    grid-template-columns: 1fr;
  }
  .contact-studio__form button {
    width: 100%;
  }
}
</style>
