<script setup lang="ts">
const { t } = useI18n()

const itemKeys = ['0', '1', '2', '3', '4', '5', '6', '7']
const openItems = ref<string[]>([])

const isOpen = (key: string) => openItems.value.includes(key)

const toggleItem = (key: string) => {
  const index = openItems.value.indexOf(key)
  if (index > -1) openItems.value.splice(index, 1)
  else openItems.value.push(key)
}
</script>

<template>
  <section id="faq" class="bg-[var(--bg-primary)] px-6 py-16 transition-colors duration-300 md:py-20">
    <div class="mx-auto max-w-[1216px]">
      <div class="grid grid-cols-1 gap-12 md:grid-cols-[320px_1fr] md:gap-16">
        <div class="flex flex-col">
          <h2
            class="section-title font-manrope text-2xl font-medium leading-tight text-[var(--text-primary)] sm:text-3xl md:text-[32px]"
            v-html="t('crm_offer.faq.title')"
          />
          <p class="mt-4 font-inter text-[15px] leading-[1.7] text-[var(--text-secondary)]">
            {{ t('crm_offer.faq.subtitle') }}
          </p>

          <div class="mt-8 flex items-center gap-4">
            <NuxtImg
              src="/img/main/founder.jpeg"
              alt="Mohamed Chettah"
              width="72"
              height="72"
              class="h-[72px] w-[72px] shrink-0 rounded-xl object-cover object-[center_18%] ring-1 ring-black/10"
            />
            <div class="flex flex-col gap-1">
              <span class="font-inter text-base font-semibold text-[var(--text-primary)]">Mohamed Chettah</span>
              <span class="font-inter text-sm text-[var(--text-secondary)]">{{ t('faq.founder_role') }}</span>
            </div>
          </div>

          <p class="mt-6 font-inter text-sm leading-relaxed text-[var(--text-secondary)]">
            {{ t('faq.contact_text') }}
          </p>

          <a
            href="https://api.whatsapp.com/send/?phone=%2B33781724683&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 w-fit rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 font-inter text-sm font-medium text-[var(--text-primary)] no-underline transition-colors duration-200 hover:border-[var(--border-color)]"
          >
            {{ t('faq.whatsapp_btn') }}
          </a>
        </div>

        <div class="flex flex-col">
          <div
            v-for="key in itemKeys"
            :key="key"
            class="border-b border-[var(--border-subtle)]"
          >
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent py-5 text-left"
              :aria-expanded="isOpen(key)"
              @click="toggleItem(key)"
            >
              <span class="font-inter text-[15px] font-medium leading-normal text-[var(--text-primary)]">
                {{ t(`crm_offer.faq.items.${key}.question`) }}
              </span>
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                :class="
                  isOpen(key)
                    ? 'bg-[var(--color-gold)] text-[#0f0f0f]'
                    : 'bg-[var(--border-subtle)] text-[var(--text-secondary)]'
                "
              >
                <UIcon :name="isOpen(key) ? 'i-lucide-minus' : 'i-lucide-plus'" class="h-4 w-4" />
              </span>
            </button>

            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-300 ease-in"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-[320px]"
              leave-from-class="opacity-100 max-h-[320px]"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="isOpen(key)" class="overflow-hidden pb-6">
                <p class="font-inter text-sm leading-relaxed text-[var(--text-secondary)]">
                  {{ t(`crm_offer.faq.items.${key}.answer`) }}
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
