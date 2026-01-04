<template>
  <div
    class="group relative border rounded-xl transition-all bg-white dark:bg-gray-900"
    :class="[
      isExpanded
        ? 'border-primary-500 ring-1 ring-primary-500 shadow-lg z-10' 
        : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
    ]"
  >
    <!-- Row Layout Handling -->
    <div v-if="element.type === 'row'" class="p-4">
      <div class="flex items-center justify-between mb-2 cursor-pointer" @click="$emit('toggle-expand', element.id)">
        <div class="flex items-center gap-2">
          <div class="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400">
            <UIcon name="i-lucide-grip-vertical" class="w-4 h-4" />
          </div>
          <UBadge color="neutral" variant="soft" size="xs">Satır ({{ element.columns?.length || 0 }} Kolon)</UBadge>
        </div>
        <div class="flex items-center gap-1">
          <UButton color="error" variant="ghost" size="xs" icon="i-lucide-trash" @click.stop="$emit('remove', element.id)" />
          <UButton 
            :icon="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            variant="ghost" 
            size="xs" 
          />
        </div>
      </div>

      <!-- Settings for Row (Column Config) -->
      <div v-if="isExpanded" class="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700" @click.stop>
         <UFormField label="Kolon Sayısı">
            <div class="flex gap-2">
              <UButton 
                v-for="n in [1, 2, 3, 4]" 
                :key="n"
                :variant="element.columns?.length === n ? 'solid' : 'soft'"
                :color="element.columns?.length === n ? 'primary' : 'neutral'"
                size="xs"
                @click="updateColumnCount(n)"
              >
                {{ n }} Kolon
              </UButton>
            </div>
         </UFormField>
      </div>

      <!-- Columns Container -->
      <div class="grid gap-4" :class="gridColsClass">
        <div 
          v-for="(col, colIndex) in element.columns" 
          :key="col.id"
          class="min-h-[100px] border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 p-2"
        >
          <draggable
            v-model="col.fields"
            item-key="id"
            class="h-full space-y-2"
            group="form-builder"
            handle=".drag-handle"
          >
            <template #item="{ element: childElement }">
              <FormBuilderItem
                :element="childElement"
                :expanded-field-id="expandedFieldId"
                @toggle-expand="$emit('toggle-expand', $event)"
                @remove="removeNestedField(colIndex, $event)"
              />
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- Standard Field Handling -->
    <div v-else>
      <!-- Header / Preview Mode -->
      <div 
        class="p-4 flex items-start gap-3 cursor-pointer"
        @click="$emit('toggle-expand', element.id)"
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
              class="w-full"
            />
            
            <UTextarea 
              v-else-if="element.type === 'textarea'" 
              :id="element.id" 
              :placeholder="element.placeholder" 
              disabled 
              size="sm" 
              :rows="2" 
              class="w-full"
            />
            
            <USelect 
              v-else-if="element.type === 'select'" 
              :id="element.id" 
              placeholder="Lütfen Seçin" 
              disabled 
              size="sm" 
              :items="['Lütfen Seçin', ...(element.options?.map((o: any) => o.label) || [])]"
              :model-value="'Lütfen Seçin'"
              class="w-full"
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
                  :value="opt.value" 
                  disabled 
                />
              </template>
              <UCheckbox v-else :label="element.label" disabled />
            </div>

            <div v-else-if="element.type === 'file'">
              <UInput type="file" disabled size="sm" icon="i-lucide-upload" class="w-full" />
            </div>

            <UButton 
              v-else-if="element.type === 'submit'"
              :label="element.label || 'Gönder'"
              block
              disabled
              class="w-full"
            />

            <div v-else class="h-8 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center px-3 text-xs text-gray-400 w-full">
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
            @click="$emit('remove', element.id)"
          />
          <UButton
            :color="isExpanded ? 'primary' : 'neutral'"
            variant="ghost"
            size="xs"
            :icon="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            @click="$emit('toggle-expand', element.id)"
          />
        </div>
      </div>

      <!-- Expanded Settings Mode -->
      <div 
        v-if="isExpanded" 
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
              <UInput 
                :model-value="opt.label" 
                placeholder="Etiket" 
                size="xs" 
                class="flex-1"
                @update:model-value="(val: string) => onOptionLabelInput(opt, val)" 
              />
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
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FormBuilderItem'
})
import draggable from 'vuedraggable'
import type { FormField } from '~~/shared/types/form'
import { slugify } from '~~/utils/slugify'

const props = defineProps<{
  element: FormField
  expandedFieldId: string | null
}>()

const emit = defineEmits<{
  (e: 'toggle-expand', id: string): void
  (e: 'remove', id: string): void
}>()

const isExpanded = computed(() => props.expandedFieldId === props.element.id)

const gridColsClass = computed(() => {
  const count = props.element.columns?.length || 1
  return {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[count] || 'grid-cols-1'
})

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
    hidden: 'Gizli',
    row: 'Satır'
  }
  return names[type] || type
}

// Option Management
const addOption = (field: FormField) => {
  if (!field.options) field.options = []
  field.options.push({ label: 'Yeni Seçenek', value: 'yeni_secenek' })
}

const removeOption = (field: FormField, index: number) => {
  if (field.options) {
    field.options.splice(index, 1)
  }
}

const onOptionLabelInput = (opt: any, val: string) => {
  opt.label = val
  opt.value = slugify(val)
}

// Row/Column Management
const updateColumnCount = (count: number) => {
  if (!props.element.columns) props.element.columns = []
  
  const currentCount = props.element.columns.length
  
  if (count > currentCount) {
    // Add columns
    for (let i = 0; i < count - currentCount; i++) {
       const uniqueId = `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
       props.element.columns.push({
         id: uniqueId,
         fields: [],
         width: 12 / count // Approximation
       })
    }
  } else if (count < currentCount) {
    // Remove columns (check for fields first?)
    if (confirm('Kolon sayısı azaltılacak. Fazlalık kolonlardaki alanlar silinebilir. Devam edilsin mi?')) {
       props.element.columns.splice(count)
    }
  }
}

const removeNestedField = (colIndex: number, fieldId: string) => {
  if (!props.element.columns) return
  const col = props.element.columns[colIndex]
  const idx = col.fields.findIndex(f => f.id === fieldId)
  if (idx > -1) {
    col.fields.splice(idx, 1)
    
    const toast = useToast()
    toast.add({
      title: 'Alan Silindi',
      description: 'Form alanı başarıyla silindi.',
      color: 'green',
      icon: 'i-lucide-check-circle'
    })
  }
}
</script>
