<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PageComponent } from '#shared/types/page'
import { usePageBuilder } from '../../../../composables/usePageBuilder'
import PropsEditor from './PropsEditor.vue'

const props = defineProps<{
  component: PageComponent | null
  loading?: boolean
  hideActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', content: any): void
  (e: 'cancel'): void
  (e: 'update:content', content: any): void
}>()

const { getComponentDef } = usePageBuilder()
const localContent = ref<any>({})

const schema = computed(() => {
  if (!props.component) return []
  const def = getComponentDef(props.component.type)
  return def?.schema || []
})

watch(() => props.component, (newVal) => {
  if (newVal) {
    localContent.value = JSON.parse(JSON.stringify(newVal.content))
  } else {
    localContent.value = {}
  }
}, { immediate: true })

watch(localContent, (newVal) => {
  if (props.hideActions) {
    emit('update:content', newVal)
  }
}, { deep: true })

const onSave = () => {
  emit('save', localContent.value)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="component" class="space-y-6">
        <div class="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-medium text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon :name="getComponentDef(component.type)?.icon || 'i-lucide-box'" class="w-5 h-5 text-gray-500" />
            {{ getComponentDef(component.type)?.label || component.type }} Düzenle
          </h3>
          <p class="text-sm text-gray-500">{{ getComponentDef(component.type)?.description }}</p>
        </div>

        <PropsEditor
          v-if="schema.length > 0"
          :schema="schema"
          v-model="localContent"
        />

        <!-- Fallback if no schema -->
        <div v-else class="space-y-4">
          <p class="text-sm text-gray-500 mb-2">
            Bu bileşen türü için özel düzenleyici şeması bulunamadı. Ham JSON verisini düzenleyebilirsiniz:
          </p>
          <UTextarea
            :model-value="JSON.stringify(localContent, null, 2)"
            :rows="15"
            font-mono
            @update:model-value="val => {
              try { Object.assign(localContent, JSON.parse(val)) }
              catch (e) {}
            }"
          />
        </div>
      </div>
    </div>

    <div v-if="!hideActions" class="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
      <UButton
        label="İptal"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
      />
      <UButton
        label="Kaydet"
        color="primary"
        :loading="loading"
        @click="onSave"
      />
    </div>
  </div>
</template>
