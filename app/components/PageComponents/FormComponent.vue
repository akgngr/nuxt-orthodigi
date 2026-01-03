<template>
  <div class="w-full">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <!-- Loading overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
        <UIcon 
          name="i-lucide-loader-circle" 
          class="animate-spin w-8 h-8 text-primary-500" 
        />
      </div>
    </div>
    
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500">{{ error }}</p>
    </div>
    
    <div v-else-if="formDefinition">
      <DynamicForm
        :form-definition="formDefinition"
        :layout="componentData.layout"
        :spacing="componentData.spacing"
        :theme="componentData.theme"
      />
    </div>
    
    <div v-else class="text-center py-8">
      <p class="text-gray-500">Form not found</p>
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

const formDefinition = ref<FormDefinition | null>(null)
const loading = ref(true)
const error = ref('')

// Component data with defaults
const componentData = computed(() => ({
  formSlug: props.component.content.formSlug,
  layout: props.component.content.layout || 'vertical',
  spacing: props.component.content.spacing || 'normal',
  theme: props.component.content.theme || 'default'
}))

// Load form definition
const loadForm = async () => {
  if (!componentData.value.formSlug) {
    error.value = 'No form selected'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const { getForm } = useFormBuilder()
    const form = await getForm(componentData.value.formSlug)
    
    if (form) {
      formDefinition.value = form
    } else {
      error.value = 'Form not found'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load form'
    console.error('Failed to load form:', err)
  } finally {
    loading.value = false
  }
}

// Load form on mount
onMounted(() => {
  loadForm()
})

// Watch for form slug changes
watch(() => componentData.value.formSlug, () => {
  loadForm()
})
</script>
