<script setup lang="ts">
interface ClientLogo {
  name: string
  src: string
  kind: 'ra' | 'amg' | 'souji' | 'arises' | 'fontaines' | 'personal' | 'shika'
}

const clients: ClientLogo[] = [
  { name: 'R&A Energy', src: '/img/clients/ra-energy.svg', kind: 'ra' },
  { name: 'AMG Promotion', src: '/img/clients/amg-promotion.svg', kind: 'amg' },
  { name: 'Souji Nova', src: '/img/clients/souji-nova.png', kind: 'souji' },
  { name: 'Arises', src: '/img/clients/arises.svg', kind: 'arises' },
  { name: 'Fontaines VTC', src: '/img/clients/fontaines-vtc.svg', kind: 'fontaines' },
  { name: 'Personal', src: '/img/clients/personal.svg', kind: 'personal' },
  { name: 'Shika Consulting', src: '/img/clients/shika-consulting.webp', kind: 'shika' },
]

const activeOffset = ref(0)
const visibleClients = computed(() =>
  Array.from({ length: 3 }, (_, index) => clients[(activeOffset.value + index) % clients.length]),
)

let rotationTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  rotationTimer = setInterval(() => {
    activeOffset.value = (activeOffset.value + 3) % clients.length
  }, 3200)
})

onBeforeUnmount(() => {
  if (rotationTimer) clearInterval(rotationTimer)
})
</script>

<template>
  <div
    class="client-logos mt-7 w-full max-w-[420px] px-2 sm:mt-9"
    role="region"
    aria-roledescription="carousel"
    :aria-label="$t('hero.clients.aria_label')"
  >
    <div class="flex w-full items-center justify-center gap-2 sm:gap-4">
      <div
        v-for="slotIndex in 3"
        :key="slotIndex"
        class="client-logo-slot relative h-10 min-w-0 flex-1 overflow-hidden sm:h-12"
        :style="{ '--logo-delay': `${(slotIndex - 1) * 90}ms` }"
        role="group"
        :aria-label="visibleClients[slotIndex - 1]?.name"
      >
        <Transition name="client-logo-roll">
          <div
            v-if="visibleClients[slotIndex - 1]"
            :key="visibleClients[slotIndex - 1].name"
            class="client-logo absolute inset-0 flex items-center justify-center"
            :class="`client-logo--${visibleClients[slotIndex - 1].kind}`"
          >
            <img
              :src="visibleClients[slotIndex - 1].src"
              :alt="['fontaines', 'shika'].includes(visibleClients[slotIndex - 1].kind) ? visibleClients[slotIndex - 1].name : ''"
              class="client-logo-image shrink-0 object-contain"
              width="120"
              height="48"
              loading="eager"
              decoding="async"
            >
            <span
              v-if="!['fontaines', 'shika'].includes(visibleClients[slotIndex - 1].kind)"
              class="client-logo-name"
            >
              {{ visibleClients[slotIndex - 1].name }}
            </span>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.client-logo {
  gap: 0.35rem;
  padding-inline: 0.2rem;
  backface-visibility: hidden;
  will-change: transform, opacity;
  transition: opacity 180ms ease;
}

.client-logo-image,
.client-logo-name {
  opacity: 0.52;
  transition: opacity 180ms ease;
}

.client-logo-name {
  overflow: hidden;
  color: white;
  font-family: Inter, sans-serif;
  font-size: clamp(0.56rem, 1.08vw, 0.76rem);
  font-weight: 560;
  line-height: 1;
  letter-spacing: -0.025em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-logo:hover .client-logo-image,
.client-logo:hover .client-logo-name {
  opacity: 0.78;
}

.client-logo--ra .client-logo-image,
.client-logo--fontaines .client-logo-image,
.client-logo--shika .client-logo-image {
  filter: brightness(0) invert(1);
}

.client-logo--amg .client-logo-image,
.client-logo--personal .client-logo-image {
  filter: grayscale(1) invert(1);
}

.client-logo--souji .client-logo-image {
  filter: grayscale(1) brightness(1.5);
}

.client-logo--arises .client-logo-image {
  filter: grayscale(1);
}

.client-logo--ra .client-logo-image,
.client-logo--arises .client-logo-image {
  max-height: 27px;
  max-width: 30px;
}

.client-logo--amg .client-logo-image {
  max-height: 26px;
  max-width: 26px;
}

.client-logo--souji .client-logo-image {
  max-height: 34px;
  max-width: 39px;
}

.client-logo--amg .client-logo-name {
  font-size: clamp(0.52rem, 1vw, 0.7rem);
}

.client-logo--souji .client-logo-name {
  font-family: Georgia, 'Times New Roman', serif;
  letter-spacing: 0.01em;
}

.client-logo--fontaines .client-logo-image {
  max-height: 34px;
  max-width: 112px;
  transform: scale(2.2);
}

.client-logo--personal .client-logo-image {
  max-height: 26px;
  max-width: 26px;
}

.client-logo--shika .client-logo-image {
  max-height: 25px;
  max-width: 54px;
}

.client-logo-roll-enter-active,
.client-logo-roll-leave-active {
  transition:
    opacity 430ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 430ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--logo-delay);
}

.client-logo-roll-enter-from {
  opacity: 0;
  transform: translateY(22px);
}

.client-logo-roll-leave-to {
  opacity: 0;
  transform: translateY(-22px);
}

@media (prefers-reduced-motion: reduce) {
  .client-logo-roll-enter-active,
  .client-logo-roll-leave-active {
    transition: none;
  }
}
</style>
