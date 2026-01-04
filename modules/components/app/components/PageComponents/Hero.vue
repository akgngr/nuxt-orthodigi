<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
  image?: string
  ctaLabel?: string
  ctaUrl?: string
}>()
</script>

<template>
  <section class="relative py-20 overflow-hidden bg-gray-900 text-white">
    <!-- Background Image -->
    <div v-if="image" class="absolute inset-0 z-0">
      <img :src="image" :alt="title" class="w-full h-full object-cover opacity-40" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
    </div>

    <div class="container relative z-10 px-4 mx-auto text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="max-w-2xl mx-auto text-lg text-gray-300 mb-10 whitespace-pre-wrap">
        {{ subtitle }}
      </p>
      <div v-if="ctaLabel && ctaUrl">
        <UButton :to="ctaUrl" size="xl" color="primary">
          {{ ctaLabel }}
        </UButton>
      </div>
    </div>
  </section>
</template>
