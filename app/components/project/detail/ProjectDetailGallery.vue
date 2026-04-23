<script setup lang="ts">
defineProps<{
  visitWebsiteLabel: string
  externalLink: string
  title: string
  activeScreenshot: string
  frameClass: string
  imageClass: string
  screenshots: string[]
  selectedIndex: number
}>()

const emit = defineEmits<{
  selectScreenshot: [index: number]
}>()
</script>

<template>
  <div class="rounded-[32px]">

    <div
      class="overflow-hidden rounded-[26px] border border-[var(--border-subtle)] bg-[#0f0f0f] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
      :class="frameClass"
    >
      <NuxtImg
        :src="activeScreenshot"
        :alt="title"
        class="w-full rounded-[20px] object-cover"
        :class="imageClass"
      />
    </div>

    <div class="mt-4 flex justify-between flex-wrap gap-3">
      <div class="flex flex-wrap gap-3">
      <button
        v-for="(screen, index) in screenshots"
        :key="screen + index"
        class="overflow-hidden rounded-2xl border p-1 transition-all duration-200"
        :class="selectedIndex === index ? 'border-[var(--color-gold)] bg-white/10' : 'border-[var(--border-subtle)] bg-transparent'"
        @click="emit('selectScreenshot', index)"
      >
        <NuxtImg
          :src="screen"
          :alt="`${title} preview ${index + 1}`"
          class="h-16 w-24 rounded-xl object-cover"
        />
      </button>
      </div>

      <div class="mb-5 flex flex-wrap items-center justify-end gap-4">
      <a
        :href="externalLink"
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] no-underline transition-colors duration-200 hover:text-[var(--text-primary)]"
      >
        {{ visitWebsiteLabel }}
        <UIcon name="i-heroicons-arrow-up-right-20-solid" class="h-4 w-4" />
      </a>
    </div>
    </div>
    
  </div>
</template>
