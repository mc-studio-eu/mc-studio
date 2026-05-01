<script setup lang="ts">
const { t, tm, rt } = useI18n()

const blocks = computed(() => {
  const raw = tm('pitch.blocks')
  return Object.values(raw || {}).map((block: any) => ({
    title: rt(block.title),
    text: rt(block.text)
  }))
})
</script>

<template>
  <section class="py-20 px-6 bg-[var(--bg-primary)] transition-colors duration-300">
    <div class="max-w-[1000px] mx-auto">
      <!-- Title -->
      <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] text-center mb-12 transition-colors duration-300 text-[var(--text-primary)]" v-html="t('pitch.title')">
      </h2>

      <!-- Blocks -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div v-for="(block, index) in blocks" :key="index" class="p-6 sm:p-8 rounded-2xl bg-white border border-[#1a1a1a]/8 shadow-[0_4px_20px_rgba(26,26,26,0.04)] transition-all duration-300 hover:border-[#f0bf6c]/50 hover:shadow-[0_8px_30px_rgba(240,191,108,0.10)]">
          <div class="w-10 h-10 rounded-xl bg-[#f0bf6c]/10 flex items-center justify-center mb-5">
            <span class="text-[#f0bf6c] font-manrope font-bold text-lg">{{ index + 1 }}</span>
          </div>
          <h3 class="font-manrope font-semibold text-lg mb-3 text-[var(--text-primary)]">{{ block.title }}</h3>
          <p class="font-inter text-sm leading-relaxed text-[var(--text-secondary)]">{{ block.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
