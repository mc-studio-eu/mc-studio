<script setup lang="ts">
interface ActionItem {
  title: string
  body: string
  number: string
}

defineProps<{
  title: string
  actions: ActionItem[]
}>()
</script>

<template>
  <section>
    <h2 class="font-manrope text-[44px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
      {{ title }}
    </h2>

    <div class="mt-6 space-y-5">
      <article
        v-for="action in actions"
        :key="action.title"
        class=""
      >
        <div class="border-t border-[var(--border-subtle)] pt-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-medium text-[var(--color-gold)]">
              {{ action.number }}
            </p>
            <h3 class="mt-2 font-manrope text-2xl font-semibold text-[var(--text-primary)]">
              {{ action.title }}
            </h3>
          </div>

          <p class="max-w-[52ch] text-sm leading-7 text-[var(--text-secondary)]">
            {{ action.body }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
