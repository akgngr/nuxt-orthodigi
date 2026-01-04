<script setup lang="ts">
const props = defineProps<{
  body: string
}>()
</script>

<template>
  <section class="py-12 bg-white dark:bg-gray-900">
    <div class="container px-4 mx-auto">
      <div class="prose dark:prose-invert max-w-4xl mx-auto" v-html="body"></div>
    </div>
  </section>
</template>
