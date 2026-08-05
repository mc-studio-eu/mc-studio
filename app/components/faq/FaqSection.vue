<script setup lang="ts">
import gsap from 'gsap'

// Types
interface FaqItem {
  id: number
  question: string
  answer: string
}

// Data
const { t } = useI18n();

// Text slide animation refs
const faqWhatsappBtn = ref(null)
const faqWhatsappWrapper = ref(null)
useTextSlideAnimation(faqWhatsappBtn, faqWhatsappWrapper)

const faqItems = computed<FaqItem[]>(() => [
  {
    id: 0,
    question: t('faq.items.0.question'),
    answer: t('faq.items.0.answer')
  },
  {
    id: 1,
    question: t('faq.items.1.question'),
    answer: t('faq.items.1.answer')
  },
  {
    id: 5,
    question: t('faq.items.5.question'),
    answer: t('faq.items.5.answer')
  },
  {
    id: 2,
    question: t('faq.items.2.question'),
    answer: t('faq.items.2.answer')
  },
  {
    id: 3,
    question: t('faq.items.3.question'),
    answer: t('faq.items.3.answer')
  },
  {
    id: 4,
    question: t('faq.items.4.question'),
    answer: t('faq.items.4.answer')
  }
])


// Track open items
const openItems = ref<number[]>([])

const toggleItem = (id: number) => {
  const index = openItems.value.indexOf(id)
  if (index > -1) {
    openItems.value.splice(index, 1)
  } else {
    openItems.value.push(id)
  }
}

const isOpen = (id: number) => openItems.value.includes(id)

// Founder info
const founder = computed(() => ({
  name: 'Mohamed Chettah',
  role: t('faq.founder_role')
}))
</script>

<template>
  <section id="faq" class="py-20 px-6 bg-[var(--bg-primary)] transition-colors duration-300">
    <div class="max-w-[1216px] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 md:gap-16">
        <!-- Left Column - Info -->
        <div class="flex flex-col">
          <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-8 transition-colors duration-300 text-[var(--text-primary)]" v-html="$t('faq.title')">
          </h2>
          <p class="font-inter text-base text-[var(--text-secondary)] mb-4 transition-colors duration-300">{{ $t('faq.subtitle') }}</p>

          <!-- Founder Card -->
          <div class="flex items-center gap-4 py-4">
            <div class="w-[72px] h-[72px] rounded-xl bg-[linear-gradient(135deg,var(--color-gold)_0%,#e8a84c_100%)] flex items-center justify-center font-inter font-bold text-lg text-black shrink-0 relative overflow-hidden shadow-[0_16px_32px_rgba(15,15,15,0.14)] ring-1 ring-black/10">
              <NuxtImg
                src="/img/main/founder.jpeg"
                alt="Avatar de Mohamed Chettah"
                width="72"
                height="72"
                class="rounded-xl object-cover object-[center_18%] absolute inset-0 w-full h-full"
              />
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-inter text-base font-semibold text-[var(--text-primary)] transition-colors duration-300">{{ founder.name }}</span>
              <span class="font-inter text-sm text-[var(--text-secondary)] transition-colors duration-300">{{ founder.role }}</span>
            </div>
          </div>

          <p class="font-inter text-sm leading-relaxed text-[var(--text-secondary)] mt-4 transition-colors duration-300">
            {{ $t('faq.contact_text') }}
          </p>

          <a ref="faqWhatsappBtn" href="https://api.whatsapp.com/send/?phone=%2B33781724683&text&type=phone_number&app_absent=0" target="_blank"
            class="mt-2 w-fit px-4 py-2 rounded-md font-medium text-sm cursor-pointer bg-[#0F0F0F] text-white hover:bg-[#333] transition-colors duration-200 no-underline inline-block"
          >
            <span class="text-slide-container h-[20px]">
              <span ref="faqWhatsappWrapper" class="text-slide-wrapper">
                <span class="text-slide-text h-[20px] leading-[20px]">{{ $t('faq.whatsapp_btn') }}</span>
                <span class="text-slide-text h-[20px] leading-[20px]">{{ $t('faq.whatsapp_btn') }}</span>
              </span>
            </span>
          </a>
        </div>

        <!-- Right Column - Accordion -->
        <div class="flex flex-col">
          <div 
            v-for="item in faqItems" 
            :key="item.id"
            class="border-b border-[var(--border-subtle)] transition-colors duration-300"
          >
            <button 
              class="flex items-center justify-between gap-4 w-full py-6 bg-transparent border-none cursor-pointer text-left"
              @click="toggleItem(item.id)"
            >
              <span class="font-inter text-[15px] font-medium text-[var(--text-primary)] leading-normal transition-colors duration-300">{{ item.question }}</span>
              <div class="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-[var(--border-subtle)] text-[var(--text-secondary)] transition-all duration-200" :class="{ '!bg-[var(--color-gold)] !text-[#0f0f0f]': isOpen(item.id) }">
                <UIcon :name="isOpen(item.id) ? 'i-lucide-minus' : 'i-lucide-plus'" />
              </div>
            </button>
            <Transition 
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-300 ease-in"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-[200px]"
              leave-from-class="opacity-100 max-h-[200px]"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="isOpen(item.id)" class="pb-6 overflow-hidden">
                <p class="font-inter text-sm leading-relaxed text-[var(--text-secondary)] transition-colors duration-300 whitespace-pre-line">{{ item.answer }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-slide-container {
  display: block;
  position: relative;
  overflow: hidden;
}

.text-slide-wrapper {
  display: flex;
  flex-direction: column;
}

.text-slide-text {
  display: block;
}
</style>
