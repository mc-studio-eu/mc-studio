<script setup lang="ts">
const { t, tm, rt } = useI18n()

const icons: Record<string, string> = {
  revenue: 'i-lucide-trending-up',
  ownership: 'i-lucide-shield-check',
  relationship: 'i-lucide-heart-handshake',
  image: 'i-lucide-sparkles',
  data: 'i-lucide-database',
  retention: 'i-lucide-repeat'
}

const items = computed(() => {
  const raw = tm('benefits.items') as Record<string, any>
  return Object.entries(raw || {}).map(([key, item]: [string, any]) => ({
    key,
    icon: icons[key] || 'i-lucide-check',
    title: rt(item.title),
    text: rt(item.text)
  }))
})
</script>

<template>
  <section id="benefits" class="py-20 px-6 bg-[var(--bg-primary)] transition-colors duration-300">
    <div class="max-w-[1216px] mx-auto">
      <div class="text-center mb-12 md:mb-16">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-inter font-medium text-[#f0bf6c] bg-[#f0bf6c]/10 border border-[#f0bf6c]/20 mb-4">
          {{ t('benefits.badge') }}
        </span>
        <h2
          class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] text-[var(--text-primary)] mb-4"
          v-html="t('benefits.title')"
        />
        <p class="font-inter text-base text-[var(--text-secondary)] max-w-[640px] mx-auto">
          {{ t('benefits.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        <div
          v-for="item in items"
          :key="item.key"
          class="p-6 sm:p-7 rounded-2xl bg-white border border-[#1a1a1a]/8 shadow-[0_4px_20px_rgba(26,26,26,0.04)] transition-all duration-300 hover:border-[#f0bf6c]/50 hover:shadow-[0_8px_30px_rgba(240,191,108,0.10)]"
        >
          <div class="w-11 h-11 rounded-xl bg-[#f0bf6c]/10 flex items-center justify-center mb-5">
            <UIcon :name="item.icon" class="text-[#f0bf6c] text-xl" />
          </div>
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
