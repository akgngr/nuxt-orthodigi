<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
 

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
const { data: permissions, refresh: refreshPermissions, status: permissionsStatus, error: permissionsError } = await useFetch<Permission[]>('/api/admin/permissions')

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

const items = computed(() => permissions.value || [])

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
    <template #header>
      <AdminNavbar>
        <template #leading>
            <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">İzin Yönetimi</h1>
        </template>
        <template #trailing>
            <UButton icon="i-lucide-plus" label="Yeni İzin" color="primary" class="font-bold rounded-xl" @click="openCreateDrawer" />
        </template>
      </AdminNavbar>
    </template>

    <template #body>
      <UCard class="shadow-sm border-none bg-white dark:bg-gray-900" :ui="{ body: 'p-0', header: 'border-b-0 px-6 py-4' }">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">İzin Kodu</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Açıklama</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Oluşturulma Tarihi</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in items" :key="permission.id" class="border-b border-gray-100 dark:border-gray-800">
                <td class="px-6 py-4">
                  <span class="font-bold text-gray-900 dark:text-white">{{ permission.name }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-600 dark:text-gray-300 text-sm">
                    {{ permission.description || 'Açıklama yok' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm">
                    {{ new Date(permission.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <UButton icon="i-lucide-edit-2" color="neutral" variant="ghost" size="xs" @click="openEditDrawer(permission)" />
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
    <USlideover v-model:open="isDrawerOpen" title="İzin Yönetimi">
      <template #content>
        <div class="p-6">
          <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit" id="permission-form">
            <UFormField label="İzin Kodu" name="name" help="Örnek: users:read, roles:write">
              <UInput v-model="state.name" placeholder="users:read" class="w-full" />
            </UFormField>
            
            <UFormField label="Açıklama" name="description">
              <UTextarea v-model="state.description" placeholder="Bu izin ne işe yarar?" class="w-full" />
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
