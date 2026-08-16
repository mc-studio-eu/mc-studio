<template>
  <div class="air-hero-actions">
    <a href="#contact" class="air-hero-actions__primary">
      {{ $t('hero.cta.book') }}
      <span aria-hidden="true">↗</span>
    </a>
    <a
      href="https://api.whatsapp.com/send/?phone=%2B33781724683&text&type=phone_number&app_absent=0"
      target="_blank"
      rel="noopener noreferrer"
      class="air-hero-actions__secondary"
    >
      {{ $t('hero.cta.whatsapp') }}
    </a>
  </div>
</template>

<style scoped>
.air-hero-actions { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 30px; }
.air-hero-actions a { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; gap: 18px; padding: 0 18px; border-radius: 8px; font: 500 14px/1 Inter, system-ui, sans-serif; text-decoration: none; transition: background 180ms ease, color 180ms ease; }
.air-hero-actions__primary { border: 1px solid #f0bf6c; background: #f0bf6c; color: #1b1b1b; }
.air-hero-actions__primary:hover { background: #f7d699; }
.air-hero-actions__secondary { border: 1px solid rgba(255,255,255,.68); background: rgba(5,11,20,.12); color: #fff; backdrop-filter: blur(12px); }
.air-hero-actions__secondary:hover { background: rgba(255,255,255,.08); }

@media (max-width: 520px) {
  .air-hero-actions { width: 100%; flex-direction: column; }
  .air-hero-actions a { width: min(100%, 320px); }
}
</style>
