<script setup lang="ts">
const { t } = useI18n()

const groups = [
  { key: '0', icon: 'i-lucide-compass' },
  { key: '1', icon: 'i-lucide-palette' },
  { key: '2', icon: 'i-lucide-code-2' },
  { key: '3', icon: 'i-lucide-rocket' }
]

const itemKeys = ['0', '1', '2', '3']
</script>

<template>
  <section id="inclus" class="bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="mx-auto max-w-[1216px]">
      <div class="mx-auto mb-10 max-w-[660px] text-center md:mb-14">
        <h2
          class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] sm:text-3xl md:text-[32px]"
          v-html="t('landing_offer.included.title')"
        />
        <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          {{ t('landing_offer.included.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article
          v-for="group in groups"
          :key="group.key"
          class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[var(--card-shadow)] sm:p-7"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--accent-gold)]"
            >
              <UIcon :name="group.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 class="font-manrope text-lg font-semibold text-[var(--text-primary)]">
              {{ t(`landing_offer.included.groups.${group.key}.title`) }}
            </h3>
          </div>

          <ul class="mt-5 flex flex-col gap-3">
            <li
              v-for="item in itemKeys"
              :key="item"
              class="flex items-start gap-3 font-inter text-sm leading-[1.6] text-[var(--text-primary)]"
            >
              <span
                class="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--accent-gold)]"
              >
                <UIcon name="i-lucide-check" class="h-3 w-3" aria-hidden="true" />
              </span>
              <span>{{ t(`landing_offer.included.groups.${group.key}.items.${item}`) }}</span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>
