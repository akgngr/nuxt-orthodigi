<script setup lang="ts">
import type { FormDefinition } from '../../shared/types/form'

const props = defineProps<{
  slug: string
  title?: string
  description?: string
}>()

const { data: response, error } = await useFetch<{ success: boolean, data: FormDefinition }>(`/api/forms/${props.slug}`)

const form = computed(() => response.value?.data)

const handleSubmit = async (formData: any) => {
  try {
    const result = await $fetch('/api/forms/submit', {
      method: 'POST',
      body: {
        formSlug: props.slug,
        data: formData
      }
    })
    
    // Optional: Handle success (toast, redirect) - DynamicForm might handle some of this
    // but the DynamicForm component likely emits an event.
    // Let's check DynamicForm implementation if needed, but for now this is a good start.
  } catch (err) {
    console.error('Form submission error:', err)
    throw err // Propagate to DynamicForm if it handles errors
  }
}
</script>

<template>
  <div v-if="form" class="w-full">
    <div v-if="title || description" class="mb-6">
      <h3 v-if="title" class="text-xl font-bold mb-2">{{ title }}</h3>
      <p v-if="description" class="text-gray-600 dark:text-gray-400">{{ description }}</p>
    </div>
    
    <DynamicForm
      :form="form"
      @submit="handleSubmit"
    />
  </div>
  <div v-else-if="error" class="p-4 bg-red-50 text-red-600 rounded-lg">
    Form yüklenirken bir hata oluştu: {{ error.message }}
  </div>
  <div v-else class="p-8 flex justify-center">
    <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
  </div>
</template>
