<script setup lang="ts">
defineProps<{
  kicker?: string
  title: string
  description?: string
  link: string
  ctaLabel: string
}>()
</script>

<template>
  <section class="border-t border-white/15 pt-6">
    <p v-if="kicker" class="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
      {{ kicker }}
    </p>
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" :class="kicker ? 'mt-4' : ''">
      <div>
        <h3 class="font-manrope text-3xl font-medium tracking-[-0.05em] text-white">
          {{ title }}
        </h3>
        <p v-if="description" class="mt-2 text-sm text-[var(--text-secondary)]">
          {{ description }}
        </p>
      </div>

      <NuxtLink
        :to="link"
        class="inline-flex items-center px-0 py-3 text-sm text-white/60 no-underline transition-all duration-200 hover:text-white"
      >
        {{ ctaLabel }}
        <UIcon name="i-heroicons-arrow-right-20-solid" class="ml-1 h-4 w-4" />
      </NuxtLink>
    </div>
  </section>
</template>
