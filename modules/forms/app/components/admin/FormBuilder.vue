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
        <template #item="{ element, index }">
          <div
            class="group relative border rounded-xl transition-all bg-white dark:bg-gray-900"
            :class="[
              expandedFieldIndex === index 
                ? 'border-primary-500 ring-1 ring-primary-500 shadow-lg z-10' 
                : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
            ]"
          >
            <!-- Header / Preview Mode -->
            <div 
              class="p-4 flex items-start gap-3 cursor-pointer"
              @click="toggleExpand(index)"
            >
              <div class="drag-handle cursor-grab active:cursor-grabbing p-1.5 mt-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click.stop>
                <UIcon name="i-lucide-grip-vertical" class="w-4 h-4" />
              </div>

              <div class="flex-1 pointer-events-none">
                <UFormField
                  :label="element.label || '(İsimsiz Alan)'"
                  :name="element.id"
                  :required="element.required"
                  :description="element.description"
                  :hint="element.hint"
                  :help="element.help"
                  class="opacity-80"
                >
                  <template #label="{ label }">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {{ label }}
                        <span v-if="element.required" class="text-red-500 ml-0.5">*</span>
                      </span>
                      <UBadge color="neutral" variant="soft" size="xs" class="text-[10px] px-1.5 py-0">
                        {{ getFieldTypeName(element.type) }}
                      </UBadge>
                    </div>
                  </template>

                  <!-- Input Previews -->
                  <UInput 
                    v-if="['text', 'email', 'tel', 'url', 'number', 'date'].includes(element.type)" 
                    :id="element.id" 
                    :placeholder="element.placeholder" 
                    disabled 
                    size="sm" 
                    :icon="getFieldIcon(element.type)" 
                  />
                  
                  <UTextarea 
                    v-else-if="element.type === 'textarea'" 
                    :id="element.id" 
                    :placeholder="element.placeholder" 
                    disabled 
                    size="sm" 
                    :rows="2" 
                  />
                  
                  <USelect 
                    v-else-if="element.type === 'select'" 
                    :id="element.id" 
                    placeholder="Seçiniz..." 
                    disabled 
                    size="sm" 
                    :items="element.options?.map((o: any) => o.label) || []" 
                  />
                  
                  <div v-else-if="element.type === 'radio'" class="space-y-2">
                    <URadioGroup
                      :name="element.id"
                      :items="element.options?.length ? element.options : [{ label: 'Seçenek 1', value: '1' }]"
                      disabled
                    />
                  </div>
                  
                  <div v-else-if="element.type === 'checkbox'" class="space-y-2">
                    <template v-if="element.options && element.options.length > 0">
                      <UCheckbox 
                        v-for="(opt, i) in element.options" 
                        :key="i" 
                        :label="opt.label" 
                        disabled 
                      />
                    </template>
                    <UCheckbox v-else :label="element.label" disabled />
                  </div>

                  <div v-else-if="element.type === 'file'">
                    <UInput type="file" disabled size="sm" icon="i-lucide-upload" />
                  </div>

                  <UButton 
                    v-else-if="element.type === 'submit'"
                    :label="element.label || 'Gönder'"
                    block
                    disabled
                  />

                  <div v-else class="h-8 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center px-3 text-xs text-gray-400">
                    <UIcon :name="getFieldIcon(element.type)" class="mr-2 w-4 h-4" />
                    {{ getFieldTypeName(element.type) }}
                  </div>
                </UFormField>
              </div>

              <div class="flex flex-col gap-1 pl-2 border-l border-gray-100 dark:border-gray-800 ml-2" @click.stop>
                <UButton
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-trash"
                  @click="handleRemoveField(index)"
                />
                <UButton
                  :color="expandedFieldIndex === index ? 'primary' : 'neutral'"
                  variant="ghost"
                  size="xs"
                  :icon="expandedFieldIndex === index ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  @click="toggleExpand(index)"
                />
              </div>
            </div>

            <!-- Expanded Settings Mode -->
            <div 
              v-if="expandedFieldIndex === index" 
              class="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-4 animate-in slide-in-from-top-2 duration-200"
              @click.stop
            >
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Etiket (Label)" required class="col-span-2">
                  <UInput v-model="element.label" placeholder="Alan Adı" size="sm" />
                </UFormField>
                
                <UFormField label="Yer Tutucu" class="col-span-1" v-if="!['submit', 'checkbox', 'radio', 'file', 'hidden'].includes(element.type)">
                  <UInput v-model="element.placeholder" placeholder="Örnek metin..." size="sm" />
                </UFormField>

                <div class="col-span-1 flex items-end pb-2">
                  <UCheckbox v-model="element.required" label="Zorunlu Alan" v-if="!['submit', 'hidden'].includes(element.type)" />
                </div>
              </div>

              <!-- Extra FormField Props -->
              <div class="grid grid-cols-3 gap-3" v-if="element.type !== 'hidden'">
                <UFormField label="Açıklama (Description)" class="col-span-1">
                   <UInput v-model="element.description" placeholder="Alt açıklama" size="sm" />
                </UFormField>
                <UFormField label="İpucu (Hint)" class="col-span-1">
                   <UInput v-model="element.hint" placeholder="Sağ üst ipucu" size="sm" />
                </UFormField>
                <UFormField label="Yardım (Help)" class="col-span-1">
                   <UInput v-model="element.help" placeholder="Hata/Yardım metni" size="sm" />
                </UFormField>
              </div>

              <!-- Options for select/radio/checkbox -->
              <div v-if="['select', 'radio', 'checkbox'].includes(element.type)" class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-bold text-gray-500 uppercase">Seçenekler</span>
                  <UButton size="xs" color="primary" variant="soft" icon="i-lucide-plus" @click="addOption(element)">Ekle</UButton>
                </div>
                <div class="space-y-2">
                  <div v-for="(opt, optIndex) in element.options" :key="optIndex" class="flex gap-2">
                    <UInput v-model="opt.label" placeholder="Etiket" size="xs" class="flex-1" />
                    <UInput v-model="opt.value" placeholder="Değer" size="xs" class="flex-1" />
                    <UButton color="error" variant="ghost" size="xs" icon="i-lucide-trash" @click="removeOption(element, Number(optIndex))" />
                  </div>
                  <div v-if="!element.options || element.options.length === 0" class="text-center text-xs text-gray-400 italic py-2">
                    Seçenek ekleyin
                  </div>
                </div>
              </div>

              <!-- Advanced Settings Accordion -->
              <UAccordion :items="[{ label: 'Gelişmiş Ayarlar', slot: 'advanced' }]" class="w-full">
                <template #advanced>
                  <div class="pt-2 space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                       <UFormField label="Varsayılan Değer">
                          <UInput v-model="element.defaultValue" size="sm" />
                       </UFormField>
                       <UFormField label="CSS Sınıfı">
                          <UInput v-model="element.className" size="sm" />
                       </UFormField>
                    </div>
                    <USeparator />
                     <div class="grid grid-cols-2 gap-3" v-if="!['submit', 'checkbox', 'radio', 'file', 'hidden'].includes(element.type)">
                       <UFormField label="Min Karakter">
                          <UInput v-model="element.validation.minLength" type="number" size="sm" />
                       </UFormField>
                       <UFormField label="Max Karakter">
                          <UInput v-model="element.validation.maxLength" type="number" size="sm" />
                       </UFormField>
                    </div>
                  </div>
                </template>
              </UAccordion>
            </div>
          </div>
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
import type { FormDefinition, FormField } from '~~/shared/types/form'
import { slugify } from '~~/utils/slugify'

