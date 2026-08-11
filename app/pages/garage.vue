<script setup lang="ts">
const isMenuOpen = ref(false)
const bookingSent = ref(false)

const closeMenu = () => {
  isMenuOpen.value = false
}

const submitBooking = () => {
  bookingSent.value = true
}

useSeoMeta({
  title: 'Atelier 89 — Garage automobile indépendant à Lyon',
  description: 'Entretien, diagnostic et réparation automobile à Lyon. Un devis clair avant chaque intervention, sans mauvaise surprise.',
  ogTitle: 'Atelier 89 — Votre voiture. Notre parole.',
  ogDescription: 'Le garage indépendant qui explique avant de réparer.',
  ogImage: 'https://www.mc-studio.eu/img/garage/hero-workshop.png',
  ogType: 'website',
})

onMounted(() => {
  const targets = document.querySelectorAll<HTMLElement>('.garage-page [data-reveal]')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.14 })

  targets.forEach((target) => observer.observe(target))

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div class="garage-page">
    <a class="skip-link" href="#garage-main">Aller au contenu</a>

    <header class="garage-header">
      <a class="garage-logo" href="#top" aria-label="Atelier 89, retour en haut">
        <span class="garage-logo-mark">A<span>/</span>89</span>
        <span class="garage-logo-copy">Garage indépendant<br>Lyon 7e</span>
      </a>

      <nav class="desktop-nav" aria-label="Navigation principale">
        <a href="#services">Services</a>
        <a href="#atelier">L’atelier</a>
        <a href="#methode">Notre méthode</a>
        <a href="#avis">Avis</a>
      </nav>

      <a class="header-cta" href="#rendez-vous">
        Prendre rendez-vous
        <span aria-hidden="true">↘</span>
      </a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-controls="garage-mobile-menu"
        aria-label="Ouvrir le menu"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span></span>
        <span></span>
      </button>

      <Transition name="menu">
        <nav v-if="isMenuOpen" id="garage-mobile-menu" class="mobile-menu" aria-label="Navigation mobile">
          <a href="#services" @click="closeMenu">Services</a>
          <a href="#atelier" @click="closeMenu">L’atelier</a>
          <a href="#methode" @click="closeMenu">Notre méthode</a>
          <a href="#avis" @click="closeMenu">Avis</a>
          <a href="#rendez-vous" @click="closeMenu">Prendre rendez-vous <span aria-hidden="true">↘</span></a>
        </nav>
      </Transition>
    </header>

    <main id="garage-main">
      <section id="top" class="garage-hero">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> Ouvert aujourd’hui · 08:00–18:30</p>
          <h1>Votre voiture.<br><em>Notre parole.</em></h1>
          <p class="hero-intro">
            Entretien, diagnostic et réparation toutes marques. On vous explique ce qui est nécessaire,
            ce qui peut attendre, et combien cela coûtera—avant de toucher à votre voiture.
          </p>
          <div class="hero-actions">
            <a class="primary-button" href="#rendez-vous">
              Réserver un diagnostic
              <span aria-hidden="true">↗</span>
            </a>
            <a class="text-link" href="tel:+33472008989">04 72 00 89 89</a>
          </div>
        </div>

        <div class="hero-visual">
          <img
            src="/img/garage/hero-workshop.png"
            alt="Mécanicien de l’Atelier 89 inspectant une berline noire dans le garage"
            width="1672"
            height="941"
          >
          <div class="hero-stamp" aria-label="Note moyenne 4,9 sur 5">
            <strong>4,9</strong>
            <span>sur 5</span>
            <small>178 avis vérifiés</small>
          </div>
          <p class="photo-note">L’atelier · Lyon 7e</p>
        </div>

        <div class="hero-proof">
          <div><strong>12 ans</strong><span>d’expérience</span></div>
          <div><strong>30 min</strong><span>pour un premier diagnostic</span></div>
          <div><strong>12 mois</strong><span>pièces & main-d’œuvre garanties</span></div>
          <div class="proof-availability"><i></i><span>3 créneaux disponibles cette semaine</span></div>
        </div>
      </section>

      <section class="promise-section section-shell" data-reveal>
        <p class="section-kicker">Notre engagement</p>
        <div class="promise-grid">
          <h2>Un bon garage ne vous demande pas de lui faire confiance les yeux fermés.</h2>
          <div class="promise-copy">
            <p>
              Il vous montre, vous explique et vous laisse décider. Chaque intervention commence par
              un diagnostic documenté et un devis validé. Si quelque chose change, on vous appelle.
            </p>
            <a href="#methode" class="underlined-link">Voir notre méthode <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section id="services" class="services-section">
        <div class="section-shell">
          <div class="section-heading" data-reveal>
            <div>
              <p class="section-kicker">Ce que nous faisons</p>
              <h2>Le nécessaire.<br>Rien de plus.</h2>
            </div>
            <p>Prestations multimarques pour véhicules thermiques, hybrides et utilitaires légers.</p>
          </div>

          <div class="service-list" data-reveal>
            <article class="service-row">
              <span class="service-number">01</span>
              <div>
                <h3>Entretien & révision</h3>
                <p>Vidange, filtres, niveaux et points de contrôle constructeur.</p>
              </div>
              <strong>Dès 149 €</strong>
              <a href="#rendez-vous" aria-label="Réserver un entretien">↗</a>
            </article>
            <article class="service-row">
              <span class="service-number">02</span>
              <div>
                <h3>Diagnostic électronique</h3>
                <p>Lecture des défauts, recherche de panne et compte-rendu clair.</p>
              </div>
              <strong>Dès 69 €</strong>
              <a href="#rendez-vous" aria-label="Réserver un diagnostic électronique">↗</a>
            </article>
            <article class="service-row">
              <span class="service-number">03</span>
              <div>
                <h3>Freinage & liaison au sol</h3>
                <p>Plaquettes, disques, amortisseurs, pneumatiques et géométrie.</p>
              </div>
              <strong>Sur devis</strong>
              <a href="#rendez-vous" aria-label="Demander un devis freinage">↗</a>
            </article>
            <article class="service-row">
              <span class="service-number">04</span>
              <div>
                <h3>Mécanique & recherche de panne</h3>
                <p>Distribution, embrayage, refroidissement et réparations moteur.</p>
              </div>
              <strong>Sur devis</strong>
              <a href="#rendez-vous" aria-label="Demander un devis mécanique">↗</a>
            </article>
          </div>

          <p class="price-note">Tarifs indicatifs TTC, pièces et main-d’œuvre. Devis précis après inspection du véhicule.</p>
        </div>
      </section>

      <section id="atelier" class="atelier-section section-shell">
        <div class="atelier-visual" data-reveal>
          <img
            src="/img/garage/hero-workshop.png"
            alt="Vue détaillée de l’atelier et de son équipement"
            width="1672"
            height="941"
            loading="lazy"
          >
          <span>45°44' N<br>04°50' E</span>
        </div>
        <div class="atelier-copy" data-reveal>
          <p class="section-kicker">L’atelier</p>
          <h2>Indépendants<br>par choix.</h2>
          <p class="atelier-lead">
            Atelier 89 est né d’une idée simple : remettre la conversation au centre de la mécanique.
          </p>
          <p>
            Ici, pas de forfait opaque ni de pièce remplacée “au cas où”. Nous entretenons votre voiture
            selon son usage réel, son historique et les préconisations du constructeur.
          </p>
          <dl>
            <div><dt>Équipe</dt><dd>4 mécaniciens certifiés</dd></div>
            <div><dt>Équipement</dt><dd>Diagnostic multimarque</dd></div>
            <div><dt>Pièces</dt><dd>Origine ou qualité équivalente</dd></div>
          </dl>
        </div>
      </section>

      <section id="methode" class="method-section">
        <div class="section-shell">
          <div class="method-title" data-reveal>
            <p class="section-kicker">Comment ça se passe</p>
            <h2>Vous gardez<br>le contrôle.</h2>
          </div>

          <ol class="method-steps" data-reveal>
            <li>
              <span>01</span>
              <div>
                <h3>On écoute</h3>
                <p>Vous décrivez les symptômes et votre usage. On fixe un créneau adapté, pas un rendez-vous au hasard.</p>
              </div>
              <small>5 min</small>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>On vérifie</h3>
                <p>Le véhicule est inspecté. Vous recevez un diagnostic illustré avec les priorités et le prix exact.</p>
              </div>
              <small>30–60 min</small>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Vous décidez</h3>
                <p>Aucune réparation ne démarre sans votre accord. Nous rendons les anciennes pièces sur demande.</p>
              </div>
              <small>Zéro surprise</small>
            </li>
          </ol>
        </div>
      </section>

      <section id="avis" class="review-section section-shell" data-reveal>
        <div class="review-score">
          <strong>4,9</strong>
          <span>★★★★★</span>
          <small>178 avis Google</small>
        </div>
        <blockquote>
          “Enfin un garage qui prend le temps d’expliquer. Ils m’ont montré la pièce usée, annoncé le prix
          avant de commencer et rendu la voiture le jour prévu. Je sais où revenir.”
          <footer>Claire M. <span>— Peugeot 308</span></footer>
        </blockquote>
      </section>

      <section class="faq-section section-shell">
        <div class="faq-heading" data-reveal>
          <p class="section-kicker">Questions fréquentes</p>
          <h2>Avant de nous confier vos clés.</h2>
        </div>
        <div class="faq-list" data-reveal>
          <details>
            <summary>Intervenez-vous sur toutes les marques ? <span aria-hidden="true">+</span></summary>
            <p>Oui, sur la majorité des véhicules européens et asiatiques, thermiques ou hybrides. Pour un modèle rare, appelez-nous afin de vérifier l’outillage disponible.</p>
          </details>
          <details>
            <summary>Le diagnostic est-il déduit des réparations ? <span aria-hidden="true">+</span></summary>
            <p>Oui, lorsque la réparation est réalisée chez nous dans les 30 jours suivant le diagnostic, son montant est déduit de la facture finale.</p>
          </details>
          <details>
            <summary>Puis-je déposer ma voiture avant l’ouverture ? <span aria-hidden="true">+</span></summary>
            <p>Oui. Une boîte à clés sécurisée est disponible sur rendez-vous. Nous vous confirmons la prise en charge dès l’ouverture de l’atelier.</p>
          </details>
          <details>
            <summary>Proposez-vous un véhicule de courtoisie ? <span aria-hidden="true">+</span></summary>
            <p>Deux véhicules sont disponibles gratuitement pour les interventions de plus d’une journée, selon disponibilité et sur réservation.</p>
          </details>
        </div>
      </section>

      <section id="rendez-vous" class="booking-section">
        <div class="section-shell booking-grid">
          <div class="booking-copy" data-reveal>
            <p class="section-kicker">Prendre rendez-vous</p>
            <h2>Parlez-nous<br>de votre voiture.</h2>
            <p>Nous vous rappelons sous 30 minutes pendant les heures d’ouverture pour confirmer le bon créneau.</p>
            <div class="booking-contact">
              <a href="tel:+33472008989">04 72 00 89 89</a>
              <span>Lun–Ven · 08:00–18:30<br>Sam · 09:00–13:00</span>
            </div>
          </div>

          <form v-if="!bookingSent" class="booking-form" data-reveal @submit.prevent="submitBooking">
            <label>
              <span>Votre nom</span>
              <input type="text" name="name" autocomplete="name" placeholder="Jean Dupont" required>
            </label>
            <label>
              <span>Téléphone</span>
              <input type="tel" name="phone" autocomplete="tel" placeholder="06 12 34 56 78" required>
            </label>
            <label>
              <span>Véhicule</span>
              <input type="text" name="vehicle" placeholder="Marque, modèle, année" required>
            </label>
            <label>
              <span>Que se passe-t-il ?</span>
              <textarea name="message" rows="3" placeholder="Décrivez le bruit, le voyant ou l’entretien souhaité…" required></textarea>
            </label>
            <button type="submit">Demander mon créneau <span aria-hidden="true">↗</span></button>
            <small>En envoyant ce formulaire, vous acceptez d’être rappelé par Atelier 89.</small>
          </form>

          <div v-else class="booking-success" role="status" aria-live="polite">
            <span>Demande reçue</span>
            <h3>Merci. On vous rappelle très vite.</h3>
            <p>Un membre de l’atelier vous contactera pendant les heures d’ouverture pour confirmer le créneau.</p>
            <button type="button" @click="bookingSent = false">Nouvelle demande</button>
          </div>
        </div>
      </section>
    </main>

    <footer class="garage-footer">
      <div class="footer-logo">A<span>/</span>89</div>
      <div>
        <strong>Atelier 89</strong>
        <span>Garage automobile indépendant<br>Lyon 7e</span>
      </div>
      <div>
        <a href="tel:+33472008989">04 72 00 89 89</a>
        <a href="mailto:bonjour@atelier89.fr">bonjour@atelier89.fr</a>
      </div>
      <div class="footer-meta">
        <span>© 2026 Atelier 89</span>
        <a href="#top">Retour en haut ↑</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.garage-page {
  --ink: #11110f;
  --ink-soft: #24231f;
  --paper: #eee9df;
  --paper-light: #f7f3ea;
  --line: rgba(17, 17, 15, 0.2);
  --signal: #ef3e23;
  min-height: 100vh;
  overflow: hidden;
  background: var(--paper);
  color: var(--ink);
  font-family: "Host Grotesk", "Helvetica Neue", Arial, sans-serif;
}

