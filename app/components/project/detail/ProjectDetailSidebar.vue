<script setup lang="ts">
interface ProjectFact {
  label: string
  value: string
}

defineProps<{
  title: string
  summary: string
  contactLink: string
  bookLabel: string
  freeCallLabel: string
  projectLabel: string
  aboutCompanyLabel: string
  aboutCompany: string
  facts: ProjectFact[]
  supportTitle: string
  supportBullets: string[]
  contactUsLabel: string
}>()
</script>

<template>
  <div class="space-y-6 lg:top-8">
    <div class="">
      <div class="mb-5">
        <p class="font-manrope text-[38px] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)]">
          {{ title }}
        </p>
      </div>

      <p class="max-w-[36ch] text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
        {{ summary }}
      </p>

      <div class="mt-6 space-y-3">
        <NuxtLink
          :to="contactLink"
          class="inline-flex w-fit items-center gap-2.5 rounded-2xl bg-[linear-gradient(90deg,#ffffff_0%,#f6ebd5_48%,#f3c56f_100%)] p-1.5 pr-4 font-inter text-[#121212] no-underline shadow-[0_8px_24px_rgba(240,191,108,0.14)] transition-all duration-200 hover:brightness-105"
        >
          <NuxtImg
            src="/img/main/founder.png"
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
      <div class="space-y-5">
        <div>
          <h2 class="font-manrope text-2xl font-semibold text-[var(--text-primary)]">
            {{ aboutCompanyLabel }}
          </h2>
          <p class="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            {{ aboutCompany }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="fact in facts"
            :key="fact.label"
            class="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-4"
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
    </div>
  </div>
</template>
