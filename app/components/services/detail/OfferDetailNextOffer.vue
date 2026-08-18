<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  description: string
  link: string
  ctaLabel: string
}>()
</script>

<template>
  <section class="rounded-[28px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
    <p class="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
      {{ kicker }}
    </p>
    <div class="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 class="font-manrope text-3xl font-semibold text-[var(--text-primary)]">
          {{ title }}
        </h3>
        <p class="mt-2 text-sm text-[var(--text-secondary)]">
          {{ description }}
        </p>
      </div>

      <NuxtLink
        :to="link"
        class="site-cta inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] px-5 py-3 text-sm text-[var(--text-primary)] no-underline transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
      >
        {{ ctaLabel }}
        <UIcon name="i-heroicons-arrow-right-20-solid" class="ml-1 h-4 w-4" />
      </NuxtLink>
    </div>
  </section>
</template>
