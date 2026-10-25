<script setup lang="ts">
import { usePortalTheme } from '~/composables/usePortalTheme'

const { theme, toggleTheme } = usePortalTheme()
const label = computed(() => theme.value === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre')
</script>

<template>
  <button type="button" class="portal-theme-toggle" :aria-label="label" :title="label" @click="toggleTheme">
    <UIcon :name="theme === 'dark' ? 'i-tabler-sun' : 'i-tabler-moon'" />
  </button>
</template>
