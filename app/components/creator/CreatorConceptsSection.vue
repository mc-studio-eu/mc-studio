<script setup lang="ts">
const { t, tm, rt } = useI18n()

const items = computed(() => {
  const raw = tm('concepts.items') as Record<string, any>
  return Object.values(raw || {}).map((item: any) => ({
    tag: rt(item.tag),
    title: rt(item.title),
    text: rt(item.text)
  }))
})
</script>

<template>
  <section id="concepts" class="py-20 px-6 bg-[var(--bg-primary)] transition-colors duration-300">
    <div class="max-w-[1216px] mx-auto">
      <div class="text-center mb-12 md:mb-16">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-inter font-medium text-[#f0bf6c] bg-[#f0bf6c]/10 border border-[#f0bf6c]/20 mb-4">
          {{ t('concepts.badge') }}
        </span>
        <h2
          class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] text-[var(--text-primary)] mb-4"
          v-html="t('concepts.title')"
        />
        <p class="font-inter text-base text-[var(--text-secondary)] max-w-[640px] mx-auto">
          {{ t('concepts.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="group p-6 sm:p-7 rounded-2xl bg-white border border-[#1a1a1a]/8 shadow-[0_4px_20px_rgba(26,26,26,0.04)] transition-all duration-300 hover:border-[#f0bf6c]/50 hover:shadow-[0_8px_30px_rgba(240,191,108,0.10)] hover:-translate-y-1"
        >
          <span class="inline-block px-2.5 py-1 rounded-md text-[11px] font-inter font-medium text-[#f0bf6c] bg-[#f0bf6c]/10 mb-4">
            {{ item.tag }}
          </span>
          <h3 class="font-manrope font-semibold text-lg text-[var(--text-primary)] mb-2.5">
            {{ item.title }}
          </h3>
          <p class="font-inter text-sm leading-relaxed text-[var(--text-secondary)]">
            {{ item.text }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
