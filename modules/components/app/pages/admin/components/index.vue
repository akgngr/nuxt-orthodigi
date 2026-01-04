<script setup lang="ts">
import { ref, reactive } from 'vue'
import { z } from 'zod'
import { usePageBuilder } from '~~/modules/components/composables/usePageBuilder'
import PageBuilderEditor from '~~/modules/components/app/components/admin/PageBuilder/Editor.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { componentDefinitions, getComponentLabel, getComponentIcon } = usePageBuilder()
const toast = useToast()

const columns = [
  { accessorKey: 'title', header: 'Başlık' },
  { accessorKey: 'type', header: 'Tür' },
  { accessorKey: 'description', header: 'Açıklama' },
  { accessorKey: 'updatedAt', header: 'Son Güncelleme' },
  { id: 'actions', header: 'İşlemler' }
]

const page = ref(1)
const search = ref('')
const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSelectingType = ref(false)

const state = reactive({
  id: '',
  title: '',
  type: '',
  description: '',
  content: {} as Record<string, any>
})

const { data, refresh, status } = await useFetch('/api/admin/components', {
  query: computed(() => ({
    page: page.value,
    search: search.value
  }))
})

function openCreate() {
  isEditMode.value = false
  isSelectingType.value = true
  isDrawerOpen.value = true
  state.id = ''
  state.title = ''
  state.description = ''
  state.type = ''
  state.content = {}
}

function selectType(type: string) {
  state.type = type
  const def = componentDefinitions.find(c => c.type === type)
  state.content = JSON.parse(JSON.stringify(def?.defaultContent || {}))
  isSelectingType.value = false
}

function editItem(item: any) {
  isEditMode.value = true
  isSelectingType.value = false
  isDrawerOpen.value = true
  state.id = item.id
  state.title = item.title
  state.description = item.description
  state.type = item.type
  state.content = JSON.parse(JSON.stringify(item.content))
}

async function save() {
  if (!state.title) {
    toast.add({ title: 'Başlık zorunludur', color: 'red' })
    return
  }

  try {
    if (isEditMode.value) {
      await $fetch(`/api/admin/components/${state.id}`, {
        method: 'PUT',
        body: {
          title: state.title,
          description: state.description,
          content: state.content
        }
      })
      toast.add({ title: 'Bileşen güncellendi', color: 'green' })
    } else {
      await $fetch('/api/admin/components', {
        method: 'POST',
        body: {
          title: state.title,
          type: state.type,
          description: state.description,
          content: state.content
        }
      })
      toast.add({ title: 'Bileşen oluşturuldu', color: 'green' })
    }
    isDrawerOpen.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Hata oluştu', description: error.message, color: 'red' })
  }
}

async function deleteItem(id: string) {
  if (!confirm('Bu bileşeni silmek istediğinize emin misiniz?')) return

  try {
    await $fetch(`/api/admin/components/${id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Bileşen silindi', color: 'green' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Silinemedi', description: error.message, color: 'red' })
  }
}
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Bileşenler</h1>
      <UButton
        label="Yeni Bileşen"
        icon="i-lucide-plus"
        color="primary"
        @click="openCreate"
      />
    </div>

    <div class="flex gap-4">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Ara..."
        class="max-w-xs"
      />
    </div>

    <UTable
      :data="data?.items || []"
      :columns="columns"
      :loading="status === 'pending'"
    >
      <template #type-cell="{ row }">
        <div class="flex items-center gap-2">
          <UIcon :name="getComponentIcon(row.original.type)" class="w-4 h-4" />
          <span>{{ getComponentLabel(row.original.type) }}</span>
        </div>
      </template>
      
      <template #updatedAt-cell="{ row }">
        {{ new Date(row.original.updatedAt).toLocaleDateString('tr-TR') }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-edit"
            color="gray"
            variant="ghost"
            size="xs"
            @click="editItem(row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="red"
            variant="ghost"
            size="xs"
            @click="deleteItem(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <!-- Drawer -->
    <USlideover v-model:open="isDrawerOpen" :ui="{ width: 'max-w-2xl' }">
      <template #content>
        <div class="flex flex-col h-full bg-white dark:bg-gray-900">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            {{ isSelectingType ? 'Bileşen Türü Seçin' : (isEditMode ? 'Bileşeni Düzenle' : 'Yeni Bileşen') }}
          </h2>
          <UButton icon="i-lucide-x" color="gray" variant="ghost" @click="isDrawerOpen = false" />
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <!-- Step 1: Select Type -->
          <div v-if="isSelectingType" class="grid grid-cols-2 gap-4">
            <button
              v-for="def in componentDefinitions"
              :key="def.type"
              class="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center"
              @click="selectType(def.type)"
            >
              <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <UIcon :name="def.icon" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ def.label }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ def.description }}</p>
              </div>
            </button>
          </div>

          <!-- Step 2: Edit Details & Content -->
          <div v-else class="space-y-6">
            <div class="space-y-4">
              <UFormGroup label="Başlık" required>
                <UInput v-model="state.title" placeholder="Örn: Ana Sayfa Hero" />
              </UFormGroup>
              
              <UFormGroup label="Açıklama">
                <UTextarea v-model="state.description" placeholder="Bileşen hakkında notlar..." />
              </UFormGroup>
            </div>

            <UDivider label="İçerik Düzenleyici" />

            <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <PageBuilderEditor
                :component="{ id: 'temp', type: state.type, content: state.content, order: 0 }"
                hide-actions
                @update:content="(val) => state.content = val"
              />
            </div>
          </div>
        </div>

        <div v-if="!isSelectingType" class="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
          <UButton label="İptal" color="gray" variant="ghost" @click="isDrawerOpen = false" />
          <UButton label="Kaydet" color="primary" @click="save" />
        </div>
      </div>
      </template>
    </USlideover>
  </div>
</template>
