<template>
    <USlideover
      v-model:open="localOpen"
      title="Form Builder"
      :ui="{ 
        content: 'max-w-7xl w-full h-screen flex flex-col bg-white dark:bg-gray-900'
      }"
      data-testid="form-drawer"
    >
    <template #content>
      <UCard 
        :ui="{ 
          body: 'p-0 flex-1 min-h-0 flex flex-col', 
          header: 'py-4 px-6', 
          footer: 'py-4 px-6',
          root: 'h-full flex flex-col',
        }" 
        class="h-full rounded-none overflow-hidden"
        data-testid="form-drawer-content"
      >
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
              <UIcon
                :name="isEditing ? 'i-lucide-edit' : 'i-lucide-plus-circle'"
                class="w-5 h-5 text-primary-600 dark:text-primary-400"
              />
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ isEditing ? 'Formu Düzenle' : 'Yeni Form Oluştur' }}
              </h2>
              <p class="text-xs text-gray-500">
                Form ayarlarını ve alanlarını buradan yönetebilirsiniz.
              </p>
            </div>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            data-testid="form-drawer-close-icon"
            @click="localOpen = false; $emit('close')"
          />
        </div>
      </template>

      <div class="flex-1 overflow-hidden">
        <FormBuilder v-model="localFormData" />
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-xs text-gray-500 italic">
            * ile işaretli alanlar zorunludur.
          </p>
          <div class="flex gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              data-testid="form-drawer-cancel-button"
              @click="localOpen = false; $emit('close')"
            >
              İptal
            </UButton>
            <UButton
              color="primary"
              :loading="saving"
              icon="i-lucide-save"
              size="lg"
              data-testid="form-drawer-save-button"
              @click="$emit('save', localFormData)"
            >
              {{ isEditing ? 'Değişiklikleri Kaydet' : 'Formu Oluştur' }}
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
    </template>
      
    </USlideover>
</template>

<script setup lang="ts">
import type { FormDefinition } from '../../../../../shared/types/form'
import FormBuilder from './FormBuilder.vue'

const props = defineProps<{
  open: boolean
  formData: FormDefinition
  isEditing: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [data: FormDefinition]
  'close': []
  'update-order': []
}>()

const localOpen = ref(props.open)

watch(() => props.open, (newVal) => {
  localOpen.value = newVal
})

watch(localOpen, (newVal) => {
  emit('update:open', newVal)
})

// Local copy of formData
const localFormData = ref<FormDefinition>(JSON.parse(JSON.stringify(props.formData)))

// Sync localFormData when props.formData changes
watch(() => props.formData, (newVal) => {
  localFormData.value = JSON.parse(JSON.stringify(newVal))
}, { deep: true })
</script>