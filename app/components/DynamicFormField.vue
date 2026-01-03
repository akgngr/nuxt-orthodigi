<template>
  <div v-if="field.type === 'row'" class="grid gap-4" :class="gridColsClass">
    <div v-for="col in field.columns" :key="col.id">
      <div v-for="childField in col.fields" :key="childField.id" class="space-y-4">
        <DynamicFormField :field="childField" :state="state" />
      </div>
    </div>
  </div>

  <template v-else-if="field.type === 'hidden'">
    <input type="hidden" :name="field.id" v-model="state[field.id]" />
  </template>

  <!-- Submit Button -->
  <div v-else-if="field.type === 'submit'">
    <UButton
      type="submit"
      :label="field.label || 'Gönder'"
      :loading="submitting"
      :class="[field.className, 'w-full']"
      block
    />
  </div>

  <UFormField
    v-else
    :label="field.label"
    :name="field.id"
    :required="field.required"
    :description="field.description"
    :hint="field.hint"
    :help="field.help"
  >
    <!-- Text Input -->
    <UInput
      v-if="['text', 'email', 'phone'].includes(field.type)"
      v-model="state[field.id]"
      :id="field.id"
      :type="field.type"
      :placeholder="field.placeholder"
      :required="field.required"
      :class="[field.className, 'w-full']"
    />

    <!-- Textarea -->
    <UTextarea
      v-else-if="field.type === 'textarea'"
      v-model="state[field.id]"
      :id="field.id"
      :placeholder="field.placeholder"
      :required="field.required"
      :class="[field.className, 'w-full']"
    />

    <!-- Select -->
    <USelect
      v-else-if="field.type === 'select'"
      v-model="state[field.id]"
      :id="field.id"
      :items="selectOptions"
      :placeholder="field.placeholder || 'Lütfen Seçin'"
      :required="field.required"
      :class="[field.className, 'w-full']"
      option-attribute="label"
      value-attribute="value"
    />

    <!-- Radio Buttons -->
    <URadioGroup
      v-else-if="field.type === 'radio'"
      v-model="state[field.id]"
      :id="field.id"
      :name="field.id"
      :items="field.options"
      :required="field.required"
    />

    <!-- Checkbox -->
    <div v-else-if="field.type === 'checkbox'" :id="field.id" class="space-y-2">
      <template v-if="field.options && field.options.length > 0">
        <div v-for="option in field.options" :key="option.value" class="flex items-center">
          <UCheckbox
            :id="option.value"
            :label="option.label"
            :value="option.value"
            :model-value="Array.isArray(state[field.id]) && state[field.id].includes(option.value)"
            @update:model-value="(val: any) => onCheckboxChange(field.id, option.value, val)"
            class="w-full"
          />
        </div>
      </template>
      <template v-else>
        <UCheckbox
          v-model="state[field.id]"
          :id="field.id"
          :label="field.label"
          :required="field.required"
          class="w-full"
        />
      </template>
    </div>

    <!-- Date Picker -->
    <UInput
      v-else-if="field.type === 'date'"
      v-model="state[field.id]"
      :id="field.id"
      type="date"
      :placeholder="field.placeholder"
      :required="field.required"
      :class="[field.className, 'w-full']"
    />

    <!-- File Input -->
    <UInput
      v-else-if="field.type === 'file'"
      type="file"
      :id="field.id"
      :placeholder="field.placeholder"
      :required="field.required"
      :class="[field.className, 'w-full']"
      icon="i-lucide-upload"
      @change="(e: Event) => onFileChange(field.id, e)"
    />
  </UFormField>
</template>

<script setup lang="ts">
import type { FormField } from '~~/shared/types/form'

defineOptions({
  name: 'DynamicFormField'
})

const props = defineProps<{
  field: FormField
  state: Record<string, any>
}>()

// Inject handlers
const onCheckboxChange = inject<(id: string, value: string, checked: boolean) => void>('handleCheckboxChange', () => {})
const onFileChange = inject<(id: string, event: Event) => void>('handleFileChange', () => {})
const submitting = inject('formSubmitting', ref(false))

const gridColsClass = computed(() => {
  const count = props.field.columns?.length || 1
  return {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[count] || 'grid-cols-1'
})

const selectOptions = computed(() => {
  const options = props.field.options || []
  return [
    { label: 'Lütfen Seçin', value: undefined, disabled: true },
    ...options
  ]
})
</script>
