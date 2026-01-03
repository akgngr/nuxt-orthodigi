<template>
  <div class="h-full grid grid-cols-12 divide-x divide-gray-200 dark:divide-gray-800">
    
    <!-- Column 1: General Settings (Left) -->
    <div class="col-span-3 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto p-4">
      <div class="space-y-6">
        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-lucide-settings-2" class="text-gray-400" />
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">
            Genel Ayarlar
          </h3>
        </div>

        <UFormField label="Başlık" required description="Formun görünen adı">
          <UInput v-model="formData.title" placeholder="İletişim Formu" size="lg" />
        </UFormField>

        <UFormField label="Slug" required description="Formun benzersiz URL kimliği">
          <UInput v-model="formData.slug" placeholder="iletisim-formu" icon="i-lucide-link" />
        </UFormField>

        <UFormField label="Açıklama" description="Formun ne için kullanıldığını belirtin">
          <UTextarea v-model="formData.description" placeholder="Müşterilerin bize ulaşması için kullanılan form" :rows="3" />
        </UFormField>

        <USeparator />

        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-lucide-send" class="text-gray-400" />
          <h4 class="text-sm font-bold uppercase tracking-wider text-gray-500">
            Gönderim Ayarları
          </h4>
        </div>

        <UFormField label="Başarı Mesajı" description="Form başarıyla gönderildiğinde gösterilecek mesaj">
          <UTextarea v-model="formData.settings.successMessage" placeholder="Mesajınız başarıyla iletildi." :rows="2" />
        </UFormField>

        <UFormField label="Yönlendirme URL'si" description="Gönderim sonrası gidilecek sayfa (opsiyonel)">
          <UInput v-model="formData.settings.redirectUrl" placeholder="https://example.com/tesekkur-ederiz" icon="i-lucide-external-link" />
        </UFormField>
      </div>
    </div>

    <!-- Column 2: Form Builder Canvas (Middle) -->
    <div class="col-span-6 bg-white dark:bg-gray-950 overflow-y-auto p-6 relative">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-layout-template" class="text-gray-400" />
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">
            Form Önizleme & Düzenleme
          </h3>
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ formData.fields.length }} Alan
          </UBadge>
        </div>
      </div>

      <div v-if="formData.fields.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none p-10 text-center">
        <UIcon name="i-lucide-mouse-pointer-click" class="w-12 h-12 mb-4 opacity-50" />
        <p>Sağ taraftaki araç kutusundan alanları buraya sürükleyip bırakın.</p>
      </div>

      <draggable
        v-model="formData.fields"
        item-key="id"
        class="space-y-3 min-h-[500px] pb-20"
        handle=".drag-handle"
        group="form-builder"
        @end="updateFieldOrder"
      >
        <template #item="{ element }">
          <FormBuilderItem
            :element="element"
            :expanded-field-id="expandedFieldId"
            @toggle-expand="toggleExpand"
            @remove="handleRemoveField"
          />
        </template>
      </draggable>
    </div>

    <!-- Column 3: Toolbox (Right) -->
    <div class="col-span-3 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto p-4 border-l border-gray-200 dark:border-gray-800">
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-lucide-box" class="text-gray-400" />
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">
            Araç Kutusu
          </h3>
        </div>
        <p class="text-xs text-gray-400">
          Aşağıdaki alanları orta panele sürükleyip bırakın.
        </p>
      </div>

      <draggable
        :list="fieldTypes"
        :group="{ name: 'form-builder', pull: 'clone', put: false }"
        :clone="cloneField"
        item-key="value"
        class="grid grid-cols-1 gap-3"
      >
        <template #item="{ element }">
          <div class="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm cursor-move hover:border-primary-500 hover:shadow-md transition-all flex items-center gap-3 select-none">
            <UIcon :name="getFieldIcon(element.value)" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ element.label }}</span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import FormBuilderItem from './FormBuilderItem.vue'
import type { FormDefinition, FormField } from '~~/shared/types/form'
import { slugify } from '~~/utils/slugify'

const formData = defineModel<FormDefinition>({ required: true })

// Auto-generate slug from title
watch(() => formData.value.title, (newVal) => {
  if (newVal && !formData.value.id) { // Only generate if creating new form
    formData.value.slug = slugify(newVal)
  }
})

const expandedFieldId = ref<string | null>(null)

const toggleExpand = (id: string) => {
  if (expandedFieldId.value === id) {
    expandedFieldId.value = null
  } else {
    expandedFieldId.value = id
  }
}

const updateFieldOrder = () => {
  formData.value.fields.forEach((field: FormField, index: number) => {
    field.order = index
  })
}

const handleRemoveField = (id: string) => {
  if (confirm('Bu alanı silmek istediğinizden emin misiniz?')) {
    const index = formData.value.fields.findIndex(f => f.id === id)
    if (index > -1) {
      formData.value.fields.splice(index, 1)
      if (expandedFieldId.value === id) {
        expandedFieldId.value = null
      }
      updateFieldOrder()
    }
  }
}

// Toolbox Data & Clone Function
const fieldTypes = [
  { label: 'Satır / Kolon', value: 'row' },
  { label: 'Metin Girişi', value: 'text' },
  { label: 'E-posta', value: 'email' },
  { label: 'Telefon', value: 'phone' },
  { label: 'Uzun Metin', value: 'textarea' },
  { label: 'Seçim Kutusu', value: 'select' },
  { label: 'Onay Kutusu', value: 'checkbox' },
  { label: 'Radyo Butonları', value: 'radio' },
  { label: 'Tarih Seçici', value: 'date' },
  { label: 'Dosya Yükleme', value: 'file' },
  { label: 'Buton', value: 'submit' },
  { label: 'Gizli Alan', value: 'hidden' }
]

const getFieldIcon = (type: string) => {
  const icons: Record<string, string> = {
    text: 'i-lucide-type',
    email: 'i-lucide-mail',
    tel: 'i-lucide-phone',
    url: 'i-lucide-link',
    number: 'i-lucide-hash',
    date: 'i-lucide-calendar',
    textarea: 'i-lucide-align-left',
    select: 'i-lucide-list',
    radio: 'i-lucide-circle-dot',
    checkbox: 'i-lucide-check-square',
    file: 'i-lucide-upload',
    submit: 'i-lucide-mouse-pointer-2',
    hidden: 'i-lucide-eye-off',
    row: 'i-lucide-layout'
  }
  return icons[type] || 'i-lucide-box'
}

const cloneField = (fieldPrototype: any) => {
  const uniqueId = `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const field: FormField = {
    id: uniqueId,
    type: fieldPrototype.value,
    label: fieldPrototype.value === 'submit' ? 'Gönder' : (fieldPrototype.value === 'row' ? 'Satır' : fieldPrototype.label),
    description: '',
    hint: '',
    help: '',
    placeholder: '',
    required: false,
    options: [],
    validation: {
      pattern: '',
      minLength: undefined,
      maxLength: undefined
    },
    order: formData.value.fields.length,
    className: '',
    defaultValue: ''
  }

  if (fieldPrototype.value === 'row') {
    // Default 2 columns
    field.columns = [
       { id: `col_${uniqueId}_1`, fields: [], width: 6 },
       { id: `col_${uniqueId}_2`, fields: [], width: 6 }
    ]
  }

  return field
}
</script>
