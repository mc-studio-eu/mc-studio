<script setup lang="ts">
const { locale } = useI18n()
const accent = computed(() => locale.value === 'fr' ? 'Du flou au réel.' : 'From vague to real.')
</script>

<template>
  <div class="air-hero-copy">
    <div class="air-hero-copy__eyebrow">
      <span class="air-hero-copy__dot" aria-hidden="true"></span>
      <span>{{ $t('hero.availability') }}</span>
      <span class="air-hero-copy__separator" aria-hidden="true"></span>
      <span>Lyon · France</span>
    </div>

    <h1 class="air-hero-copy__title">
      {{ $t('hero.title') }}
      <em>{{ accent }}</em>
    </h1>

    <p class="air-hero-copy__subtitle">{{ $t('hero.subtitle') }}</p>

    <div class="air-hero-copy__rating" aria-label="5 sur 5 sur Google">
      <span>★★★★★</span>
      <span>{{ $t('hero.reviews') }}</span>
    </div>
  </div>
</template>

<style scoped>
.air-hero-copy { width: min(100%, 1040px); text-align: center; color: #fff; }
.air-hero-copy__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  color: rgba(255,255,255,.74);
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
}
.air-hero-copy__dot { width: 7px; height: 7px; border-radius: 50%; background: #f0bf6c; box-shadow: 0 0 0 4px rgba(240,191,108,.16); }
.air-hero-copy__separator { width: 1px; height: 12px; background: rgba(255,255,255,.32); }
.air-hero-copy__title {
  max-width: 980px;
  margin: 0 auto;
  color: #fff;
  font-family: 'Host Grotesk', Inter, system-ui, sans-serif;
  font-size: clamp(48px, 7.15vw, 108px);
  font-weight: 500;
  letter-spacing: -.055em;
  line-height: .91;
  text-wrap: balance;
  -webkit-text-fill-color: currentColor;
}
.air-hero-copy__title em {
  display: block;
  margin-top: .14em;
  color: #f0bf6c;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  letter-spacing: -.045em;
}
.air-hero-copy__subtitle {
  max-width: 600px;
  margin: 30px auto 0;
  color: rgba(255,255,255,.78);
  font-family: Inter, system-ui, sans-serif;
  font-size: clamp(16px, 1.3vw, 19px);
  font-weight: 400;
  line-height: 1.55;
}
.air-hero-copy__rating { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 24px; color: rgba(255,255,255,.72); font: 500 12px/1.4 Inter, system-ui, sans-serif; }
.air-hero-copy__rating span:first-child { color: #f0bf6c; letter-spacing: .12em; }

@media (max-width: 640px) {
  .air-hero-copy__eyebrow { margin-bottom: 24px; }
  .air-hero-copy__title { font-size: clamp(42px, 13vw, 66px); line-height: .95; }
  .air-hero-copy__subtitle { max-width: 390px; margin-top: 24px; }
}
</style>
