<script setup lang="ts">
const { t, tm, rt } = useI18n()

interface TeamMember {
  id: number
  name: string
  role: string
  initials: string
  image?: string
  accent: boolean
}

const team: TeamMember[] = [
  { id: 1, name: 'Mohamed Chettah', role: t('team.members.mohamed.role'), initials: 'MC', image: '/img/main/founder.jpeg', accent: false },
  { id: 2, name: 'Liam Faucitano', role: t('team.members.liam.role'), initials: 'LF', image: '/img/main/liam.jpg', accent: false },
  { id: 3, name: 'Mateo Carciu', role: t('team.members.mateo.role'), initials: 'MC', image: '/img/main/mateo.jpeg', accent: false },
  { id: 4, name: 'Romain Grange', role: t('team.members.romain.role'), initials: 'RG', image: '/img/main/romain.jpg', accent: false }
]

const specialistBadges = computed(() =>
  Object.values((tm('team.specialist_badges') as object) || {}).map((i) => rt(i))
)

const titleWithBreaks = (key: string) => {
  const raw = t(key)
  const [line1, line2] = raw.split('\n')

  // Keep output predictable: 1 line -> single span, 2 lines -> primary + secondary line
  if (!line2) {
    return `<span class="team-title__line team-title__line--primary">${line1}</span>`
  }

  return [
    `<span class="team-title__line team-title__line--primary">${line1}</span>`,
    `<span class="team-title__line team-title__line--secondary">${line2}</span>`
  ].join('')
}
</script>

<template>
  <section
    id="equipe"
    class="py-12 transition-colors duration-300 sm:px-0 px-6"
  >
    <div class="max-w-[1216px] mx-auto">
      <div class="text-center mb-10 md:mb-12">
        <h2 class="section-title font-manrope font-medium text-2xl sm:text-3xl md:text-[32px] mb-3 transition-colors duration-300 text-[var(--text-primary)]" v-html="$t('team.title')">
        </h2>
        <p class="text-sm sm:text-base max-w-xl mx-auto leading-relaxed transition-colors duration-300 text-[var(--text-secondary)]" v-html="$t('team.subtitle')">
        </p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- Specialists -->

        <!-- Collective -->
        <div class="team-card team-card--collective">
          <div class="team-card__inner">
            <div class="p-6 sm:p-8 md:p-10">
              <h3 class="team-title" v-html="titleWithBreaks('team.cards.collective.title')"></h3>
              <p class="team-paragraph">
                {{ t('team.cards.collective.text') }}
              </p>
            </div>

            <div class="px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div
                v-for="member in team"
                :key="member.id"
                class="team-member-pill"
              >
                <div
                  class="w-16 h-16 rounded-2xl overflow-hidden shrink-0 ring-1"
                  :class="member.accent ? 'ring-[var(--color-gold)]/25' : 'ring-black/10 dark:ring-white/10'"
                >
                  <NuxtImg
                    v-if="member.image"
                    :src="member.image"
                    :alt="member.name"
                    class="h-full w-full object-cover object-[center_18%]"
                    loading="lazy"
                  />
                  <div v-else class="h-full w-full flex items-center justify-center bg-black/10 dark:bg-white/5">
                    <span
                      class="font-inter font-semibold text-xs"
                      :class="member.accent ? 'text-[var(--color-gold)]' : 'text-[var(--text-secondary)]'"
                    >
                      {{ member.initials }}
                    </span>
                  </div>
                </div>

                <div class="min-w-0">
                  <p class="font-inter text-sm font-semibold text-[var(--text-primary)] leading-tight truncate">
                    {{ member.name }}
                  </p>
                  <p class="font-inter text-[11px] text-[var(--text-secondary)] leading-tight truncate">
                    {{ member.role }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div class="team-card team-card--specialists">
          <div class="team-card__inner">
            <div class="p-6 sm:p-8 md:p-10">
              <h3 class="team-title" v-html="titleWithBreaks('team.cards.specialists.title')"></h3>
              <p class="team-paragraph">
                {{ t('team.cards.specialists.text') }}
              </p>
            </div>

            <div class="px-6 sm:px-8 md:px-10 pb-8">
              <div class="team-marquee relative overflow-hidden">
                <div class="team-fade-left" aria-hidden="true"></div>
                <div class="team-fade-right" aria-hidden="true"></div>


                <UMarquee
                  pause-on-hover
                  :overlay="false"
                  :ui="{
                    root: '[--duration:26s]'
                  }"
                  class="mt-4"
                >
                  <div v-for="badge in specialistBadges" :key="badge" class="-mx-5">
                    <div class="team-pill">
                      {{ badge }}
                    </div>
                  </div>
                </UMarquee>
                <UMarquee
                  pause-on-hover
                  reverse
                  :overlay="false"
                  :ui="{
                    root: '[--duration:26s]'
                  }"
                  class="mt-4"
                >
                  <div v-for="badge in specialistBadges" :key="badge" class="-mx-5">
                    <div class="team-pill">
                      {{ badge }}
                    </div>
                  </div>
                </UMarquee>
                <UMarquee
                  pause-on-hover
                  :overlay="false"
                  :ui="{
                    root: '[--duration:26s]'
                  }"
                  class="mt-4"
                >
                  <div v-for="badge in specialistBadges" :key="badge" class="-mx-5">
                    <div class="team-pill">
                      {{ badge }}
                    </div>
                  </div>
                </UMarquee>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.team-marquee {
  padding: 2px 0;
}

