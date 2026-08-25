<script setup lang="ts">
import { useProjectCards } from '../../composables/useProjectCards'

const localePath = useLocalePath()
const { filterProjects } = useProjectCards()

const activeIndex = ref(0)
const isPaused = ref(false)

const filteredProjects = computed(() => filterProjects('all'))
const loadedProjects = reactive(new Set<string>())

let autoplayTimer: ReturnType<typeof setInterval> | undefined

const goToProject = (index: number) => {
  if (!filteredProjects.value.length) return
  activeIndex.value = (index + filteredProjects.value.length) % filteredProjects.value.length
}

const markProjectAsLoaded = (slug: string) => {
  loadedProjects.add(slug)
}

const showNextProject = () => {
  const projectCount = filteredProjects.value.length

  for (let offset = 1; offset <= projectCount; offset += 1) {
    const nextIndex = (activeIndex.value + offset) % projectCount
    const nextProject = filteredProjects.value[nextIndex]

    if (nextProject && loadedProjects.has(nextProject.slug)) {
      goToProject(nextIndex)
      return
    }
  }
}

onMounted(() => {
  autoplayTimer = setInterval(() => {
    if (!isPaused.value && filteredProjects.value.length > 1) showNextProject()
  }, 1800)
})

onBeforeUnmount(() => {
  if (autoplayTimer) clearInterval(autoplayTimer)
})
</script>

<template>
  <section
    id="projets"
    class="overflow-hidden bg-[var(--bg-primary)] px-4 py-16 transition-colors duration-300 sm:px-6 md:py-20"
  >
    <div class="mx-auto max-w-[1216px]">
      <div class="mb-8 sm:mb-10">
        <div class="max-w-xl">
          <h2
            class="section-title font-manrope text-2xl font-medium text-[var(--text-primary)] transition-colors duration-300 sm:text-3xl md:text-[32px]"
            v-html="$t('projects.title')"
          />
          <p
            class="mt-3 font-inter text-sm leading-relaxed text-[var(--text-secondary)] transition-colors duration-300 sm:text-base"
            v-html="$t('projects.subtitle')"
          />
        </div>
      </div>

      <div
        class="project-showcase relative isolate overflow-hidden rounded-[22px] border border-[var(--border-subtle)] sm:rounded-[30px]"
        role="region"
        :aria-label="$t('projects.showcase.aria_label')"
        @mouseenter="isPaused = true"
        @mouseleave="isPaused = false"
        @focusin="isPaused = true"
        @focusout="isPaused = false"
      >
        <div class="project-grid-pattern absolute inset-0 -z-10" />
        <div class="project-glow project-glow-one absolute -z-10" />
        <div class="project-glow project-glow-two absolute -z-10" />

        <div class="relative min-h-[460px] p-3 sm:min-h-[660px] sm:p-5 lg:min-h-[820px] lg:p-6">
          <NuxtLink
            v-for="(project, index) in filteredProjects"
            :key="project.slug"
            :to="localePath(`/projects/${project.slug}`)"
            class="group absolute inset-x-6 inset-y-4 block overflow-hidden rounded-[16px] border border-white/15 bg-[#0d0d0d] text-white no-underline shadow-[0_28px_80px_rgba(0,0,0,0.42)] transition-opacity duration-150 ease-linear sm:inset-x-10 sm:inset-y-6 sm:rounded-[22px] lg:inset-x-14 lg:inset-y-8"
            :class="index === activeIndex ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'"
            :aria-label="$t('projects.showcase.open_project', { project: project.title })"
            :aria-hidden="index === activeIndex ? undefined : 'true'"
            :tabindex="index === activeIndex ? undefined : -1"
          >
            <NuxtImg
              :src="project.image"
              :alt="project.title"
              width="1600"
              height="1000"
              loading="eager"
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              @load="markProjectAsLoaded(project.slug)"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project-showcase {
  background: #15130f;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.project-grid-pattern {
  background-color: #17140f;
  background-image:
    linear-gradient(rgba(240, 191, 108, 0.075) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240, 191, 108, 0.075) 1px, transparent 1px);
  background-size: 48px 48px;
}

.project-glow {
  width: 420px;
  height: 420px;
  border-radius: 9999px;
  filter: blur(100px);
  opacity: 0.22;
  background: #f0bf6c;
  pointer-events: none;
}

.project-glow-one {
  left: -170px;
  top: 18%;
}

.project-glow-two {
  right: -160px;
  bottom: -190px;
}

</style>
