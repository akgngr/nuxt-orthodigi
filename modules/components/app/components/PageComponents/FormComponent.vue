<script setup lang="ts">
import DynamicForm from '~/modules/forms/app/components/DynamicForm.vue'

const props = defineProps<{
  formSlug?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <section class="py-16 bg-white dark:bg-gray-900">
    <div class="container px-4 mx-auto">
      <div class="max-w-2xl mx-auto">
        <div v-if="title || description" class="text-center mb-8">
          <h2 v-if="title" class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{{ title }}</h2>
          <p v-if="description" class="text-gray-600 dark:text-gray-300">{{ description }}</p>
        </div>
        
        <div v-if="formSlug" class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <DynamicForm :slug="formSlug" />
        </div>
        <div v-else class="text-center text-gray-500 py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          Form seçilmedi.
        </div>
      </div>
    </div>
  </section>
</template>
