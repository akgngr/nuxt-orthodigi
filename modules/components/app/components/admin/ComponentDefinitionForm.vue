<script setup lang="ts">
import { reactive } from 'vue'
import SchemaBuilder from './SchemaBuilder.vue'

const props = defineProps<{
  initialData?: any
  isEditing?: boolean
  loading?: boolean
}>()

const emit = defineEmits(['save', 'cancel'])

const state = reactive({
  name: props.initialData?.name || '',
  slug: props.initialData?.slug || '',
  description: props.initialData?.description || '',
  icon: props.initialData?.icon || 'i-lucide-box',
  category: props.initialData?.category || 'content',
  schema: props.initialData?.schema ? JSON.parse(JSON.stringify(props.initialData.schema)) : []
})

const categories = [
  { label: 'İçerik', value: 'content' },
  { label: 'Düzen', value: 'layout' },
  { label: 'Medya', value: 'media' },
  { label: 'İnteraktif', value: 'interactive' },
  { label: 'Diğer', value: 'other' }
]

function onNameInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (!props.isEditing && !state.slug) {
    state.slug = val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  }
}

function save() {
  emit('save', state)
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-10">
    <UCard>
      <template #header>
        <h3 class="font-semibold text-lg">Temel Bilgiler</h3>
      </template>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Bileşen Adı" required>
          <UInput v-model="state.name" @input="onNameInput" />
        </UFormField>
        
        <UFormField label="Bileşen Kodu (Slug)" required help="Benzersiz olmalıdır">
          <UInput v-model="state.slug" :disabled="isEditing" />
        </UFormField>

        <UFormField label="Kategori">
          <USelectMenu v-model="state.category" :options="categories" value-attribute="value" option-attribute="label" />
        </UFormField>

        <UFormField label="İkon">
          <div class="flex gap-2">
            <UInput v-model="state.icon" class="flex-1" />
            <div class="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <UIcon :name="state.icon" class="w-5 h-5" />
            </div>
          </div>
        </UFormField>

        <UFormField label="Açıklama" class="col-span-2">
          <UTextarea v-model="state.description" />
        </UFormField>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-lg">Veri Yapısı (Schema)</h3>
            <p class="text-sm text-gray-500">Bileşenin sahip olacağı alanları tanımlayın.</p>
          </div>
        </div>
      </template>
      
      <SchemaBuilder v-model="state.schema" />
    </UCard>

    <div class="flex justify-end gap-3 sticky bottom-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-4 border rounded-xl border-gray-200 dark:border-gray-800 shadow-lg z-10">
      <UButton label="İptal" color="gray" variant="ghost" @click="emit('cancel')" :disabled="loading" />
      <UButton label="Kaydet" color="primary" @click="save" :loading="loading" />
    </div>
  </div>
</template>
