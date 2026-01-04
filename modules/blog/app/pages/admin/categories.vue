<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { slugify } from '../../../../../utils/slugify'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const search = ref('')
const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)

const state = reactive({
  id: '',
  name: '',
  slug: '',
  description: ''
})

const { data: categories, refresh, status, error } = useFetch<any>('/api/admin/categories')

const isLoading = computed(() => status.value === 'pending')

const filteredCategories = computed(() => {
  if (!search.value) return categories.value || []
  return (categories.value || []).filter((c: any) => 
    c.name.toLowerCase().includes(search.value.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.value.toLowerCase())
  )
})

const columns = [
  { accessorKey: 'name', header: 'Kategori Adı' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'description', header: 'Açıklama' },
  { id: 'actions', header: 'İşlemler' }
]

const schema = z.object({
  name: z.string().min(1, 'Kategori adı gereklidir'),
  slug: z.string().min(1, 'Slug gereklidir'),
  description: z.string().optional()
})

type Schema = z.infer<typeof schema>

watch(() => state.name, (newVal) => {
  if (newVal && !isEditMode.value) {
    state.slug = slugify(newVal)
  }
})

function openCreateDrawer() {
  isEditMode.value = false
  Object.assign(state, {
    id: '',
    name: '',
    slug: '',
    description: ''
  })
  isDrawerOpen.value = true
}

function openEditDrawer(category: any) {
  isEditMode.value = true
  Object.assign(state, {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || ''
  })
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const payload = event.data

    if (isEditMode.value) {
      await $fetch(`/api/admin/categories/${state.id}`, {
        method: 'PUT',
        body: payload
      })
      useToast().add({ title: 'Kategori güncellendi', color: 'success' })
    } else {
      await $fetch('/api/admin/categories', {
        method: 'POST',
        body: payload
      })
      useToast().add({ title: 'Kategori oluşturuldu', color: 'success' })
    }

    isDrawerOpen.value = false
    await refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

async function deleteCategory(id: string) {
  if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    useToast().add({ title: 'Kategori silindi', color: 'success' })
    await refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.message, color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="Kategori Yönetimi">
      <template #right>
        <UButton
          label="Yeni Kategori"
          icon="i-lucide-plus"
          color="primary"
          @click="openCreateDrawer"
        />
      </template>
    </UDashboardNavbar>

    <UDashboardToolbar>
      <template #left>
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Kategori ara..."
          class="w-64"
        />
      </template>
    </UDashboardToolbar>

    <div class="flex-1 overflow-y-auto p-4">
      <UCard :ui="{ body: 'p-0' }" class="flex-1">
        <UTable
          :data="filteredCategories"
          :columns="columns"
          :loading="isLoading"
          class="w-full"
        >
          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton
                icon="i-lucide-edit-2"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openEditDrawer(row.original)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                @click="deleteCategory(row.original.id)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </div>
  </UDashboardPanel>

  <ClientOnly>
    <USlideover
      v-model:open="isDrawerOpen"
      :title="isEditMode ? 'Kategoriyi Düzenle' : 'Yeni Kategori'"
    >
      <template #content>
        <div class="p-6">
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField label="Kategori Adı" name="name" required>
              <UInput v-model="state.name" placeholder="Örn: Teknoloji" />
            </UFormField>

            <UFormField label="Slug" name="slug" required>
              <UInput v-model="state.slug" placeholder="teknoloji" />
            </UFormField>

            <UFormField label="Açıklama" name="description">
              <UTextarea v-model="state.description" placeholder="Kategori açıklaması..." />
            </UFormField>

            <div class="flex justify-end gap-3 pt-4">
              <UButton
                label="Vazgeç"
                color="neutral"
                variant="ghost"
                @click="isDrawerOpen = false"
              />
              <UButton
                type="submit"
                :label="isEditMode ? 'Güncelle' : 'Oluştur'"
                color="primary"
                :loading="isSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
