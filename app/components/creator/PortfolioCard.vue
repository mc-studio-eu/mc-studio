<script setup lang="ts">
import type { CaseStudy } from '~/data/creator'

defineProps<{
  caseStudy: CaseStudy
  large?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <article class="mx-auto grid w-full max-w-[760px] gap-[22px]">
    <NuxtLink class="group block" :to="localePath(`/portfolio/${caseStudy.slug}`)" :aria-label="t('portfolio.viewProjectLabel', { title: caseStudy.title })">
      <span class="block overflow-hidden rounded-lg border border-[var(--color-border)] bg-white p-[clamp(12px,2vw,16px)]">
        <span class="relative block overflow-hidden rounded-md">
          <img class="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-[1.012] group-focus-visible:scale-[1.012]" :src="caseStudy.heroImage" :alt="caseStudy.title">
          <span class="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-14 translate-y-full items-center justify-center bg-[var(--color-purple-strong)] px-4 py-3 text-center text-[18px] font-medium leading-tight text-white opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            {{ t('common.view') }}
          </span>
        </span>
      </span>
    </NuxtLink>
    <div class="flex items-start justify-between gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-3">
      <div class="grid min-w-0 gap-2">
        <h2 class="m-0 text-balance font-[var(--font-display)] text-[clamp(21px,2.4vw,28px)] font-medium leading-[1.05]">
          <NuxtLink :to="localePath(`/portfolio/${caseStudy.slug}`)">
            <CreatorMark variant="cardTitle">{{ caseStudy.title }}</CreatorMark>
          </NuxtLink>
        </h2>
        <p class="m-t shrink-0 text-[clamp(15px,1.8vw,20px)] leading-tight text-[var(--color-ink)] max-sm:shrink">{{ caseStudy.audience }}</p>
      </div>
      <NuxtLink :to="localePath(`/portfolio/${caseStudy.slug}`)" class="shrink-0 text-lg leading-tight text-[var(--color-ink)] max-sm:shrink text-violet-400">{{ t('common.seeProject') }}</NuxtLink>
    </div>
  </article>
</template>
