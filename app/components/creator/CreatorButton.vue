<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to: string
    variant?: 'primary' | 'dark'
    target?: string
    rel?: string
  }>(),
  {
    variant: 'primary'
  }
)

const localePath = useLocalePath()
const localizedTo = computed(() =>
  props.to.startsWith('/') ? localePath(props.to) : props.to
)
</script>

<template>
  <NuxtLink
    class="creator-button inline-flex min-h-9 min-w-[138px] items-center justify-center rounded-md px-4 py-2 text-center font-[Inter,var(--font-body)] text-[12px] font-medium leading-none text-white shadow-[var(--shadow-button)] transition-transform duration-150 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-purple)]"
    :class="variant === 'primary' ? 'bg-[var(--color-purple)] backdrop-blur-xl' : 'bg-black'"
    :to="localizedTo"
    :target="target"
    :rel="rel"
  >
    <span class="creator-button__text-clip" aria-hidden="true">
      <span class="creator-button__text-track">
        <span class="creator-button__text"><slot /></span>
        <span class="creator-button__text"><slot /></span>
      </span>
    </span>
    <span class="sr-only"><slot /></span>
  </NuxtLink>
</template>

<style scoped>
.creator-button__text-clip {
  display: block;
  height: 1em;
  overflow: hidden;
}

.creator-button__text-track {
  display: flex;
  flex-direction: column;
  transition: transform 0.35s ease;
}

.creator-button__text {
  display: block;
  height: 1em;
  line-height: 1;
}

.creator-button:hover .creator-button__text-track,
.creator-button:focus-visible .creator-button__text-track {
  transform: translateY(-50%);
}
</style>