.garage-page *,
.garage-page *::before,
.garage-page *::after {
  box-sizing: border-box;
}

.garage-page :is(h1, h2, h3, p) {
  margin: 0;
  font-family: inherit;
}

.garage-page :is(h1, h2) {
  background: none;
  color: inherit;
  -webkit-text-fill-color: currentColor;
}

.garage-page a {
  color: inherit;
  text-decoration: none;
}

.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 200;
  transform: translateY(-150%);
  padding: 10px 14px;
  background: var(--paper-light);
  color: var(--ink);
  transition: transform 220ms ease;
}

.skip-link:focus { transform: translateY(0); }

.garage-header {
  position: relative;
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 86px;
  padding: 0 4vw;
  border-bottom: 1px solid var(--line);
  background: var(--paper);
}

.garage-logo {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  width: fit-content;
}

.garage-logo-mark,
.footer-logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.08em;
}

.garage-logo-mark span,
.footer-logo span { color: var(--signal); }

.garage-logo-copy {
  padding-left: 15px;
  border-left: 1px solid var(--line);
  font-size: 10px;
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.desktop-nav { display: flex; gap: clamp(22px, 3vw, 48px); }

.desktop-nav a {
  position: relative;
  font-size: 13px;
  font-weight: 600;
}

.desktop-nav a::after {
  position: absolute;
  right: 0;
  bottom: -7px;
  left: 0;
  height: 1px;
  content: "";
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 220ms ease;
}

.desktop-nav a:hover::after,
.desktop-nav a:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}

