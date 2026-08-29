<script setup lang="ts">
import { useProjectCards } from '../../composables/useProjectCards'

const localePath = useLocalePath()
const { filterProjects } = useProjectCards()

const activeIndex = ref(0)
const isPaused = ref(false)
const showMoreBtn = ref(null)
const showMoreWrapper = ref(null)
const projectSection = ref<HTMLElement | null>(null)
const projectCursor = reactive({ x: 0, y: 0, visible: false })

useTextSlideAnimation(showMoreBtn, showMoreWrapper)

const excludedFromShowcase = new Set(['crm-ra-energy'])

const filteredProjects = computed(() =>
  filterProjects('all').filter((project) => !excludedFromShowcase.has(project.slug))
)
const loadedProjects = reactive(new Set<string>())

let autoplayTimer: ReturnType<typeof setInterval> | undefined

const goToProject = (index: number) => {
  if (!filteredProjects.value.length) return
  activeIndex.value = (index + filteredProjects.value.length) % filteredProjects.value.length
}

const markProjectAsLoaded = (slug: string) => {
  loadedProjects.add(slug)
}

const isProjectLoaded = (slug: string) => {
  if (loadedProjects.has(slug)) return true

  const image = projectSection.value?.querySelector<HTMLImageElement>(
    `img[data-project-slug="${slug}"]`
  )

  if (!image?.complete || image.naturalWidth === 0) return false

  // Cached images may already be complete when this component is mounted again,
  // so their load event is not guaranteed to repopulate loadedProjects.
  loadedProjects.add(slug)
  return true
}

const updateProjectCursor = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse') return

  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) return

  const bounds = target.getBoundingClientRect()
  projectCursor.x = event.clientX - bounds.left
  projectCursor.y = event.clientY - bounds.top
}

const showProjectCursor = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse') return
  updateProjectCursor(event)
  projectCursor.visible = true
}

const hideProjectCursor = () => {
  projectCursor.visible = false
}

const showNextProject = () => {
  const projectCount = filteredProjects.value.length

  for (let offset = 1; offset <= projectCount; offset += 1) {
    const nextIndex = (activeIndex.value + offset) % projectCount
    const nextProject = filteredProjects.value[nextIndex]

    if (nextProject && isProjectLoaded(nextProject.slug)) {
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
    ref="projectSection"
    id="projets"
    class="overflow-hidden bg-[var(--bg-primary)] px-4 py-16 transition-colors duration-300 sm:px-6 md:py-20"
  >
    <div class="mx-auto max-w-[1216px]">
      <div class="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
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

        <NuxtLink
          ref="showMoreBtn"
          :to="localePath('/projects')"
          class="inline-flex min-h-11 w-fit shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[#181818] px-5 font-inter text-sm font-medium text-[var(--text-primary)] no-underline"
        >
          <span class="text-slide-container h-5">
            <span ref="showMoreWrapper" class="text-slide-wrapper">
              <span class="text-slide-text h-5 leading-5">{{ $t('projects.show_more') }}</span>
              <span class="text-slide-text h-5 leading-5" aria-hidden="true">{{ $t('projects.show_more') }}</span>
            </span>
          </span>
          <UIcon name="i-lucide-arrow-right" class="ml-2 h-4 w-4" />
        </NuxtLink>
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

        <div class="relative aspect-[3/2] p-3 sm:p-5 lg:p-6">
          <NuxtLink
            v-for="(project, index) in filteredProjects"
            :key="project.slug"
            :to="localePath(`/projects/${project.slug}`)"
            class="project-image-link group absolute inset-x-6 inset-y-4 block overflow-hidden rounded-[16px] border border-white/15 bg-[#0d0d0d] text-white no-underline shadow-[0_28px_80px_rgba(0,0,0,0.42)] transition-opacity duration-150 ease-linear sm:inset-x-10 sm:inset-y-6 sm:rounded-[22px] lg:inset-x-14 lg:inset-y-8"
            :class="index === activeIndex ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'"
            :aria-label="$t('projects.showcase.open_project', { project: project.title })"
            :aria-hidden="index === activeIndex ? undefined : 'true'"
            :tabindex="index === activeIndex ? undefined : -1"
            @pointerenter="showProjectCursor"
            @pointermove="updateProjectCursor"
            @pointerleave="hideProjectCursor"
          >
            <NuxtImg
              :src="project.image"
              :alt="project.title"
              :data-project-slug="project.slug"
              width="1600"
              height="1000"
              loading="eager"
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              @load="markProjectAsLoaded(project.slug)"
            />
            <span
              class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/15 bg-[#181818]/95 px-4 py-2 font-inter text-xs font-medium text-white shadow-[0_6px_18px_rgba(0,0,0,0.3)] backdrop-blur-md transition-[opacity,scale] duration-150 ease-out sm:px-5 sm:py-2.5 sm:text-sm"
              :class="projectCursor.visible && index === activeIndex ? 'scale-100 opacity-100' : 'scale-75 opacity-0'"
              :style="{ left: `${projectCursor.x}px`, top: `${projectCursor.y}px` }"
              aria-hidden="true"
            >
              {{ $t('projects.cta') }}
            </span>
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

@media (hover: hover) and (pointer: fine) {
  .project-image-link:hover {
    cursor: none;
  }
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
