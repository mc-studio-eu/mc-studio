<script setup lang="ts">
defineProps<{
  tag?: 'h1' | 'h2'
  align?: 'left' | 'center'
}>()
</script>

<template>
  <component
    :is="tag || 'h1'"
    class="m-0 font-[var(--font-display)] text-[clamp(44px,5vw,72px)] font-medium leading-[1.08] tracking-normal text-[var(--color-ink)] max-sm:text-[clamp(38px,12vw,54px)]"
    :class="(align || 'center') === 'center' ? 'text-center' : 'text-left'"
  >
    <slot />
  </component>
</template>
