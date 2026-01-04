<script setup lang="ts">
import PropsEditor from './PropsEditor.vue'
import type { BuilderField } from '../../../../composables/usePageBuilder'

const props = defineProps<{
  schema: BuilderField[]
  modelValue: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
}>()

const updateField = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

// Fetch forms for form-selector
const { data: formsList } = useFetch<any>('/api/admin/forms')

// Helper for repeater
const addRepeaterItem = (fieldName: string, fields: BuilderField[]) => {
  const currentList = props.modelValue[fieldName] ? [...props.modelValue[fieldName]] : []
  const newItem: Record<string, any> = {}
  
  fields.forEach(f => {
    if (f.type === 'repeater') {
      newItem[f.name] = []
    } else if (f.type === 'boolean') {
      newItem[f.name] = false
    } else if (f.type === 'number') {
      newItem[f.name] = 0
    } else {
      newItem[f.name] = ''
    }
  })
  
  currentList.push(newItem)
  updateField(fieldName, currentList)
}

const removeRepeaterItem = (fieldName: string, index: number) => {
  const currentList = [...(props.modelValue[fieldName] || [])]
  currentList.splice(index, 1)
  updateField(fieldName, currentList)
}

const updateRepeaterItemFull = (fieldName: string, index: number, newItem: any) => {
  const currentList = [...(props.modelValue[fieldName] || [])]
  if (currentList[index]) {
    currentList[index] = newItem
    updateField(fieldName, currentList)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="field in schema" :key="field.name">
      
      <!-- Text & URL & Image -->
      <UFormField v-if="['text', 'url', 'image'].includes(field.type)" :label="field.label">
        <UInput 
          :model-value="modelValue[field.name]" 
          :placeholder="field.placeholder"
          @update:model-value="val => updateField(field.name, val)"
        />
      </UFormField>

      <!-- Textarea -->
      <UFormField v-else-if="field.type === 'textarea'" :label="field.label">
        <UTextarea 
          :model-value="modelValue[field.name]" 
          :placeholder="field.placeholder" 
          :rows="4"
          @update:model-value="val => updateField(field.name, val)"
        />
      </UFormField>

      <!-- Richtext (Simplified as Textarea for now) -->
      <UFormField v-else-if="field.type === 'richtext'" :label="field.label">
        <UTextarea 
          :model-value="modelValue[field.name]" 
          :rows="8"
          @update:model-value="val => updateField(field.name, val)"
        />
      </UFormField>

      <!-- Form Selector -->
      <UFormField v-else-if="field.type === 'form-selector'" :label="field.label">
        <USelectMenu
          :model-value="modelValue[field.name]"
          :items="formsList?.data || []"
          option-attribute="title"
          value-attribute="slug"
          placeholder="Form seçiniz..."
          searchable
          @update:model-value="val => updateField(field.name, val)"
        />
      </UFormField>

      <!-- Repeater -->
      <div v-else-if="field.type === 'repeater'" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ field.label }}</span>
          <UButton size="xs" color="gray" variant="soft" icon="i-lucide-plus" @click="addRepeaterItem(field.name, field.fields || [])">Ekle</UButton>
        </div>
        
        <div class="space-y-2">
          <div v-for="(item, index) in (modelValue[field.name] || [])" :key="index" class="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50 relative group">
             <UButton 
              size="2xs" 
              color="red" 
              variant="ghost" 
              icon="i-lucide-trash" 
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              @click="removeRepeaterItem(field.name, index as number)"
            />
            <div class="pr-6">
              <!-- Recursive PropsEditor for nested fields -->
              <PropsEditor
                v-if="field.fields && field.fields.length > 0"
                :schema="field.fields"
                :model-value="item"
                @update:model-value="val => updateRepeaterItemFull(field.name, index as number, val)"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
