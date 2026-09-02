<script setup lang="ts">
const { t } = useI18n()

// The Figma bento reuses third-party marketing illustrations, so each card ships
// with a neutral abstract visual instead. Swap `visual` for a real asset later.
const cards = [
  { key: 'product', visual: 'stack', column: 'left', minHeight: 227 },
  { key: 'revenue', visual: 'chart', column: 'left', minHeight: 227 },
  { key: 'launch', visual: 'card', column: 'right', minHeight: 232 },
  { key: 'growth', visual: 'calendar', column: 'right', minHeight: 395 }
] as const

const leftCards = cards.filter((card) => card.column === 'left')
const rightCards = cards.filter((card) => card.column === 'right')
</script>

<template>
  <section class="mx-auto w-[min(890px,calc(100%-40px))] py-[clamp(48px,7vw,90px)]" aria-labelledby="audience-title">
    <div class="grid grid-cols-[500fr_366fr] gap-6 max-md:grid-cols-1">
      <div class="flex flex-col gap-6">
        <h2
          id="audience-title"
          class="m-0 font-[Inter,var(--font-body)] text-[clamp(22px,2.8vw,28px)] font-bold leading-[1.21] text-[var(--color-ink)]"
        >
          {{ t('home.audience.titleLine1') }}<br>{{ t('home.audience.titleLine2') }}
        </h2>

        <CreatorAudienceCard
          v-for="card in leftCards"
          :key="card.key"
          :visual="card.visual"
          :min-height="card.minHeight"
          :label="t(`home.audience.cards.${card.key}`)"
        />
      </div>

      <div class="flex flex-col gap-6">
        <CreatorAudienceCard
          v-for="card in rightCards"
          :key="card.key"
          :visual="card.visual"
          :min-height="card.minHeight"
          :label="t(`home.audience.cards.${card.key}`)"
        />
      </div>
    </div>
  </section>
</template>