const formData = defineModel<FormDefinition>({ required: true })

// Auto-generate slug from title
watch(() => formData.value.title, (newVal) => {
  if (newVal && !formData.value.id) { // Only generate if creating new form
    formData.value.slug = slugify(newVal)
  }
})

const expandedFieldIndex = ref<number | null>(null)

const toggleExpand = (index: number) => {
  if (expandedFieldIndex.value === index) {
    expandedFieldIndex.value = null
  } else {
    expandedFieldIndex.value = index
  }
}

const updateFieldOrder = () => {
  formData.value.fields.forEach((field: FormField, index: number) => {
    field.order = index
  })
}

const handleRemoveField = (index: number) => {
  if (confirm('Bu alanı silmek istediğinizden emin misiniz?')) {
    formData.value.fields.splice(index, 1)
    if (expandedFieldIndex.value === index) {
      expandedFieldIndex.value = null
    }
    updateFieldOrder()
  }
}

// Option Management for Select/Radio/Checkbox
const addOption = (field: FormField) => {
  if (!field.options) field.options = []
  field.options.push({ label: 'Yeni Seçenek', value: 'yeni_secenek' })
}

const removeOption = (field: FormField, index: number) => {
  if (field.options) {
    field.options.splice(index, 1)
  }
}

// Toolbox Data & Clone Function
const fieldTypes = [
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
    hidden: 'i-lucide-eye-off'
  }
  return icons[type] || 'i-lucide-box'
}

const getFieldTypeName = (type: string) => {
  const names: Record<string, string> = {
    text: 'Metin',
    email: 'E-posta',
    tel: 'Telefon',
    textarea: 'Uzun Metin',
    select: 'Seçim',
    radio: 'Tekli Seçim',
    checkbox: 'Çoklu Seçim',
    date: 'Tarih',
    file: 'Dosya',
    submit: 'Buton',
    hidden: 'Gizli'
  }
  return names[type] || type
}

const cloneField = (fieldPrototype: any) => {
  const uniqueId = `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  return {
    id: uniqueId,
    type: fieldPrototype.value,
    label: fieldPrototype.value === 'submit' ? 'Gönder' : fieldPrototype.label,
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
}
</script>
