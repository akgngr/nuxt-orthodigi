<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Permission type definition
interface Permission {
  id: string
  name: string
  description?: string
  createdAt: string
}

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// --- State ---
const page = ref(1)
const limit = ref(10)
const search = ref('')

const { data, refresh: refreshPermissions, status: permissionsStatus, error: permissionsError } = await useFetch<any>('/api/admin/permissions', {
  query: {
    page,
    limit,
    search
  },
  watch: [page, limit, search]
})

const permissions = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isLoading = computed(() => permissionsStatus.value === 'pending')

const state = reactive({
  id: '',
  name: '',
  description: ''
})

const schema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  description: z.string().optional()
})

type Schema = z.infer<typeof schema>

// --- Actions ---
function openCreateDrawer() {
  isEditMode.value = false
  state.id = ''
  state.name = ''
  state.description = ''
  isDrawerOpen.value = true
}

function openEditDrawer(permission: any) {
  isEditMode.value = true
  state.id = permission.id
  state.name = permission.name
  state.description = permission.description || ''
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    if (isEditMode.value) {
      await $fetch(`/api/admin/permissions/${state.id}`, {
        method: 'PUT',
        body: event.data
      })
      useToast().add({ title: 'İzin güncellendi', color: 'success' })
    } else {
      await $fetch('/api/admin/permissions', {
        method: 'POST',
        body: event.data
      })
      useToast().add({ title: 'İzin oluşturuldu', color: 'success' })
    }
    isDrawerOpen.value = false
    refreshPermissions()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.statusMessage || error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

// Table columns
const columns = [
  { accessorKey: 'name', header: 'İzin Kodu' },
  { accessorKey: 'description', header: 'Açıklama' },
  { accessorKey: 'createdAt', header: 'Oluşturulma Tarihi' },
  { id: 'actions', header: 'İşlemler' }
]

const items = computed<Permission[]>(() => permissions.value || [])

// Error handling
if (permissionsError.value) {
  console.error('İzinler yüklenirken hata:', permissionsError.value)
  useToast().add({
    title: 'İzinler yüklenemedi',
    description: permissionsError.value.message,
    color: 'error'
  })
}
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="İzin Yönetimi">
      <template #right>
        <UButton
          label="Yeni İzin"
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
          placeholder="İzin ara..."
          class="w-64"
        />
      </template>
    </UDashboardToolbar>

    <div class="flex-1 overflow-y-auto p-4">
      <UCard
        :ui="{ body: 'p-0' }"
        class="flex-1"
      >
        <UTable
          :loading="isLoading"
          :columns="columns"
          :data="items"
          class="w-full"
        >
          <template #name-cell="{ row }">
            <span class="font-bold text-gray-900 dark:text-white">{{ (row.original as any).name }}</span>
          </template>

          <template #description-cell="{ row }">
            <span class="text-sm text-gray-500">{{ (row.original as any).description || '-' }}</span>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-sm">
              {{ new Date((row.original as any).createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton
                icon="i-lucide-edit-2"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openEditDrawer(row.original as any)"
              />
            </div>
          </template>
        </UTable>

        <template
          v-if="total > limit"
          #footer
        >
          <div class="flex justify-center">
            <UPagination
              v-model:page="page"
              :total="total"
              :page-count="limit"
            />
          </div>
        </template>
      </UCard>
    </div>
  </UDashboardPanel>

  <!-- Drawer -->
  <ClientOnly>
    <USlideover
      v-model:open="isDrawerOpen"
      title="İzin Yönetimi"
    >
      <template #content>
        <div class="p-6">
          <UForm
            id="permission-form"
            :schema="schema"
            :state="state"
            class="space-y-6"
            @submit="onSubmit"
          >
            <UFormField
              label="İzin Kodu"
              name="name"
              help="Örnek: users:read, roles:write"
            >
              <UInput
                v-model="state.name"
                placeholder="users:read"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Açıklama"
              name="description"
            >
              <UTextarea
                v-model="state.description"
                placeholder="Bu izin ne işe yarar?"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <UButton
                label="İptal"
                color="neutral"
                variant="ghost"
                @click="isDrawerOpen = false"
              />
              <UButton
                type="submit"
                label="Kaydet"
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