.header-cta {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 26px;
  min-height: 44px;
  padding: 0 19px;
  background: var(--ink);
  color: var(--paper-light) !important;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.02em;
  transition: background 220ms ease, color 220ms ease;
}

.header-cta:hover { background: var(--signal); }

.menu-toggle,
.mobile-menu { display: none; }

.garage-hero {
  display: grid;
  grid-template-columns: minmax(390px, 42%) 1fr;
  grid-template-rows: minmax(610px, calc(100vh - 172px)) auto;
  min-height: calc(100vh - 86px);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 70px 4vw 76px;
  background: var(--ink);
  color: var(--paper-light);
}

.eyebrow,
.section-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.eyebrow span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--signal);
  box-shadow: 0 0 0 5px rgba(239, 62, 35, 0.15);
}

.hero-copy h1 {
  max-width: 760px;
  margin-top: 10vh;
  font-size: clamp(66px, 7.4vw, 124px);
  font-weight: 650;
  line-height: 0.8;
  letter-spacing: -0.075em;
  text-transform: uppercase;
}

.hero-copy h1 em {
  color: var(--signal);
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400;
  letter-spacing: -0.07em;
  text-transform: none;
}

.hero-intro {
  max-width: 590px;
  margin-top: 56px !important;
  color: rgba(247, 243, 234, 0.68);
  font-size: 16px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-top: 34px;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 42px;
  min-height: 58px;
  padding: 0 22px;
  background: var(--signal);
  color: white !important;
  font-size: 13px;
  font-weight: 700;
  transition: background 220ms ease, transform 220ms ease;
}

