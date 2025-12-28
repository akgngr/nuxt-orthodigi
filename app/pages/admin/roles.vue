
<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// --- State ---
const { data: roles, refresh: refreshRoles, status } = await useFetch('/api/admin/roles')
const { data: allPermissions } = await useFetch('/api/admin/permissions')

const isModalOpen = ref(false)
const isEditMode = ref(false)
const isLoading = computed(() => status.value === 'pending')

const state = reactive({
  id: '',
  name: '',
  description: '',
  permissionIds: [] as string[]
})

const schema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional()
})

type Schema = z.infer<typeof schema>

// --- Actions ---
function openCreateModal() {
  isEditMode.value = false
  state.id = ''
  state.name = ''
  state.description = ''
  state.permissionIds = []
  isModalOpen.value = true
}

function openEditModal(role: any) {
  isEditMode.value = true
  state.id = role.id
  state.name = role.name
  state.description = role.description || ''
  state.permissionIds = role.permissions?.map((p: any) => p.id) || []
  isModalOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    if (isEditMode.value) {
      await $fetch(`/api/admin/roles/${state.id}`, {
        method: 'PUT',
        body: event.data
      })
      useToast().add({ title: 'Rol güncellendi', color: 'success' })
    } else {
      await $fetch('/api/admin/roles', {
        method: 'POST',
        body: event.data
      })
      useToast().add({ title: 'Rol oluşturuldu', color: 'success' })
    }
    isModalOpen.value = false
    refreshRoles()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.statusMessage || error.message, color: 'error' })
  }
}

const columns = [
  { key: 'name', label: 'Rol Adı' },
  { key: 'description', label: 'Açıklama' },
  { key: 'usersCount', label: 'Kullanıcı Sayısı' },
  { key: 'actions' }
]

const items = computed(() => roles.value || [])
const permissions = computed(() => allPermissions.value || [])
</script>

<template>
  <UDashboardPanel grow>
    <template #header>
      <AdminNavbar>
        <template #leading>
            <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Rol Yönetimi</h1>
        </template>
        <template #right>
            <UButton icon="i-lucide-plus" label="Yeni Rol" color="primary" class="font-bold rounded-xl" @click="openCreateModal" />
        </template>
      </AdminNavbar>
    </template>

    <template #body>
      <UCard class="shadow-sm border-none bg-white dark:bg-gray-900" :ui="{ body: 'p-0', header: 'border-b-0 px-6 py-4' }">
        <UTable 
            :rows="items" 
            :columns="columns"
            :loading="isLoading"
            class="w-full"
            :ui="{
                thead: 'bg-gray-50/50 dark:bg-gray-800/50',
                th: 'px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest',
                td: 'px-6 py-4 text-gray-600 dark:text-gray-300'
            }"
        >
            <template #name-data="{ row }">
                <span class="font-bold text-gray-900 dark:text-white">{{ row.name }}</span>
            </template>

            <template #usersCount-data="{ row }">
                <UBadge color="neutral" variant="subtle" class="rounded-full">
                    {{ row._count?.users || 0 }} Kullanıcı
                </UBadge>
            </template>

            <template #actions-data="{ row }">
                <UButton icon="i-lucide-edit-2" color="neutral" variant="ghost" size="xs" @click="openEditModal(row)" />
            </template>
        </UTable>
      </UCard>
    </template>

    <!-- Modal -->
    <UModal v-model="isModalOpen">
      <UCard :ui="{ header: 'border-b-0', footer: 'border-t-0' }">
        <template #header>
            <h3 class="text-lg font-bold">{{ isEditMode ? 'Rol Düzenle' : 'Yeni Rol' }}</h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormGroup label="Rol Adı" name="name">
                <UInput v-model="state.name" placeholder="Admin, Editor, vb." />
            </UFormGroup>
            
            <UFormGroup label="Açıklama" name="description">
                <UTextarea v-model="state.description" placeholder="Bu rolün yetkileri..." />
            </UFormGroup>

            <UFormGroup label="İzinler" name="permissionIds">
                <USelectMenu 
                    v-model="state.permissionIds" 
                    :options="permissions" 
                    option-attribute="name" 
                    value-attribute="id"
                    multiple
                    placeholder="İzinleri Seçin" 
                />
            </UFormGroup>

            <div class="flex justify-end gap-2 mt-6">
                <UButton label="İptal" color="neutral" variant="ghost" @click="isModalOpen = false" />
                <UButton type="submit" label="Kaydet" color="primary" :loading="isLoading" />
            </div>
        </UForm>
      </UCard>
    </UModal>
  </UDashboardPanel>
</template>
