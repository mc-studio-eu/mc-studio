<script setup lang="ts">
import { cities } from '~/data/cities'

const route = useRoute()
const city = cities.find(item => item.slug === route.params.city)

if (!city) {
  throw createError({ statusCode: 404, statusMessage: 'City not found' })
}
</script>

<template>
  <GlobalHome :city="city.name" />
</template>
