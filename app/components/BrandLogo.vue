<script setup lang="ts">
// The stock logo is pure white, so it disappears on the ivory light background.
// Pick the ink variant unless we're sitting on a deliberately dark surface
// (the footer and other inverted sections keep the white mark in both modes).
const props = withDefaults(defineProps<{ onDark?: boolean }>(), {
  onDark: false,
})

const colorMode = useColorMode()

const src = computed(() =>
  props.onDark || colorMode.value === 'dark'
    ? '/img/logo/mc-studio.svg'
    : '/img/logo/mc-studio-dark.svg'
)
</script>

<template>
  <!-- Plain <img>: routing the logo through ipx rasterises it onto an opaque black
       backing, which the old dark layout happened to hide. -->
  <img :src="src" alt="MC Studio" width="780" height="141" decoding="async" />
</template>
