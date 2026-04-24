<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  description: string
  link: string
}>()
</script>

<template>
  <NuxtLink
    :to="link"
    class="block rounded-[28px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 no-underline transition-colors duration-200 hover:border-[var(--color-gold)]"
  >
    <p class="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
      {{ kicker }}
    </p>
    <div class="mt-4">
      <h3 class="font-manrope text-3xl font-semibold text-[var(--text-primary)]">
        {{ title }}
      </h3>
      <p class="mt-2 text-sm text-[var(--text-secondary)]">
        {{ description }}
      </p>
    </div>
  </NuxtLink>
</template>
