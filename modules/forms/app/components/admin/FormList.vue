<template>
  <div
    v-if="loading"
    class="flex justify-center items-center h-64"
  >
    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
      <UIcon 
        name="i-lucide-loader-circle" 
        class="animate-spin w-8 h-8 text-primary-500" 
      />
    </div>
  </div>

  <div
    v-else-if="forms.length === 0"
    class="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
  >
    <UIcon
      name="i-lucide-form-input"
      class="w-12 h-12 text-gray-400 mb-4 mx-auto"
    />
    <p class="text-gray-500 mb-4 font-medium">
      Henüz form oluşturulmamış
    </p>
  </div>

  <div
    v-else
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    <UCard
      v-for="form in forms"
      :key="form.id"
      class="hover:shadow-lg transition-shadow cursor-default"
      :ui="{ header: 'pb-0 border-none' }"
    >
      <template #header>
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ form.title }}
            </h3>
            <p class="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded mt-1 inline-block">
              {{ form.slug }}
            </p>
          </div>
          <UDropdownMenu :items="getActions(form)">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-more-vertical"
            />
          </UDropdownMenu>
        </div>
      </template>

      <div class="space-y-4 py-4">
        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[40px]">
          {{ form.description || 'Açıklama yok' }}
        </p>
        <div class="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span class="flex items-center gap-1"><UIcon name="i-lucide-layers" /> {{ form.fields.length }} Alan</span>
          <span>•</span>
          <span class="flex items-center gap-1"><UIcon name="i-lucide-calendar" /> {{ new Date(form.createdAt).toLocaleDateString('tr-TR') }}</span>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="subtle"
            size="sm"
            icon="i-lucide-edit"
            block
            @click="$emit('edit', form)"
          >
            Düzenle
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-eye"
            @click="$emit('preview', form)"
          >
            Önizle
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FormDefinition } from '../../../../../shared/types/form'

defineProps<{
  forms: FormDefinition[]
  loading: boolean
}>()

const emit = defineEmits<{
  edit: [form: FormDefinition]
  preview: [form: FormDefinition]
  delete: [form: FormDefinition]
  submissions: [form: FormDefinition]
}>()

const getActions = (form: FormDefinition) => [
  [{
    label: 'Düzenle',
    icon: 'i-lucide-edit',
    onSelect: () => emit('edit', form)
  }, {
    label: 'Gönderimler',
    icon: 'i-lucide-mail',
    onSelect: () => emit('submissions', form)
  }],
  [{
    label: 'Önizle',
    icon: 'i-lucide-eye',
    onSelect: () => emit('preview', form)
  }],
  [{
    label: 'Sil',
    icon: 'i-lucide-trash',
    color: 'error' as const,
    onSelect: () => emit('delete', form)
  }]
]
</script>
