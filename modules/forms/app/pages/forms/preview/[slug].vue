<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
    <div v-if="pending" class="flex justify-center items-center h-64">
      <UIcon name="i-lucide-loader-2" class="animate-spin w-8 h-8 text-primary-500" />
    </div>

    <div v-else-if="error" class="max-w-md mx-auto">
      <UAlert
        icon="i-lucide-alert-triangle"
        color="red"
        variant="subtle"
        title="Form Yüklenemedi"
        :description="error.message"
      />
    </div>

    <div v-else-if="form" class="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ form.title }}</h1>
        <p v-if="form.description" class="text-gray-500 dark:text-gray-400">{{ form.description }}</p>
      </div>

      <DynamicForm :form-definition="form" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormDefinition } from '~~/shared/types/form'

const route = useRoute()
const slug = route.params.slug as string

const { data: response, pending, error } = await useFetch<{ success: boolean, data: FormDefinition }>(`/api/forms/${slug}`)
const form = computed(() => response.value?.data)
</script>
