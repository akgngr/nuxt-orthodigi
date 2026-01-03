<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Form Component</h3>
    
    <UFormField label="Select Form" required>
      <USelect
        v-model="component.content.formSlug"
        :items="formOptions"
        placeholder="Choose a form"
        :loading="loading"
      />
    </UFormField>

    <UFormField label="Layout">
      <USelect
        v-model="component.content.layout"
        :items="layoutOptions"
      />
    </UFormField>

    <UFormField label="Spacing">
      <USelect
        v-model="component.content.spacing"
        :items="spacingOptions"
      />
    </UFormField>

    <UFormField label="Theme">
      <USelect
        v-model="component.content.theme"
        :items="themeOptions"
      />
    </UFormField>

    <div v-if="selectedForm" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 class="font-medium mb-2">{{ selectedForm.title }}</h4>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedForm.description }}</p>
      <p class="text-sm text-gray-500 mt-1">{{ selectedForm.fields.length }} fields</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PageComponent } from '~~/shared/types/page'
import type { FormDefinition } from '~~/shared/types/form'

interface Props {
  component: PageComponent
}

const props = defineProps<Props>()

const { forms, loading, fetchForms } = useFormBuilder()

// Initialize component content
if (!props.component.content) {
  props.component.content = {
    formSlug: '',
    layout: 'vertical',
    spacing: 'normal',
    theme: 'default'
  }
}

const formOptions = computed(() => {
  return (forms.value as FormDefinition[]).map(form => ({
    label: form.title,
    value: form.slug
  }))
})

const layoutOptions = [
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' }
]

const spacingOptions = [
  { label: 'Compact', value: 'compact' },
  { label: 'Normal', value: 'normal' },
  { label: 'Relaxed', value: 'relaxed' }
]

const themeOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' }
]

const selectedForm = computed(() => {
  if (!props.component.content.formSlug) return null
  return (forms.value as FormDefinition[]).find(form => form.slug === props.component.content.formSlug)
})

// Load forms on mount
onMounted(() => {
  fetchForms()
})
</script>
