<script setup lang="ts">
import draggable from 'vuedraggable'
import { computed } from 'vue'
import SchemaBuilder from './SchemaBuilder.vue'

export interface BuilderField {
  name: string
  label: string
  type: string
  fields?: BuilderField[]
  options?: any[]
}

const props = defineProps<{
  modelValue: BuilderField[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: BuilderField[]): void
}>()

const localFields = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
})

const fieldTypes = [
  { label: 'Kısa Yazı', value: 'text' },
  { label: 'Uzun Yazı', value: 'textarea' },
  { label: 'Zengin Metin', value: 'richtext' },
  { label: 'Görsel', value: 'image' },
  { label: 'Sayı', value: 'number' },
  { label: 'Bağlantı', value: 'url' },
  { label: 'Tekrarlayıcı', value: 'repeater' },
  { label: 'Renk', value: 'color' }
]

function addField() {
  const newField: BuilderField = {
    name: '',
    label: '',
    type: 'text'
  }
  emit('update:modelValue', [...localFields.value, newField])
}

function removeField(index: number) {
  const newFields = [...localFields.value]
  newFields.splice(index, 1)
  emit('update:modelValue', newFields)
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

function onLabelInput(field: BuilderField, val: string) {
  if (!field.name || field.name === slugify(val.slice(0, -1))) {
    field.name = slugify(val)
  }
}

function onTypeChange(field: BuilderField) {
  if (field.type === 'repeater' && !field.fields) {
    field.fields = []
  }
}
</script>

<template>
  <div class="space-y-4">
    <draggable 
      v-model="localFields" 
      item-key="name" 
      handle=".drag-handle"
      group="fields"
      ghost-class="ghost"
    >
      <template #item="{ element, index }">
        <div class="flex flex-col gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 mb-3">
          <div class="flex items-start gap-3">
            <UButton icon="i-lucide-grip-vertical" variant="ghost" color="gray" class="drag-handle cursor-move mt-8" />
            
            <div class="flex-1 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <UFormField label="Etiket" required>
                   <UInput 
                     v-model="element.label" 
                     placeholder="Örn: Başlık" 
                     @input="(e: Event) => onLabelInput(element, (e.target as HTMLInputElement).value)" 
                   />
                 </UFormField>
                 <UFormField label="Değişken Adı (Slug)" required>
                   <UInput v-model="element.name" placeholder="baslik" />
                 </UFormField>
                 <UFormField label="Veri Tipi">
                   <USelect 
                     v-model="element.type" 
                     :options="fieldTypes" 
                     option-attribute="label" 
                     @change="() => onTypeChange(element)"
                   />
                 </UFormField>
              </div>

              <!-- Repeater Fields -->
              <div v-if="element.type === 'repeater'" class="pl-4 border-l-2 border-gray-300 dark:border-gray-700">
                <div class="text-sm font-medium text-gray-500 mb-2">Alt Alanlar</div>
                <SchemaBuilder v-model="element.fields" />
              </div>
            </div>
  
            <UButton icon="i-lucide-trash" color="red" variant="ghost" class="mt-8" @click="removeField(index)" />
          </div>
        </div>
      </template>
    </draggable>

    <UButton
      label="Alan Ekle"
      icon="i-lucide-plus"
      variant="soft"
      block
      @click="addField"
    />
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #f3f4f6;
}
</style>
