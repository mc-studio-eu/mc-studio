<script setup lang="ts">
const isSticky = ref(false)
</script>

<template>
  <!-- Header -->
  <header class="flex justify-center items-center">
    <!-- Logo -->
    <NuxtLink to="/" class="mt-10 flex justify-center items-center">
      <NuxtImg src="/img/main/logo.svg"  alt="MC Studio" class="h-16" />
    </NuxtLink>

    <!-- Nav desktop -->
    <nav class="hidden sm:flex items-center gap-2 sm:gap-4">
      <NuxtLink :class="isSticky ? 'text-beige hover:bg-transparent hover:text-white ': 'text-white hover:bg-black/5 hover:text-black '" class="nav-link" to="/#services">Services</NuxtLink>
      <NuxtLink :class="isSticky ? 'text-beige hover:bg-transparent hover:text-white ': 'text-white hover:bg-black/5 hover:text-black '" class="nav-link" to="/#services">Services</NuxtLink>
      <NuxtLink :class="isSticky ? 'text-beige hover:bg-transparent hover:text-white ': 'text-white hover:bg-black/5 hover:text-black '" class="nav-link" to="/#services">Services</NuxtLink>
     </nav>
  </header>

</template>

<style scoped>
@reference "@/assets/css/main.css";

</style>
