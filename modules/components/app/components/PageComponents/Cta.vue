<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  buttonLabel?: string
  buttonUrl?: string
}>()
</script>

<template>
  <section class="py-16 bg-primary-50 dark:bg-primary-950/30">
    <div class="container px-4 mx-auto text-center">
      <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{{ title }}</h2>
      <p v-if="description" class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        {{ description }}
      </p>
      <UButton v-if="buttonLabel && buttonUrl" :to="buttonUrl" size="lg" color="primary">
        {{ buttonLabel }}
      </UButton>
    </div>
  </section>
</template>
