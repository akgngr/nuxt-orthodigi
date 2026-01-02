<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Role type definition
interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  _count?: {
    users: number
  }
}

// Permission type definition
interface Permission {
  id: string
  name: string
  description?: string
}

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// --- State ---
const page = ref(1)
const limit = ref(10)
const search = ref('')

const { data, refresh: refreshRoles, status: rolesStatus, error: rolesError } = await useFetch<any>('/api/admin/roles', {
  query: {
    page,
    limit,
    search
  },
  watch: [page, limit, search]
})
const { data: allPermissionsData, status: permissionsStatus, error: permissionsError } = await useFetch<any>('/api/admin/permissions')

const roles = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isLoading = computed(() => rolesStatus.value === 'pending' || permissionsStatus.value === 'pending')

const state = reactive({
  id: '',
  name: '',
  description: '',
  selectedPermissions: [] as Permission[]
})

const schema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  selectedPermissions: z.array(z.object({ id: z.string(), name: z.string() })).optional()
})

type Schema = z.infer<typeof schema>

// --- Actions ---
function openCreateDrawer() {
  isEditMode.value = false
  state.id = ''
  state.name = ''
  state.description = ''
  state.selectedPermissions = []
  isDrawerOpen.value = true
}

function openEditDrawer(role: any) {
  isEditMode.value = true
  state.id = role.id
  state.name = role.name
  state.description = role.description || ''
  // Ensure we use the exact objects from the permissions list for reference equality
  const rolePermissionIds = new Set(role.permissions?.map((p: any) => p.id) || [])
  state.selectedPermissions = permissions.value.filter((p: any) => rolePermissionIds.has(p.id))
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const payload = {
      ...event.data,
      permissionIds: state.selectedPermissions.map(p => p.id)
    }
    // Remove selectedPermissions from payload as API expects permissionIds
    delete (payload as any).selectedPermissions

    if (isEditMode.value) {
      await $fetch(`/api/admin/roles/${state.id}`, {
        method: 'PUT',
        body: payload
      })
      useToast().add({ title: 'Rol güncellendi', color: 'success' })
    } else {
      await $fetch('/api/admin/roles', {
        method: 'POST',
        body: payload
      })
      useToast().add({ title: 'Rol oluşturuldu', color: 'success' })
    }
    isDrawerOpen.value = false
    refreshRoles()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.statusMessage || error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

// Table columns
const columns = [
  { accessorKey: 'name', header: 'Rol Adı' },
  { accessorKey: 'description', header: 'Açıklama' },
  { accessorKey: 'permissions', header: 'İzinler' },
  { accessorKey: '_count', header: 'Kullanıcı Sayısı' },
  { id: 'actions', header: 'İşlemler' }
]

const items = computed(() => roles.value || [])
const permissions = computed(() => allPermissionsData.value?.items || [])

// Error handling
if (rolesError.value) {
  console.error('Roller yüklenirken hata:', rolesError.value)
  useToast().add({
    title: 'Roller yüklenemedi',
    description: rolesError.value.message,
    color: 'error'
  })
}

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

    <UDashboardNavbar title="Rol Yönetimi">
      <template #right>
        <UButton
          label="Yeni Rol"
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
          placeholder="Rol ara..."
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

          <template #permissions-cell="{ row }">
            <div class="flex flex-wrap gap-1 max-w-xs">
              <UBadge
                v-for="perm in ((row.original as any).permissions as any[] || []).slice(0, 3)"
                :key="perm.id"
                color="primary"
                variant="subtle"
                size="xs"
              >
                {{ perm.name }}
              </UBadge>
              <UBadge
                v-if="((row.original as any).permissions as any[] || []).length > 3"
                color="neutral"
                variant="subtle"
                size="xs"
              >
                +{{ ((row.original as any).permissions as any[]).length - 3 }}
              </UBadge>
            </div>
          </template>

          <template #_count-cell="{ row }">
            <UBadge
              color="neutral"
              variant="outline"
              size="xs"
            >
              {{ (row.original as any)._count?.users || 0 }} Kullanıcı
            </UBadge>
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
      title="Rol Yönetimi"
    >
      <template #content>
        <div class="p-6">
          <UForm
            id="role-form"
            :schema="schema"
            :state="state"
            class="space-y-6"
            @submit="onSubmit"
          >
            <UFormField
              label="Rol Adı"
              name="name"
            >
              <UInput
                v-model="state.name"
                placeholder="Admin, Editor, vb."
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Açıklama"
              name="description"
            >
              <UTextarea
                v-model="state.description"
                placeholder="Bu rolün yetkileri..."
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="İzinler"
              name="selectedPermissions"
            >
              <USelectMenu
                v-model="state.selectedPermissions"
                :items="permissions"
                label-key="name"
                multiple
                placeholder="İzinleri Seçin"
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
