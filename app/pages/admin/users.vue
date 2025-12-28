
<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// --- State ---
const { data: users, refresh: refreshUsers, status } = await useFetch('/api/admin/users')
const { data: roles } = await useFetch('/api/admin/roles')

const isModalOpen = ref(false)
const isEditMode = ref(false)
const isLoading = computed(() => status.value === 'pending')

const state = reactive({
  id: '',
  name: '',
  email: '',
  password: '',
  roleId: undefined as string | undefined
})

const schema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır').optional().or(z.literal('')),
  roleId: z.string().optional()
})

type Schema = z.infer<typeof schema>

// --- Actions ---
function openCreateModal() {
  isEditMode.value = false
  state.id = ''
  state.name = ''
  state.email = ''
  state.password = ''
  state.roleId = undefined
  isModalOpen.value = true
}

function openEditModal(user: any) {
  isEditMode.value = true
  state.id = user.id
  state.name = user.name || ''
  state.email = user.email || ''
  state.password = '' // Don't show password
  state.roleId = user.roleId || undefined
  isModalOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    if (isEditMode.value) {
      await $fetch(`/api/admin/users/${state.id}`, {
        method: 'PUT',
        body: {
          name: event.data.name,
          roleId: event.data.roleId || null
        }
      })
      useToast().add({ title: 'Kullanıcı güncellendi', color: 'success' })
    } else {
      if (!event.data.password) {
        useToast().add({ title: 'Şifre gereklidir', color: 'error' })
        return
      }
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: {
            name: event.data.name,
            email: event.data.email,
            password: event.data.password,
            roleId: event.data.roleId
        }
      })
      useToast().add({ title: 'Kullanıcı oluşturuldu', color: 'success' })
    }
    isModalOpen.value = false
    refreshUsers()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.statusMessage || error.message, color: 'error' })
  }
}

const columns = [
  { key: 'user', label: 'Kullanıcı' },
  { key: 'role', label: 'Rol' },
  { key: 'createdAt', label: 'Kayıt Tarihi' },
  { key: 'actions' }
]

const items = computed(() => users.value || [])
</script>

<template>
  <UDashboardPanel grow>
    <template #header>
      <AdminNavbar>
        <template #leading>
            <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Kullanıcı Yönetimi</h1>
        </template>
        <template #right>
            <UButton icon="i-lucide-user-plus" label="Yeni Kullanıcı" color="primary" class="font-bold rounded-xl" @click="openCreateModal" />
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
            <template #user-data="{ row }">
                <div class="flex items-center gap-3">
                    <UAvatar :alt="row.name" size="sm" class="bg-primary/10 text-primary font-bold" />
                    <div>
                        <div class="font-semibold text-gray-900 dark:text-white">{{ row.name }}</div>
                        <div class="text-xs text-gray-500">{{ row.email }}</div>
                    </div>
                </div>
            </template>

            <template #role-data="{ row }">
                <UBadge :color="row.role?.name === 'admin' ? 'primary' : 'neutral'" variant="subtle" class="rounded-full px-3 py-1 font-bold text-[10px] uppercase">
                    {{ row.role?.name || 'User' }}
                </UBadge>
            </template>

            <template #createdAt-data="{ row }">
                <span class="text-sm">{{ new Date(row.createdAt).toLocaleDateString('tr-TR') }}</span>
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
            <h3 class="text-lg font-bold">{{ isEditMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı' }}</h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormGroup label="Ad Soyad" name="name">
                <UInput v-model="state.name" placeholder="John Doe" />
            </UFormGroup>
            
            <UFormGroup label="E-posta" name="email">
                <UInput v-model="state.email" placeholder="ornek@email.com" :disabled="isEditMode" />
            </UFormGroup>

            <UFormGroup label="Şifre" name="password" v-if="!isEditMode">
                <UInput v-model="state.password" type="password" placeholder="********" />
            </UFormGroup>

            <UFormGroup label="Rol" name="roleId">
                <USelectMenu 
                    v-model="state.roleId" 
                    :options="roles" 
                    option-attribute="name" 
                    value-attribute="id"
                    placeholder="Rol Seçin" 
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
