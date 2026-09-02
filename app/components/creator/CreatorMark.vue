<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  delay?: number
  animate?: boolean
  variant?: 'default' | 'title' | 'cardTitle'
}>(), {
  variant: 'default'
})

const root = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const bgRef = ref<HTMLElement | null>(null)
const cursorStart = ref<HTMLElement | null>(null)
const cursorEnd = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

onMounted(() => {
  if (props.animate === false || !root.value) return
  const chars = textRef.value?.textContent?.length ?? 12
  const dur = Math.max(0.6, chars * 0.08)

  ctx = gsap.context(() => {
    const targets = [bgRef.value, textRef.value].filter(Boolean) as HTMLElement[]
    const cursors = [cursorStart.value, cursorEnd.value].filter(Boolean) as HTMLElement[]

    gsap.set(targets, { clipPath: 'inset(-0.2em 100% -0.2em 0)' })
    gsap.set(cursors, { autoAlpha: 0 })
    gsap.set(cursorEnd.value, { left: '0%' })

    const tl = gsap.timeline({ delay: props.delay ?? 0.2 })
    tl.to(cursors, { autoAlpha: 1, duration: 0.001 }, 0)
      .to(
        targets,
        {
          clipPath: 'inset(-0.2em 0% -0.2em 0)',
          duration: dur,
          ease: `steps(${chars})`
        },
        0
      )
      .to(
        cursorEnd.value,
        { left: '100%', duration: dur, ease: `steps(${chars})` },
        0
      )
      .to(cursors, { autoAlpha: 0, duration: 0.12 }, '>')
  }, root.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <span ref="root" class="hl" :class="`hl--${variant}`">
    <span ref="bgRef" class="hl-bg" aria-hidden="true" />
    <span ref="textRef" class="hl-text"><slot /></span>
    <span ref="cursorStart" class="hl-cursor hl-cursor--start" aria-hidden="true" />
    <span ref="cursorEnd" class="hl-cursor hl-cursor--end" aria-hidden="true" />
  </span>
</template>

<style scoped>
.hl {
  --mark-top: 0.12em;
  --mark-bottom: 0.1em;
  --mark-dot-size: 0.16em;
  --mark-dot-offset: -0.08em;

  position: relative;
  display: inline-block;
  isolation: isolate;
  white-space: nowrap;
  padding: 0 0.04em;
}
.hl--title {
  --mark-top: -0.04em;
  --mark-bottom: -0.04em;
  --mark-dot-size: 0.24em;
  --mark-dot-offset: -0.12em;
}
.hl--cardTitle {
  --mark-top: -0.08em;
  --mark-bottom: -0.06em;
  --mark-dot-size: 0.22em;
  --mark-dot-offset: -0.11em;
}
.hl-bg {
  position: absolute;
  inset: var(--mark-top) -0.02em var(--mark-bottom);
  background: rgba(167, 139, 250, 0.55);
  z-index: -1;
  pointer-events: none;
}
.hl-text {
  display: inline-block;
}
.hl-cursor {
  position: absolute;
  width: 2px;
  background: #7c3aed;
  top: var(--mark-top);
  bottom: var(--mark-bottom);
}
.hl-cursor::before {
  content: '';
  position: absolute;
  left: 50%;
  width: var(--mark-dot-size);
  height: var(--mark-dot-size);
  border-radius: 9999px;
  background: #7c3aed;
  transform: translateX(-50%);
}
.hl-cursor--start {
  left: -1px;
}
.hl-cursor--start::before {
  top: var(--mark-dot-offset);
}
.hl-cursor--end {
  left: 100%;
  transform: translateX(-2px);
}
.hl-cursor--end::before {
  bottom: var(--mark-dot-offset);
}
@media (max-width: 640px) {
  .hl {
    white-space: normal;
  }
}
</style>