.primary-button:hover {
  background: #ff4c31;
  transform: translateY(-2px);
}

.text-link {
  padding-bottom: 3px;
  border-bottom: 1px solid rgba(247, 243, 234, 0.45);
  font-size: 13px;
  font-weight: 650;
}

.hero-visual {
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: #292722;
}

.hero-visual::after {
  position: absolute;
  inset: 0;
  content: "";
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.hero-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 55% center;
  filter: saturate(0.82) contrast(1.04);
}

.hero-stamp {
  position: absolute;
  top: 34px;
  right: 34px;
  display: grid;
  grid-template-columns: auto 1fr;
  width: 150px;
  padding: 17px;
  background: var(--paper-light);
  color: var(--ink);
}

.hero-stamp strong {
  grid-row: 1 / 3;
  padding-right: 9px;
  font-family: Georgia, serif;
  font-size: 41px;
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: -0.08em;
}

.hero-stamp span { align-self: end; font-size: 10px; text-transform: uppercase; }
.hero-stamp small { align-self: start; font-size: 8px; opacity: 0.56; }

.photo-note {
  position: absolute;
  right: 28px;
  bottom: 24px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-proof {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr) 1.45fr;
  min-height: 86px;
  border-bottom: 1px solid var(--line);
  background: var(--paper-light);
}

