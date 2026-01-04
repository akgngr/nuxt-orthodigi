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
  slug: ''
})

const { data: tags, refresh, status, error } = useFetch<any>('/api/admin/tags')

const isLoading = computed(() => status.value === 'pending')

const filteredTags = computed(() => {
  if (!search.value) return tags.value || []
  return (tags.value || []).filter((t: any) => 
    t.name.toLowerCase().includes(search.value.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.value.toLowerCase())
  )
})

const columns = [
  { accessorKey: 'name', header: 'Etiket Adı' },
  { accessorKey: 'slug', header: 'Slug' },
  { id: 'actions', header: 'İşlemler' }
]

const schema = z.object({
  name: z.string().min(1, 'Etiket adı gereklidir'),
  slug: z.string().min(1, 'Slug gereklidir')
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
    slug: ''
  })
  isDrawerOpen.value = true
}

function openEditDrawer(tag: any) {
  isEditMode.value = true
  Object.assign(state, {
    id: tag.id,
    name: tag.name,
    slug: tag.slug
  })
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const payload = event.data

    if (isEditMode.value) {
      await $fetch(`/api/admin/tags/${state.id}`, {
        method: 'PUT',
        body: payload
      })
      useToast().add({ title: 'Etiket güncellendi', color: 'success' })
    } else {
      await $fetch('/api/admin/tags', {
        method: 'POST',
        body: payload
      })
      useToast().add({ title: 'Etiket oluşturuldu', color: 'success' })
    }

    isDrawerOpen.value = false
    await refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

async function deleteTag(id: string) {
  if (!confirm('Bu etiketi silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
    useToast().add({ title: 'Etiket silindi', color: 'success' })
    await refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.message, color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="Etiket Yönetimi">
      <template #right>
        <UButton
          label="Yeni Etiket"
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
          placeholder="Etiket ara..."
          class="w-64"
        />
      </template>
    </UDashboardToolbar>

    <div class="flex-1 overflow-y-auto p-4">
      <UCard :ui="{ body: 'p-0' }" class="flex-1">
        <UTable
          :data="filteredTags"
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
                @click="deleteTag(row.original.id)"
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
      :title="isEditMode ? 'Etiketi Düzenle' : 'Yeni Etiket'"
    >
      <template #content>
        <div class="p-6">
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField label="Etiket Adı" name="name" required>
              <UInput v-model="state.name" placeholder="Örn: Nuxt 3" />
            </UFormField>

            <UFormField label="Slug" name="slug" required>
              <UInput v-model="state.slug" placeholder="nuxt-3" />
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