.team-card {
  border-radius: 28px;
  border: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--bg-secondary) 72%, transparent);
  overflow: hidden;
  position: relative;
  min-height: 420px;
  box-shadow: var(--shadow-soft);
}

.team-card__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.team-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 280px at 18% 12%, rgba(240, 191, 108, 0.10), transparent 55%),
    radial-gradient(700px 240px at 80% 35%, rgba(240, 191, 108, 0.08), transparent 60%),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.06), transparent 38%);
  pointer-events: none;
}

.team-card::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 18px 46px rgba(88, 67, 33, 0.08);
  pointer-events: none;
}

.team-kicker {
  font-family: var(--font-inter, ui-sans-serif);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--text-secondary);
}

.team-title {
  font-family: var(--font-manrope, ui-sans-serif);
  font-weight: 500;
  font-size: 26px;
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin-top: 12px;
  color: var(--text-primary);
  max-width: 26ch;
  text-wrap: balance;
}

.team-title__line {
  display: block;
}

.team-title__line--secondary {
  margin-top: 8px;
  color: color-mix(in srgb, var(--text-primary) 84%, transparent);
}

.team-paragraph {
  font-family: var(--font-inter, ui-sans-serif);
  font-size: 0.95rem;
  line-height: 1.65;
  margin-top: 14px;
  max-width: 62ch;
  color: var(--text-secondary);
}

.team-pill {
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--border-subtle) 75%, transparent);
  background: color-mix(in srgb, var(--bg-primary) 58%, transparent);
  backdrop-filter: blur(10px);
  padding: 8px 14px;
  font-family: var(--font-inter, ui-sans-serif);
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  margin-right: -14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.team-member-pill {
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--border-subtle) 75%, transparent);
  background: color-mix(in srgb, var(--bg-primary) 60%, transparent);
  backdrop-filter: blur(12px);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 200ms ease, box-shadow 200ms ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.team-member-pill:hover {
  transform: translateY(-1px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 12px 30px rgba(0, 0, 0, 0.2);
}

.team-fade-left,
.team-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 48px;
  z-index: 5;
  pointer-events: none;
}

.team-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--bg-secondary) 0%, transparent 70%);
}

.team-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--bg-secondary) 0%, transparent 70%);
}
</style>
