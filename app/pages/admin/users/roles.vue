<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
 

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
const { data: roles, refresh: refreshRoles, status: rolesStatus, error: rolesError } = await useFetch<Role[]>('/api/admin/roles')
const { data: allPermissions, status: permissionsStatus, error: permissionsError } = await useFetch<Permission[]>('/api/admin/permissions')

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
  state.selectedPermissions = permissions.value.filter(p => rolePermissionIds.has(p.id))
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

// Basit tablo için kolon başlıkları (HTML table kullanılıyor)
const columns = ['Rol Adı', 'Açıklama', 'İzinler', 'Kullanıcı Sayısı', 'İşlemler']

const items = computed(() => roles.value || [])
const permissions = computed(() => allPermissions.value || [])

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
    <template #header>
      <AdminNavbar>
        <template #leading>
            <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Rol Yönetimi</h1>
        </template>
        <template #trailing>
            <UButton icon="i-lucide-plus" label="Yeni Rol" color="primary" class="font-bold rounded-xl" @click="openCreateDrawer" />
        </template>
      </AdminNavbar>
    </template>

    <template #body>
      <UCard class="shadow-sm border-none bg-white dark:bg-gray-900" :ui="{ body: 'p-0', header: 'border-b-0 px-6 py-4' }">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Rol Adı</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Açıklama</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">İzinler</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Kullanıcı Sayısı</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in items" :key="role.id" class="border-b border-gray-100 dark:border-gray-800">
                <td class="px-6 py-4">
                  <span class="font-bold text-gray-900 dark:text-white">{{ role.name }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-600 dark:text-gray-300 text-sm">
                    {{ role.description || 'Açıklama yok' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <UBadge v-for="perm in (role.permissions || []).slice(0, 3)" :key="perm.id" color="primary" variant="subtle" size="xs">
                      {{ perm.name }}
                    </UBadge>
                    <UBadge v-if="(role.permissions || []).length > 3" color="neutral" variant="subtle" size="xs">
                      +{{ (role.permissions || []).length - 3 }}
                    </UBadge>
                    <span v-if="!(role.permissions || []).length" class="text-xs text-gray-400 italic">İzin yok</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <UBadge color="neutral" variant="subtle" class="rounded-full">
                    {{ role._count?.users || 0 }} Kullanıcı
                  </UBadge>
                </td>
                <td class="px-6 py-4">
                  <UButton icon="i-lucide-edit-2" color="neutral" variant="ghost" size="xs" @click.stop.prevent="openEditDrawer(role)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>
    
  </UDashboardPanel>

  <!-- Drawer -->
  <ClientOnly>
    <USlideover v-model:open="isDrawerOpen" title="Rol Yönetimi">
      <template #content>
        <div class="p-6">
          <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit" id="role-form">
              <UFormField label="Rol Adı" name="name">
                  <UInput v-model="state.name" placeholder="Admin, Editor, vb." class="w-full" />
              </UFormField>
              
              <UFormField label="Açıklama" name="description">
                  <UTextarea v-model="state.description" placeholder="Bu rolün yetkileri..." class="w-full" />
              </UFormField>

              <UFormField label="İzinler" name="selectedPermissions">
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
                  <UButton label="İptal" color="neutral" variant="ghost" @click="isDrawerOpen = false" />
                  <UButton type="submit" label="Kaydet" color="primary" :loading="isSubmitting" />
              </div>
          </UForm>
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
