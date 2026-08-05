<script setup lang="ts">
const { t } = useI18n()

const items = [
  { key: '0', icon: 'i-lucide-refresh-cw' },
  { key: '1', icon: 'i-lucide-file-check' },
  { key: '2', icon: 'i-lucide-key-round' }
]
</script>

<template>
  <section class="bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="mx-auto max-w-[1216px]">
      <!-- Deliberately dark in both color modes, like the footer: the white-to-gold
           CTA below would wash out on an inverted (white) surface in dark mode. -->
      <div
        class="overflow-hidden rounded-3xl bg-[#101010] px-6 py-12 text-[#ffffff] sm:px-10 md:px-14 md:py-16"
      >
        <div class="mx-auto max-w-[620px] text-center">
          <h2
            class="font-manrope text-2xl font-medium leading-tight text-[#ffffff] sm:text-3xl md:text-[32px]"
            v-html="t('landing_offer.guarantee.title')"
          />
          <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[#ffffff] opacity-70">
            {{ t('landing_offer.guarantee.subtitle') }}
          </p>
        </div>

        <div class="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <article
            v-for="item in items"
            :key="item.key"
            class="rounded-2xl border p-6"
            style="
              border-color: color-mix(in srgb, currentColor 14%, transparent);
              background-color: color-mix(in srgb, currentColor 6%, transparent);
            "
          >
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-gold)] text-[#0f0f0f]"
            >
              <UIcon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 class="mt-5 font-manrope text-lg font-semibold text-[#ffffff]">
              {{ t(`landing_offer.guarantee.items.${item.key}.title`) }}
            </h3>
            <p class="mt-2 font-inter text-sm leading-[1.7] text-[#ffffff] opacity-70">
              {{ t(`landing_offer.guarantee.items.${item.key}.description`) }}
            </p>
          </article>
        </div>

        <div class="mt-10 flex flex-col items-center gap-4 text-center">
          <p class="font-manrope text-xl font-semibold text-[#ffffff] sm:text-2xl">
            {{ t('landing_offer.final.title') }}
          </p>
          <p class="max-w-[520px] font-inter text-sm leading-[1.7] text-[#ffffff] opacity-70">
            {{ t('landing_offer.final.subtitle') }}
          </p>

          <div class="mt-2 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="#contact"
              class="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(to_right,#ffffff_50%,#f0bf6c)] px-5 font-inter text-sm font-semibold text-[#0f0f0f] no-underline transition-all duration-200 hover:brightness-105"
            >
              {{ t('landing_offer.final.primary') }}
              <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href="https://api.whatsapp.com/send/?phone=%2B33781724683&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              class="flex min-h-11 items-center justify-center rounded-lg border px-5 font-inter text-sm font-medium text-[#ffffff] no-underline transition-opacity duration-200 hover:opacity-80"
              style="border-color: color-mix(in srgb, currentColor 24%, transparent)"
            >
              {{ t('landing_offer.final.secondary') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
