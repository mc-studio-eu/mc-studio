<script setup lang="ts">
defineProps<{
  title: string
  items: string[]
  bulletClass: string
}>()
</script>

<template>
  <section>
    <h2 class="font-manrope text-[44px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
      {{ title }}
    </h2>

    <ul class="mt-5 space-y-4">
      <li
        v-for="item in items"
        :key="item"
        class="flex items-start gap-3 text-sm leading-7 text-[var(--text-primary)]"
      >
        <span class="mt-3 h-1.5 w-1.5 shrink-0 rounded-full" :class="bulletClass"></span>
        <span>{{ item }}</span>
      </li>
    </ul>
  </section>
</template>
