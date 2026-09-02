<script setup lang="ts">
defineProps<{
  title: string
  background: string
}>()
</script>

<template>
  <section class="relative grid min-h-[clamp(320px,52vw,420px)] place-items-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-paper-soft)] px-[clamp(18px,4vw,24px)] py-[clamp(60px,11vw,118px)] text-center" aria-labelledby="page-title">
    <img class="absolute inset-0 h-full w-full object-cover" :src="background" alt="" aria-hidden="true">
    <h1 id="page-title" class="relative z-10 m-0 text-balance font-[var(--font-display)] text-[clamp(28px,3vw,40px)] font-medium uppercase leading-[1.08] tracking-normal text-[var(--color-ink)]">
      <CreatorMark>{{ title }}</CreatorMark>
    </h1>
    <slot />
  </section>
</template>