.hero-proof > div {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 19px 2.5vw;
  border-right: 1px solid var(--line);
}

.hero-proof > div:last-child { border-right: 0; }
.hero-proof strong { font-family: Georgia, serif; font-size: 25px; font-weight: 400; }
.hero-proof span { max-width: 125px; font-size: 10px; line-height: 1.3; text-transform: uppercase; }

.hero-proof .proof-availability { justify-content: flex-end; }
.proof-availability i { width: 8px; height: 8px; border-radius: 50%; background: #3d9b53; }
.hero-proof .proof-availability span { max-width: none; }

.section-shell {
  width: min(100% - 8vw, 1500px);
  margin-inline: auto;
}

.promise-section { padding-block: clamp(110px, 14vw, 210px); }
.promise-grid { display: grid; grid-template-columns: 1.7fr 0.75fr; gap: 10vw; margin-top: 60px; }

.promise-grid h2 {
  max-width: 1000px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(45px, 6.2vw, 96px);
  font-weight: 400;
  line-height: 0.98;
  letter-spacing: -0.055em;
}

.promise-copy { align-self: end; }
.promise-copy p,
.atelier-copy > p:not(.section-kicker),
.booking-copy > p:not(.section-kicker) { color: #58554e; font-size: 15px; line-height: 1.65; }

.underlined-link {
  display: inline-flex;
  justify-content: space-between;
  gap: 48px;
  margin-top: 34px;
  padding-bottom: 7px;
  border-bottom: 1px solid currentColor;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.services-section { padding-block: clamp(100px, 11vw, 170px); background: var(--ink); color: var(--paper-light); }
.section-heading { display: grid; grid-template-columns: 1fr 0.45fr; align-items: end; gap: 8vw; }

.section-heading h2,
.atelier-copy h2,
.method-title h2,
.booking-copy h2 {
  margin-top: 28px;
  font-size: clamp(62px, 8vw, 126px);
  font-weight: 680;
  line-height: 0.82;
  letter-spacing: -0.075em;
  text-transform: uppercase;
}

.section-heading > p {
  max-width: 360px;
  color: rgba(247, 243, 234, 0.57);
  font-size: 14px;
  line-height: 1.55;
}

.service-list { margin-top: 105px; border-top: 1px solid rgba(247, 243, 234, 0.22); }
.service-row {
  display: grid;
  grid-template-columns: 70px minmax(300px, 1fr) 130px 48px;
  align-items: center;
  gap: 32px;
  min-height: 142px;
  border-bottom: 1px solid rgba(247, 243, 234, 0.22);
  transition: color 220ms ease, padding 220ms ease;
}

.service-row:hover { padding-inline: 15px; color: var(--signal); }
.service-number { align-self: start; margin-top: 36px; color: rgba(247, 243, 234, 0.42); font-size: 10px; }
.service-row h3 { font-size: clamp(26px, 3vw, 45px); font-weight: 520; letter-spacing: -0.04em; }
.service-row p { margin-top: 8px !important; color: rgba(247, 243, 234, 0.52); font-size: 12px; }
.service-row strong { font-size: 12px; text-transform: uppercase; }
.service-row > a { display: grid; width: 48px; height: 48px; border: 1px solid rgba(247, 243, 234, 0.28); place-items: center; }
.price-note { margin-top: 24px !important; color: rgba(247, 243, 234, 0.38); font-size: 10px; }

.atelier-section {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 7vw;
  padding-block: clamp(110px, 14vw, 210px);
}

.atelier-visual { position: relative; min-height: 760px; overflow: hidden; background: var(--ink-soft); }
.atelier-visual img { width: 100%; height: 100%; object-fit: cover; object-position: 76% center; filter: grayscale(1) contrast(1.07); }
.atelier-visual span { position: absolute; right: 18px; bottom: 18px; color: white; font-size: 9px; line-height: 1.3; letter-spacing: 0.12em; }
.atelier-copy { align-self: center; }
.atelier-copy h2 { font-size: clamp(59px, 7vw, 110px); }
.atelier-lead { margin-top: 64px !important; color: var(--ink) !important; font-family: Georgia, serif !important; font-size: clamp(25px, 2.3vw, 37px) !important; line-height: 1.2 !important; letter-spacing: -0.035em; }
.atelier-copy > p:not(.atelier-lead, .section-kicker) { max-width: 530px; margin-top: 28px !important; }
.atelier-copy dl { margin: 60px 0 0; border-top: 1px solid var(--line); }
.atelier-copy dl div { display: grid; grid-template-columns: 110px 1fr; gap: 20px; padding: 17px 0; border-bottom: 1px solid var(--line); }
.atelier-copy dt { color: #77736a; font-size: 10px; text-transform: uppercase; }
.atelier-copy dd { margin: 0; font-size: 12px; font-weight: 650; }

.method-section { padding-block: clamp(100px, 11vw, 170px); border-block: 1px solid var(--line); background: var(--paper-light); }
.method-title { display: grid; grid-template-columns: 0.45fr 1fr; align-items: start; }
.method-title .section-kicker { margin-top: 9px; }
.method-title h2 { margin: 0; }
.method-steps { display: grid; grid-template-columns: repeat(3, 1fr); margin: 100px 0 0; padding: 0; border-top: 1px solid var(--line); list-style: none; }
.method-steps li { display: flex; flex-direction: column; min-height: 400px; padding: 28px 36px 28px 0; border-right: 1px solid var(--line); }
.method-steps li + li { padding-left: 36px; }
.method-steps li:last-child { border-right: 0; }
.method-steps > li > span { color: var(--signal); font-size: 11px; font-weight: 700; }
.method-steps div { margin-top: auto; }
.method-steps h3 { font-family: Georgia, serif; font-size: 42px; font-weight: 400; letter-spacing: -0.04em; }
.method-steps p { max-width: 330px; margin-top: 18px !important; color: #5c5952; font-size: 13px; line-height: 1.55; }
.method-steps small { margin-top: 54px; font-size: 10px; font-weight: 700; text-transform: uppercase; }

.review-section { display: grid; grid-template-columns: 0.34fr 1fr; gap: 9vw; padding-block: clamp(120px, 15vw, 220px); }
.review-score { display: flex; flex-direction: column; justify-content: center; padding-right: 6vw; border-right: 1px solid var(--line); }
.review-score strong { font-family: Georgia, serif; font-size: clamp(82px, 10vw, 154px); font-weight: 400; line-height: 0.8; letter-spacing: -0.08em; }
.review-score span { margin-top: 24px; color: var(--signal); font-size: 14px; letter-spacing: 0.18em; }
.review-score small { margin-top: 10px; color: #6b675f; font-size: 10px; text-transform: uppercase; }
.review-section blockquote { margin: 0; align-self: center; font-family: Georgia, serif; font-size: clamp(35px, 4.5vw, 67px); line-height: 1.07; letter-spacing: -0.045em; }
.review-section blockquote footer { margin-top: 40px; font-family: "Host Grotesk", sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.review-section blockquote footer span { color: #77736a; font-weight: 500; }

.faq-section { display: grid; grid-template-columns: 0.7fr 1fr; gap: 9vw; padding-block: clamp(100px, 11vw, 170px); border-top: 1px solid var(--line); }
.faq-heading h2 { max-width: 590px; margin-top: 34px; font-family: Georgia, serif; font-size: clamp(44px, 5.5vw, 82px); font-weight: 400; line-height: 1; letter-spacing: -0.055em; }
.faq-list { border-top: 1px solid var(--line); }
.faq-list details { border-bottom: 1px solid var(--line); }
.faq-list summary { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 26px 0; font-size: 15px; font-weight: 650; cursor: pointer; list-style: none; }
.faq-list summary::-webkit-details-marker { display: none; }
.faq-list summary span { font-size: 25px; font-weight: 300; transition: transform 220ms ease; }
.faq-list details[open] summary span { transform: rotate(45deg); }
.faq-list details p { max-width: 630px; padding: 0 45px 26px 0; color: #5e5a53; font-size: 13px; line-height: 1.6; }

.booking-section { padding-block: clamp(100px, 11vw, 165px); background: var(--signal); color: white; }
.booking-grid { display: grid; grid-template-columns: 0.85fr 1fr; gap: 10vw; }
.booking-copy h2 { font-size: clamp(62px, 7vw, 110px); }
.booking-copy > p:not(.section-kicker) { max-width: 500px; margin-top: 50px !important; color: rgba(255, 255, 255, 0.72); }
.booking-contact { display: flex; align-items: end; gap: 32px; margin-top: 60px; }
.booking-contact a { padding-bottom: 4px; border-bottom: 1px solid white; font-size: 22px; font-weight: 650; }
.booking-contact span { font-size: 10px; line-height: 1.5; text-transform: uppercase; }
.booking-form { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 24px; align-self: start; }
.booking-form label { display: flex; flex-direction: column; gap: 9px; }
.booking-form label:nth-of-type(3),
.booking-form label:nth-of-type(4) { grid-column: 1 / -1; }
.booking-form label > span { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.booking-form :is(input, textarea) { width: 100%; border: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.55); border-radius: 0; outline: none; background: transparent; color: white; font: inherit; font-size: 15px; resize: vertical; }
.booking-form input { height: 54px; }
.booking-form textarea { min-height: 90px; padding-top: 15px; }
.booking-form :is(input, textarea)::placeholder { color: rgba(255, 255, 255, 0.53); }
.booking-form :is(input, textarea):focus { border-bottom-color: white; }
.booking-form button { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; min-height: 64px; margin-top: 12px; padding: 0 24px; border: 0; background: var(--ink); color: white; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 220ms ease, transform 220ms ease; }
.booking-form button:hover { background: #2b2925; transform: translateY(-2px); }
.booking-form small { grid-column: 1 / -1; color: rgba(255, 255, 255, 0.6); font-size: 9px; }
.booking-success { align-self: center; padding: clamp(36px, 5vw, 70px); background: var(--paper-light); color: var(--ink); }
.booking-success > span { color: var(--signal); font-size: 10px; font-weight: 700; text-transform: uppercase; }
.booking-success h3 { margin-top: 25px; font-family: Georgia, serif; font-size: clamp(37px, 4vw, 60px); font-weight: 400; line-height: 1; letter-spacing: -0.04em; }
.booking-success p { margin-top: 25px !important; color: #5f5b54; font-size: 13px; line-height: 1.55; }
.booking-success button { margin-top: 32px; padding: 0 0 5px; border: 0; border-bottom: 1px solid currentColor; background: none; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; text-transform: uppercase; }

.garage-footer { display: grid; grid-template-columns: 0.3fr 1fr 1fr auto; gap: 40px; padding: 65px 4vw; background: var(--ink); color: var(--paper-light); }
.garage-footer > div:not(.footer-logo) { display: flex; flex-direction: column; gap: 7px; }
.garage-footer strong { font-size: 12px; text-transform: uppercase; }
.garage-footer span,
.garage-footer a { color: rgba(247, 243, 234, 0.58); font-size: 11px; line-height: 1.5; }
.garage-footer a:hover { color: white; }
.footer-meta { align-items: flex-end; justify-content: space-between; text-align: right; }

[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 500ms cubic-bezier(.2,.7,.2,1), transform 500ms cubic-bezier(.2,.7,.2,1);
}

[data-reveal].is-visible { opacity: 1; transform: translateY(0); }

.menu-enter-active,
.menu-leave-active { transition: opacity 220ms ease, transform 220ms ease; }
.menu-enter-from,
.menu-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 1100px) {
  .desktop-nav { display: none; }
  .garage-header { grid-template-columns: 1fr auto auto; gap: 12px; }
  .menu-toggle { display: flex; flex-direction: column; justify-content: center; gap: 5px; width: 44px; height: 44px; border: 1px solid var(--line); background: transparent; }
  .menu-toggle span { display: block; width: 18px; height: 1px; margin-inline: auto; background: var(--ink); }
  .mobile-menu { position: absolute; top: 86px; right: 0; left: 0; display: flex; flex-direction: column; padding: 28px 4vw 38px; border-bottom: 1px solid var(--line); background: var(--paper-light); }
  .mobile-menu a { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid var(--line); font-size: 18px; font-weight: 620; }
  .mobile-menu a:last-child { margin-top: 16px; padding: 18px; border: 0; background: var(--signal); color: white; }
  .garage-hero { grid-template-columns: 48% 52%; }
  .hero-copy h1 { font-size: clamp(62px, 8vw, 92px); }
  .hero-proof { grid-template-columns: repeat(3, 1fr); }
  .proof-availability { display: none !important; }
  .service-row { grid-template-columns: 50px minmax(300px, 1fr) 100px 48px; }
}

@media (max-width: 800px) {
  .garage-header { min-height: 72px; }
  .garage-logo-copy { display: none; }
  .header-cta { display: none; }
  .mobile-menu { top: 72px; }
  .garage-hero { display: flex; flex-direction: column; min-height: 0; }
  .hero-copy { min-height: 610px; padding: 58px 5vw; }
  .hero-copy h1 { margin-top: 100px; font-size: clamp(58px, 17vw, 90px); }
  .hero-intro { margin-top: 42px !important; }
  .hero-visual { height: 68vw; min-height: 390px; }
  .hero-visual img { object-position: 62% center; }
  .hero-proof { grid-template-columns: repeat(3, 1fr); min-height: 100px; }
  .hero-proof > div { flex-direction: column; align-items: flex-start; justify-content: center; gap: 4px; padding: 14px 5vw; }
  .hero-proof strong { font-size: 20px; }
  .hero-proof span { font-size: 8px; }
  .section-shell { width: min(100% - 10vw, 1500px); }
  .promise-grid,
  .section-heading,
  .atelier-section,
  .method-title,
  .review-section,
  .faq-section,
  .booking-grid { grid-template-columns: 1fr; }
  .promise-grid { gap: 46px; margin-top: 40px; }
  .promise-copy { max-width: 560px; }
  .section-heading { gap: 42px; }
  .section-heading h2,
  .atelier-copy h2,
  .method-title h2,
  .booking-copy h2 { font-size: clamp(58px, 16vw, 98px); }
  .service-list { margin-top: 70px; }
  .service-row { grid-template-columns: 36px 1fr 42px; gap: 15px; padding-block: 28px; }
  .service-row:hover { padding-inline: 0; }
  .service-number { margin-top: 6px; }
  .service-row strong { grid-column: 2; grid-row: 2; }
  .service-row > a { grid-column: 3; grid-row: 1 / 3; }
  .atelier-section { gap: 75px; }
  .atelier-visual { min-height: 570px; }
  .method-title { gap: 36px; }
  .method-title h2 { margin-top: 0; }
  .method-steps { grid-template-columns: 1fr; margin-top: 70px; }
  .method-steps li,
  .method-steps li + li { min-height: 330px; padding: 28px 0; border-right: 0; border-bottom: 1px solid var(--line); }
  .review-section { gap: 70px; }
  .review-score { padding: 0 0 55px; border-right: 0; border-bottom: 1px solid var(--line); }
  .faq-section { gap: 70px; }
  .booking-grid { gap: 80px; }
  .garage-footer { grid-template-columns: 0.4fr 1fr 1fr; }
  .footer-meta { grid-column: 1 / -1; flex-direction: row !important; align-items: center; padding-top: 30px; border-top: 1px solid rgba(247, 243, 234, 0.15); text-align: left; }
}

@media (max-width: 520px) {
  .hero-copy { min-height: 630px; }
  .hero-actions { align-items: flex-start; flex-direction: column; }
  .primary-button { width: 100%; }
  .hero-stamp { top: 18px; right: 18px; }
  .photo-note { display: none; }
  .hero-proof > div { padding: 12px 3vw; }
  .hero-proof strong { font-size: 18px; }
  .promise-grid h2 { font-size: 45px; }
  .service-row { grid-template-columns: 28px 1fr 40px; }
  .service-row p { padding-right: 8px; line-height: 1.4; }
  .atelier-visual { min-height: 470px; }
  .review-section blockquote { font-size: 38px; }
  .booking-form { grid-template-columns: 1fr; }
  .booking-form label,
  .booking-form label:nth-of-type(3),
  .booking-form label:nth-of-type(4),
  .booking-form button,
  .booking-form small { grid-column: 1; }
  .booking-contact { align-items: flex-start; flex-direction: column; }
  .garage-footer { grid-template-columns: 1fr 1fr; }
  .footer-logo { grid-column: 1 / -1; }
  .garage-footer > div:nth-of-type(3) { align-items: flex-end; text-align: right; }
}

@media (prefers-reduced-motion: reduce) {
  .garage-page *,
  .garage-page *::before,
  .garage-page *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }

  [data-reveal] { opacity: 1; transform: none; }
}
</style>
