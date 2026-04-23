<script setup lang="ts">
interface DeliverableItem {
  title: string
  description: string
}

defineProps<{
  title: string
  deliverables: DeliverableItem[]
}>()
</script>

<template>
  <section>
    <h2 class="font-manrope text-[42px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
      {{ title }}
    </h2>

    <div class="mt-6 grid gap-4 lg:grid-cols-3">
      <article
        v-for="deliverable in deliverables"
        :key="deliverable.title"
        class="border-t border-[var(--border-subtle)] pt-5"
      >
        <h3 class="font-manrope text-xl font-semibold text-[var(--text-primary)]">
          {{ deliverable.title }}
        </h3>
        <p class="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {{ deliverable.description }}
        </p>
      </article>
    </div>
  </section>
</template>
