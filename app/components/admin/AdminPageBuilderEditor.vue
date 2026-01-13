<script setup lang="ts">
import type { PageComponent } from '@/shared/types/page'
import { usePageBuilder } from '~/modules/components/composables/usePageBuilder'
import FormSelector from '~/components/admin/FormSelector.vue'

const props = defineProps<{
  component: PageComponent,
  loading: boolean
}>()

const emit = defineEmits(['save', 'cancel'])

const state = reactive({
  ...props.component.content
})

const { getComponentDef } = usePageBuilder()
const componentDef = computed(() => getComponentDef(props.component.type))

function getFieldComponent(type: string) {
  switch (type) {
    case 'form-selector':
      return FormSelector
    default:
      return 'UInput' // Fallback
  }
}

async function onSubmit() {
  emit('save', state)
}
</script>

<template>
  <UForm
    :state="state"
    class="space-y-4 p-4"
    @submit="onSubmit"
  >
    <div
      v-if="componentDef"
      class="space-y-4"
    >
      <UFormGroup
        v-for="field in componentDef.schema"
        :key="field.name"
        :label="field.label"
        :name="field.name"
      >
        <component
          :is="getFieldComponent(field.type)"
          v-if="field.type === 'form-selector'"
          v-model="state[field.name]"
        />
        <UInput
          v-else
          v-model="state[field.name]"
          :type="field.type === 'number' ? 'number' : 'text'"
          :placeholder="field.placeholder"
        />
      </UFormGroup>
    </div>
    <div v-else>
      <p>Bilinmeyen bileşen türü: {{ component.type }}</p>
    </div>

    <div class="flex justify-end gap-2">
      <UButton
        label="İptal"
        color="gray"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        label="Kaydet"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
