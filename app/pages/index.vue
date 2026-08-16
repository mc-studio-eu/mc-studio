<script setup lang="ts">
const { locale } = useI18n()

const intro = computed(() => locale.value === 'fr'
  ? {
      label: 'Un studio, du cadrage au lancement',
      title: 'Une idée forte mérite une exécution tout aussi forte.',
      body: 'Nous réunissons stratégie, identité, design produit et développement dans une même équipe. Moins de passages de relais, plus de clarté et un produit qui tient la route.',
    }
  : {
      label: 'One studio, from framing to launch',
      title: 'A strong idea deserves equally strong execution.',
      body: 'We bring strategy, identity, product design and development into one team. Fewer handoffs, more clarity, and a product built to last.',
    })

const statement = computed(() => locale.value === 'fr'
  ? { top: 'PENSER.', middle: 'CRÉER.', accent: 'Lancer juste.' }
  : { top: 'THINK.', middle: 'MAKE.', accent: 'Launch right.' })
</script>

<template>
  <main class="air-shell">
    <HeroSection />

    <section class="air-intro" aria-labelledby="air-intro-title">
      <div class="air-intro__label">{{ intro.label }}</div>
      <div class="air-intro__copy">
        <h2 id="air-intro-title">{{ intro.title }}</h2>
        <p>{{ intro.body }}</p>
        <a href="#services">{{ $t('nav.services') }} <span aria-hidden="true">↓</span></a>
      </div>
    </section>

    <ProjectSection id="projets" />
    <ServicesSection id="services" />

    <section class="air-statement" aria-label="Approche MC Studio">
      <NuxtImg src="/img/main/mc-air-glass-hero.webp" alt="" class="air-statement__image" loading="lazy" />
      <div class="air-statement__shade" aria-hidden="true"></div>
      <div class="air-statement__content">
        <span>{{ statement.top }}</span>
        <span>{{ statement.middle }}</span>
        <em>{{ statement.accent }}</em>
      </div>
    </section>

    <TeamSection />
    <ProcessSection id="process" />
    <TestimonialSection id="avis" />
    <PricingSection id="tarifs" />
    <FaqSection id="faq" />
    <CtaSection />
    <FooterSection />
    <ScrollToTop />
  </main>
</template>

<style scoped>
.air-shell { overflow: clip; background: #02060c; color: #fff; }
.air-intro {
  display: grid;
  grid-template-columns: minmax(180px, .65fr) minmax(0, 1.6fr);
  gap: 64px;
  width: min(100% - 48px, 1150px);
  margin: 0 auto;
  padding: 144px 0 132px;
  border-bottom: 1px solid rgba(255,255,255,.16);
}
.air-intro__label { padding-top: 10px; color: rgba(255,255,255,.56); font: 500 13px/1.5 Inter, system-ui, sans-serif; }
.air-intro__copy { max-width: 800px; }
.air-intro h2 {
  margin: 0;
  color: #fff;
  font-family: 'Host Grotesk', Inter, system-ui, sans-serif;
  font-size: clamp(42px, 6vw, 82px);
  font-weight: 500;
  letter-spacing: -.052em;
  line-height: .98;
  text-wrap: balance;
}
.air-intro p { max-width: 610px; margin: 34px 0 0; color: rgba(255,255,255,.65); font-size: 17px; line-height: 1.6; }
.air-intro a { display: inline-flex; gap: 24px; margin-top: 34px; padding: 0 4px 8px; border-bottom: 2px solid #f0bf6c; color: #f0bf6c; font: 500 14px/1 Inter, system-ui, sans-serif; text-decoration: none; }

.air-statement { position: relative; isolation: isolate; min-height: 100svh; margin: 80px 0; overflow: hidden; }
.air-statement__image,
.air-statement__shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.air-statement__image { z-index: -2; object-fit: cover; object-position: center; }
.air-statement__shade { z-index: -1; background: rgba(2,6,12,.2); }
.air-statement__content { display: flex; min-height: 100svh; flex-direction: column; justify-content: center; padding: 60px 2vw; color: #fff; }
.air-statement__content span,
.air-statement__content em { display: block; font-family: 'Host Grotesk', Inter, system-ui, sans-serif; font-size: clamp(74px, 16vw, 250px); font-weight: 700; letter-spacing: -.07em; line-height: .72; }
.air-statement__content span:nth-child(2) { align-self: flex-end; }
.air-statement__content em { align-self: center; margin-top: .12em; color: #f0bf6c; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(62px, 11vw, 170px); font-weight: 400; }

@media (max-width: 720px) {
  .air-intro { grid-template-columns: 1fr; gap: 32px; width: min(100% - 36px, 1150px); padding: 92px 0; }
  .air-intro__label { padding: 0; }
  .air-intro p { margin-top: 24px; }
  .air-statement { min-height: 72svh; margin: 40px 0; }
  .air-statement__content { min-height: 72svh; }
}
</style>
