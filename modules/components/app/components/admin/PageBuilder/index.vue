<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import draggable from 'vuedraggable'
import { usePageBuilder } from '~/modules/components/composables/usePageBuilder'
import type { PageComponent } from '~/shared/types/page'

const props = defineProps<{
  modelValue: PageComponent[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: PageComponent[]): void
  (e: 'edit', component: PageComponent): void
  (e: 'remove', id: string): void
  (e: 'add', type: string): void
}>()

const { componentDefinitions, getComponentDef } = usePageBuilder()
const isAddDrawerOpen = ref(false)

// Local state for draggable
const localComponents = ref<PageComponent[]>([...props.modelValue])

// Watch props to update local state (one-way sync for external changes)
watch(() => props.modelValue, (newVal) => {
  localComponents.value = [...newVal]
}, { deep: true })

// Watch local state to emit changes
const onDragChange = () => {
  emit('update:modelValue', localComponents.value)
}

const onAddComponent = (type: string) => {
  emit('add', type)
  isAddDrawerOpen.value = false
}

const groupedDefinitions = computed(() => {
  const groups: Record<string, typeof componentDefinitions> = {}
  componentDefinitions.forEach(def => {
    const category = def.category || 'other'
    if (!groups[category]) groups[category] = []
    groups[category].push(def)
  })
  return groups
})

const categoryLabels: Record<string, string> = {
  layout: 'Düzen',
  content: 'İçerik',
  media: 'Medya',
  interactive: 'İnteraktif',
  other: 'Diğer'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Empty State -->
    <div
      v-if="localComponents.length === 0"
      class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
      @click="isAddDrawerOpen = true"
    >
      <div class="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-plus" class="w-8 h-8 text-primary-500" />
      </div>
      <h3 class="font-semibold text-lg text-gray-900 dark:text-white mb-1">
        Bileşen Ekle
      </h3>
      <p class="text-sm text-gray-500 max-w-xs mx-auto">
        Sayfanızı oluşturmaya başlamak için ilk bileşeninizi ekleyin.
      </p>
    </div>

    <!-- Draggable List -->
    <draggable
      v-model="localComponents"
      item-key="id"
      handle=".drag-handle"
      group="components"
      ghost-class="ghost"
      drag-class="cursor-grabbing"
      class="space-y-3 min-h-[50px]"
      @end="onDragChange"
    >
      <template #item="{ element, index }">
        <div class="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 transition-all hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm">
          <div class="flex items-center gap-3">
            <!-- Drag Handle -->
            <button class="drag-handle cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded">
              <UIcon name="i-lucide-grip-vertical" class="w-5 h-5" />
            </button>

            <!-- Icon -->
            <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <UIcon :name="getComponentDef(element.type)?.icon || 'i-lucide-box'" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {{ getComponentDef(element.type)?.label || element.type }}
                </span>
                <UBadge color="gray" variant="subtle" size="xs" class="capitalize">
                  {{ element.type }}
                </UBadge>
              </div>
              <p class="text-xs text-gray-500 truncate font-mono opacity-70">
                ID: {{ element.id.substring(0, 8) }}...
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              <UButton
                icon="i-lucide-settings-2"
                color="gray"
                variant="ghost"
                size="sm"
                @click="emit('edit', element)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="red"
                variant="ghost"
                size="sm"
                @click="emit('remove', element.id)"
              />
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Add Button (Bottom) -->
    <div v-if="localComponents.length > 0" class="flex justify-center pt-2">
      <UButton
        label="Bileşen Ekle"
        icon="i-lucide-plus"
        color="gray"
        variant="solid"
        class="rounded-full px-6"
        @click="isAddDrawerOpen = true"
      />
    </div>

    <!-- Add Component Drawer -->
    <USlideover v-model:open="isAddDrawerOpen" title="Bileşen Ekle">
      <template #content>
        <div class="p-4 space-y-6 overflow-y-auto h-full bg-gray-50 dark:bg-gray-950">
          <div v-for="(items, category) in groupedDefinitions" :key="category" class="space-y-3">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              {{ categoryLabels[category as string] || category }}
            </h4>
            <div class="grid grid-cols-1 gap-3">
              <button
                v-for="item in items"
                :key="item.type"
                class="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all text-left group"
                @click="onAddComponent(item.type)"
              >
                <div class="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                  <UIcon :name="item.icon" class="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                </div>
                <div>
                  <h5 class="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {{ item.label }}
                  </h5>
                  <p class="text-xs text-gray-500 leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
}
</style>
