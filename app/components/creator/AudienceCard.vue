<script setup lang="ts">
const props = defineProps<{
  label: string
  visual: 'stack' | 'chart' | 'card' | 'calendar'
  minHeight: number
}>()

// main.css sets `img, svg { max-width: 100% }` outside any cascade layer, which
// beats Tailwind's layered `max-w-*` utilities — so the cap lives on a wrapper.
const visualWidth = computed(() => ({
  stack: 'max-w-[240px]',
  chart: 'max-w-[240px]',
  card: 'max-w-[200px]',
  calendar: 'max-w-[220px]'
}[props.visual]))
</script>

<template>
  <article
    class="flex flex-col items-center justify-between gap-5 rounded-[16px] bg-[#f7f6f0] px-6 py-8 max-md:min-h-0"
    :style="{ minHeight: `${minHeight}px` }"
  >
    <div class="flex w-full flex-1 items-center justify-center" aria-hidden="true">
      <div class="w-full" :class="visualWidth">
        <svg
          v-if="visual === 'stack'"
          class="block h-auto w-full"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="34" y="8" width="172" height="34" rx="10" fill="#ffffff" />
          <rect x="18" y="44" width="204" height="34" rx="10" fill="#be98ff" />
          <rect x="34" y="80" width="172" height="34" rx="10" fill="#ffffff" />
        </svg>

        <svg
          v-else-if="visual === 'chart'"
          class="block h-auto w-full"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="16" y="76" width="32" height="34" rx="8" fill="#ffffff" />
          <rect x="60" y="58" width="32" height="52" rx="8" fill="#ffffff" />
          <rect x="104" y="38" width="32" height="72" rx="8" fill="#be98ff" />
          <rect x="148" y="22" width="32" height="88" rx="8" fill="#be98ff" />
          <rect x="192" y="8" width="32" height="102" rx="8" fill="#7c3aed" />
        </svg>

        <svg
          v-else-if="visual === 'card'"
          class="block h-auto w-full"
          viewBox="0 0 200 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="8" width="184" height="114" rx="12" fill="#ffffff" />
          <circle cx="36" cy="40" r="14" fill="#be98ff" />
          <rect x="60" y="32" width="104" height="8" rx="4" fill="#ece9f7" />
          <rect x="60" y="48" width="72" height="8" rx="4" fill="#ece9f7" />
          <rect x="24" y="78" width="152" height="10" rx="5" fill="#f2f1ea" />
          <rect x="24" y="96" width="112" height="10" rx="5" fill="#f2f1ea" />
        </svg>

        <svg
          v-else
          class="block h-auto w-full"
          viewBox="0 0 220 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="8" width="204" height="144" rx="12" fill="#ffffff" />
          <rect x="8" y="8" width="204" height="34" rx="12" fill="#f2f1ea" />
          <rect x="24" y="20" width="60" height="10" rx="5" fill="#c9c6bb" />
          <rect x="24" y="58" width="172" height="26" rx="8" fill="#be98ff" />
          <rect x="24" y="94" width="172" height="26" rx="8" fill="#ece9f7" />
          <circle cx="40" cy="132" r="6" fill="#7c3aed" />
          <rect x="56" y="127" width="88" height="10" rx="5" fill="#f2f1ea" />
        </svg>
      </div>
    </div>

    <p class="m-0 text-center font-[Inter,var(--font-body)] text-[16px] leading-[1.5] text-[var(--color-ink)]">
      {{ label }}
    </p>
  </article>
</template>
