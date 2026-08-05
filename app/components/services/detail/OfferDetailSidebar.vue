<script setup lang="ts">
interface OfferFact {
  label: string
  value: string
}

defineProps<{
  featured: boolean
  featuredTag: string
  icon: string
  title: string
  heroTitle: string
  heroSummary: string
  contactLink: string
  bookLabel: string
  freeCallLabel: string
  facts: OfferFact[]
  fitTitle: string
  fitBullets: string[]
}>()
</script>

<template>
  <div class="space-y-6 lg:sticky lg:top-8">
    <div>

      <p class="font-manrope text-[40px] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[52px]">
        {{ title }}
      </p>

      <p class="mt-5 text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
        {{ heroTitle }}
      </p>

      <p class="mt-4 text-sm leading-7 text-[var(--text-secondary)]/90">
        {{ heroSummary }}
      </p>

      <div class="mt-6 space-y-3">
        <NuxtLink
          :to="contactLink"
          class="inline-flex w-fit items-center gap-2.5 rounded-2xl bg-[linear-gradient(90deg,#ffffff_0%,#f6ebd5_48%,#f3c56f_100%)] p-1.5 pr-4 font-inter text-[#121212] no-underline shadow-[0_8px_24px_rgba(240,191,108,0.14)] transition-all duration-200 hover:brightness-105"
        >
          <NuxtImg
            src="/img/main/founder.jpeg"
            alt="MC Studio"
            class="h-10 w-10 rounded-xl object-cover"
          />

          <div class="flex flex-col items-start leading-none">
            <span class="text-[14px] font-semibold leading-[1.1]">
              {{ bookLabel }}
            </span>
            <span class="mt-0.5 text-[10px] font-normal text-[#121212]/60">
              {{ freeCallLabel }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div class="border-t border-[var(--border-subtle)] pt-6">
      <div class="grid gap-4">
        <div
          v-for="fact in facts"
          :key="fact.label"
          class="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4"
        >
          <p class="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            {{ fact.label }}
          </p>
          <p class="mt-2 text-sm font-medium text-[var(--text-primary)]">
            {{ fact.value }}
          </p>
        </div>
      </div>
    </div>

    <div class="border-t border-[var(--border-subtle)] pt-6">
      <h3 class="max-w-[18ch] font-manrope text-[30px] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)]">
        {{ fitTitle }}
      </h3>

      <ul class="mt-5 space-y-3">
        <li
          v-for="item in fitBullets"
          :key="item"
          class="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
        >
          <UIcon name="i-heroicons-check-circle-solid" class="mt-0.5 h-4 w-4 shrink-0 text-[#7bd88f]" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
