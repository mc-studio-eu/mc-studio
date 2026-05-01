<script setup lang="ts">
const { t, tm, rt } = useI18n()

const steps = computed(() => {
  const stepKeys = ['business', 'design', 'development', 'launch']
  return stepKeys.map(key => {
    const items = tm(`services.steps.${key}.items`)
    return {
      number: t(`services.steps.${key}.number`),
      title: t(`services.steps.${key}.title`),
      description: t(`services.steps.${key}.description`),
      items: Object.values(items || {}).map((i: any) => rt(i))
    }
  })
})

const activeStep = ref(0)
</script>

<template>
  <section id="services" class="py-20 px-6 bg-[var(--bg-primary)] transition-colors duration-300">
    <div class="max-w-[1216px] mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 md:mb-16">
        <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-3 transition-colors duration-300 text-[var(--text-primary)]" v-html="t('services.title')">
        </h2>
        <p class="text-sm sm:text-base max-w-xl mx-auto leading-relaxed transition-colors duration-300 text-[var(--text-secondary)]" v-html="t('services.subtitle')">
        </p>
      </div>

      <!-- Steps Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="p-6 sm:p-8 rounded-2xl bg-white border border-[#1a1a1a]/8 shadow-[0_4px_20px_rgba(26,26,26,0.04)] transition-all duration-300 cursor-pointer"
          :class="activeStep === index ? 'border-[#f0bf6c]/50 shadow-[0_8px_30px_rgba(240,191,108,0.15)]' : 'hover:border-[#1a1a1a]/15'"
          @mouseenter="activeStep = index"
        >
          <!-- Step Number -->
          <div class="flex items-center gap-3 mb-5">
            <span class="text-[#f0bf6c] font-manrope font-bold text-2xl">{{ step.number }}</span>
          </div>

          <!-- Title -->
          <h3 class="font-manrope font-semibold text-lg mb-3 text-[var(--text-primary)]">{{ step.title }}</h3>
          
          <!-- Description -->
          <p class="font-inter text-sm leading-relaxed text-[var(--text-secondary)] mb-5">{{ step.description }}</p>

          <!-- Items -->
          <ul class="space-y-2">
            <li v-for="item in step.items" :key="item" class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <div class="w-5 h-5 rounded-md bg-[#f0bf6c]/10 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-check" class="w-3 h-3 text-[#f0bf6c]" />
              </div>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Distribution Note -->
      <div class="mt-10 text-center">
        <p class="font-inter text-sm text-[var(--text-secondary)] italic max-w-2xl mx-auto">
          {{ t('services.distribution_note') }}
        </p>
      </div>
    </div>
  </section>
</template>
