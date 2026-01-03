<template>
  <div :class="formContainerClass">
    <UForm :state="formState" @submit="handleSubmit" :validate="validateForm">
      <div v-for="field in formDefinition.fields" :key="field.id" class="space-y-2">
        <DynamicFormField 
          :field="field" 
          :state="formState" 
        />
      </div>

      <!-- Honeypot field for spam protection -->
      <div v-if="formDefinition.settings?.spamProtection?.honeypot" class="honeypot-field" style="display: none;">
        <input type="text" name="website" v-model="honeypot" tabindex="-1" autocomplete="off" />
      </div>
    </UForm>

    <!-- Success Message -->
    <div v-if="submitted && successMessage" class="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormDefinition, FormField } from '~~/shared/types/form'

interface Props {
  formDefinition: FormDefinition
  layout?: 'vertical' | 'horizontal'
  spacing?: 'compact' | 'normal' | 'relaxed'
  theme?: 'default' | 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  spacing: 'normal',
  theme: 'default'
})

// State
const formState = ref<Record<string, any>>({})
const submitting = ref(false)
const submitted = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const honeypot = ref('')

// Initialize form state
const initializeFormState = () => {
  const state: Record<string, any> = {}
  
  const processFields = (fields: FormField[]) => {
    fields.forEach((field: FormField) => {
      if (field.type === 'row' && field.columns) {
        field.columns.forEach(col => {
          processFields(col.fields)
        })
        return
      }

      if (field.type === 'checkbox') {
        if (field.options && field.options.length > 0) {
          state[field.id] = []
        } else {
          state[field.id] = field.defaultValue === 'true' || field.defaultValue === true
        }
      } else if (field.type === 'select' || field.type === 'radio') {
        state[field.id] = field.defaultValue || undefined
      } else {
        state[field.id] = field.defaultValue || ''
      }
    })
  }

  processFields(props.formDefinition.fields)
  formState.value = state
}

const handleCheckboxChange = (fieldId: string, value: string, checked: boolean) => {
  const currentValues = Array.isArray(formState.value[fieldId]) ? formState.value[fieldId] : []
  if (checked) {
    formState.value[fieldId] = [...currentValues, value]
  } else {
    formState.value[fieldId] = currentValues.filter((v: string) => v !== value)
  }
}

const handleFileChange = (fieldId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formState.value[fieldId] = target.files[0]
  } else {
    formState.value[fieldId] = null
  }
}

// Provide handlers to children
provide('handleCheckboxChange', handleCheckboxChange)
provide('handleFileChange', handleFileChange)
provide('formSubmitting', submitting)

// Form validation
const validateForm = (state: Record<string, any>) => {
  const errors: { name: string, message: string }[] = []
  
  const processValidation = (fields: FormField[]) => {
    fields.forEach((field: FormField) => {
      if (field.type === 'row' && field.columns) {
        field.columns.forEach(col => {
          processValidation(col.fields)
        })
        return
      }

      if (field.required && !state[field.id]) {
        errors.push({ name: field.id, message: `${field.label} is required` })
      }
      
      if (field.validation && state[field.id]) {
        const value = state[field.id]
        
        if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
          errors.push({ name: field.id, message: `${field.label} formatı geçersiz` })
        }
        
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          errors.push({ name: field.id, message: `${field.label} en az ${field.validation.minLength} karakter olmalıdır` })
        }
        
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          errors.push({ name: field.id, message: `${field.label} en fazla ${field.validation.maxLength} karakter olmalıdır` })
        }
      }
    })
  }
  
  processValidation(props.formDefinition.fields)
  
  return errors
}

// Handle form submission
const handleSubmit = async (event: Event) => {
  event.preventDefault()
  
  // Check honeypot
  if (props.formDefinition.settings?.spamProtection?.honeypot && honeypot.value) {
    return // Silent fail for spam bots
  }
  
  submitting.value = true
  errorMessage.value = ''
  
  try {
    const response = await $fetch('/api/forms/submit', {
      method: 'POST',
      body: {
        formSlug: props.formDefinition.slug,
        data: formState.value
      }
    })
    
    if (response.success) {
      submitted.value = true
      successMessage.value = response.message
      
      // Handle redirect if configured
      if (props.formDefinition.settings?.redirectUrl) {
        setTimeout(() => {
          window.location.href = props.formDefinition.settings.redirectUrl!
        }, 1000)
      } else {
        // Reset form after success
        setTimeout(() => {
          submitted.value = false
          successMessage.value = ''
          initializeFormState()
        }, 3000)
      }
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Failed to submit form. Please try again.'
  } finally {
    submitting.value = false
  }
}

// Computed classes
const formContainerClass = computed(() => {
  const classes = ['space-y-4']
  
  // Layout
  if (props.layout === 'horizontal') {
    classes.push('grid grid-cols-1 md:grid-cols-2 gap-4')
  }
  
  // Spacing
  switch (props.spacing) {
    case 'compact':
      classes.push('gap-2')
      break
    case 'relaxed':
      classes.push('gap-6')
      break
    default:
      classes.push('gap-4')
  }
  
  // Theme
  switch (props.theme) {
    case 'primary':
      classes.push('text-primary-600')
      break
    case 'secondary':
      classes.push('text-secondary-600')
      break
  }
  
  return classes.join(' ')
})

// Initialize form on mount
onMounted(() => {
  initializeFormState()
})

// Watch for form definition changes
watch(() => props.formDefinition, () => {
  initializeFormState()
}, { deep: true })
</script>

<style scoped>
.honeypot-field {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
