<script setup lang="ts">
import type { CaseStudy } from '~/data/creator'

defineProps<{
  caseStudy: CaseStudy
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const imageWidthClass = (width?: 'narrow' | 'wide' | 'full') => {
  if (width === 'full') return 'w-full'
  if (width === 'narrow') return 'w-[min(580px,100%)]'
  return 'w-full'
}

const splitTextIntoParagraphs = (text: string) => {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [text]
  const paragraphs: string[] = []
  let current = ''

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence

    if (current && next.length > 210) {
      paragraphs.push(current)
      current = sentence
    } else {
      current = next
    }
  }

  if (current) {
    paragraphs.push(current)
  }

  return paragraphs
}
</script>

<template>
  <section class="mx-auto w-[calc(100%_-_40px)] pb-[18px] pt-[18px] max-sm:w-[calc(100%_-_28px)] max-sm:pb-3 max-sm:pt-3">
    <article class="case-study-frame relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      <div class="relative z-10 px-[clamp(18px,5vw,72px)] py-[clamp(56px,8vw,96px)] max-sm:pt-[88px]">
        <NuxtLink
          :to="localePath('/portfolio')"
          :aria-label="t('common.backPortfolio')"
          class="absolute left-[clamp(16px,2.4vw,32px)] top-[clamp(16px,2.4vw,32px)] inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 text-[var(--color-ink)] backdrop-blur transition-colors hover:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </NuxtLink>

        <section class="mx-auto w-full max-w-[760px]">
          <h1 class="case-study-title m-0 text-center text-balance font-[var(--font-display)] font-medium tracking-normal text-[var(--color-ink)]">
            <CreatorMark variant="title">{{ caseStudy.title }}</CreatorMark>
          </h1>

          <div class="mt-[clamp(34px,5vw,48px)] h-px w-full bg-[var(--color-border)]" />

          <div class="grid grid-cols-2 gap-[clamp(34px,8vw,88px)] pt-[clamp(44px,7vw,72px)] max-md:grid-cols-1 max-md:gap-10">
            <div>
              <h2 class="mb-3.5 text-balance font-[var(--font-display)] text-[clamp(23px,3vw,32px)] font-medium leading-[1.12]">{{ caseStudy.summaryTitle }}</h2>
              <div class="case-study-copy">
                <p
                  v-for="paragraph in splitTextIntoParagraphs(caseStudy.summary)"
                  :key="paragraph"
                >
                  {{ paragraph }}
                </p>
              </div>
              <div class="mt-7 flex flex-nowrap gap-x-2 gap-y-3 max-sm:flex-wrap">
                <CreatorButton to="/call">{{ t('common.bookCall') }}</CreatorButton>
                <span
                  class="inline-flex min-h-9 min-w-[154px] cursor-not-allowed items-center justify-center rounded-md bg-black px-3 py-2 text-center font-[Inter,var(--font-body)] text-[12px] font-medium leading-none text-white shadow-[var(--shadow-button)]"
                  aria-disabled="true"
                  role="button"
                >
                  {{ t('common.launchSeptember') }}
                </span>
                <CreatorButton
                  v-if="caseStudy.projectUrl"
                  :to="caseStudy.projectUrl"
                  variant="dark"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ t('common.seeProject') }}
                </CreatorButton>
              </div>
            </div>

            <div>
              <h2 class="mb-3.5 text-balance font-[var(--font-display)] text-[clamp(23px,3vw,32px)] font-medium leading-[1.12]">{{ caseStudy.aboutTitle }}</h2>
              <div class="case-study-copy">
                <p
                  v-for="paragraph in splitTextIntoParagraphs(caseStudy.about)"
                  :key="paragraph"
                >
                  {{ paragraph }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <template v-for="(block, index) in caseStudy.blocks" :key="index">
          <section
            v-if="block.type === 'image'"
            class="mx-auto w-full max-w-[760px] pt-[clamp(48px,7vw,72px)]"
          >
            <img
              class="mx-auto block rounded-lg border border-[var(--color-border)] bg-white"
              :class="imageWidthClass(block.width)"
              :src="block.src"
              :alt="block.alt"
            >
          </section>

          <section
            v-else-if="block.type === 'text'"
            class="mx-auto w-full max-w-[760px] pt-[clamp(48px,7vw,72px)]"
          >
            <h2 class="mb-3.5 text-balance font-[var(--font-display)] text-[clamp(23px,3vw,32px)] font-medium leading-[1.12]">{{ block.title }}</h2>
            <div class="case-study-copy">
              <p
                v-for="paragraph in splitTextIntoParagraphs(block.body)"
                :key="paragraph"
              >
                {{ paragraph }}
              </p>
            </div>
          </section>

          <section
            v-else-if="block.type === 'split'"
            class="mx-auto grid w-full max-w-[760px] grid-cols-2 gap-[clamp(34px,8vw,112px)] pt-[clamp(48px,7vw,72px)] max-md:grid-cols-1"
          >
            <div v-for="(column, columnIndex) in block.columns" :key="columnIndex">
              <h2 class="mb-3.5 text-balance font-[var(--font-display)] text-[clamp(23px,3vw,32px)] font-medium leading-[1.12]">{{ column.title }}</h2>
              <div class="case-study-copy">
                <p
                  v-for="paragraph in splitTextIntoParagraphs(column.body)"
                  :key="paragraph"
                >
                  {{ paragraph }}
                </p>
              </div>
            </div>
          </section>

          <section
            v-else-if="block.type === 'deliverables'"
            class="mx-auto w-full max-w-[760px] pt-[clamp(48px,7vw,72px)] text-center"
          >
            <p class="mb-4 font-[var(--font-display)] text-[13px] font-bold uppercase tracking-[0.08em] text-violet-700">{{ block.title ?? t('caseStudy.deliverables') }}</p>
            <ul class="m-0 grid list-none grid-cols-2 gap-3 p-0 max-md:grid-cols-1">
              <li
                v-for="deliverable in block.items"
                :key="deliverable"
                class="break-words rounded-lg border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-[18px] font-bold"
              >
                {{ deliverable }}
              </li>
            </ul>
          </section>
        </template>
      </div>
    </article>
  </section>
</template>

<style scoped>
.case-study-frame {
  background-image: url('/assets/creator/portfolio-bg.png');
  background-position: top center;
  background-repeat: no-repeat;
  background-size: 100% auto;
}

.case-study-title {
  overflow-wrap: anywhere;
  font-size: clamp(30px, 3.6vw, 52px);
  line-height: 1.08;
}

.case-study-title :deep(.hl) {
  font-size: inherit;
  line-height: inherit;
}

.case-study-copy {
  color: var(--color-ink);
  font-size: clamp(15px, 1.6vw, 16px);
  line-height: 1.6;
}

.case-study-copy p {
  margin: 0;
}

.case-study-copy p + p {
  margin-top: 1.15em;
}

@media (max-width: 640px) {
  .case-study-title {
    font-size: clamp(30px, 3.6vw, 52px);
    line-height: 1.08;
  }
}
</style>
