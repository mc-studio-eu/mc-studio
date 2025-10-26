<script setup lang="ts">
const isSticky = ref(false)
</script>

<template>
  <!-- Header -->
  <header class="pt-10 flex justify-around items-center w-full">
    <!-- Logo -->
    <div class="flex gap-2 items-center">
      <NuxtLink to="/" class="flex justify-center items-center">
        <NuxtImg src="/img/main/logo.svg"  alt="MC Studio" class="h-10" />
      </NuxtLink>
      <p class="text-white text-sm">Studio</p>
    </div>



    <!-- Nav desktop -->
    <nav class="flex items-center gap-2 sm:gap-4">
      <NuxtLink :class="isSticky ? 'nav-sticky': 'nav-default'" class="nav-link" to="/#services">Projets</NuxtLink>
      <NuxtLink :class="isSticky ? 'nav-sticky': 'nav-default'" class="nav-link" to="/#services">Services</NuxtLink>
      <NuxtLink :class="isSticky ? 'nav-sticky': 'nav-default'" class="nav-link" to="/#services">Process</NuxtLink>
      <NuxtLink :class="isSticky ? 'nav-sticky': 'nav-default'" class="nav-link" to="/#services">Avis</NuxtLink>
     </nav>

    <!-- FR / EN -->
    <UButton trailing-icon="i-lucide-arrow-right" size="md">Button</UButton>
  </header>

</template>

<style scoped>
@reference "@/assets/css/main.css";

.nav-link{
  @apply  font-inter text-xs lg:px-2 py-1.5 rounded-xl transition-colors duration-200;
}

.nav-default{
  @apply text-white hover:bg-black/5 hover:text-gold
}

.nav-sticky{
  @apply text-gold hover:bg-transparent hover:text-white ;
}

</style>
