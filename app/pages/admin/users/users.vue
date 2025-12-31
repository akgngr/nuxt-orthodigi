<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
 

// User type definition
interface User {
  id: string
  name: string
  email: string
  role?: {
    id: string
    name: string
  }
  roleId?: string
  createdAt: string
}

// Role type definition (users sayfasında rol seçimi için)
interface Role {
  id: string
  name: string
}
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// --- State ---
const { data: users, refresh: refreshUsers, status: usersStatus, error: usersError } = await useFetch<User[]>('/api/admin/users')
const { data: roles, status: rolesStatus, error: rolesError } = await useFetch<Role[]>('/api/admin/roles')

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isLoading = computed(() => usersStatus.value === 'pending' || rolesStatus.value === 'pending')

const roleOptions = computed(() => roles.value || [])

const state = reactive({
  id: '',
  name: '',
  email: '',
  password: '',
  selectedRole: undefined as Role | undefined
})

const schema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır').optional().or(z.literal('')),
  selectedRole: z.object({ id: z.string(), name: z.string() }).optional()
})

type Schema = z.infer<typeof schema>

onMounted(() => {
  isDrawerOpen.value = false
})

// --- Actions ---
function openCreateDrawer() {
  isEditMode.value = false
  state.id = ''
  state.name = ''
  state.email = ''
  state.password = ''
  state.selectedRole = undefined
  isDrawerOpen.value = true
}

function openEditDrawer(user: User) {
  console.log("Drawer açılıyor:", user)
  isEditMode.value = true
  state.id = user.id
  state.name = user.name || ''
  state.email = user.email || ''
  state.password = '' // Don't show password
  
  // Find the role object from options to ensure reference equality for USelectMenu
  if (user.role && user.role.id) {
    state.selectedRole = roleOptions.value.find(r => r.id === user.role!.id)
  } else {
    state.selectedRole = undefined
  }
  
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    if (!event.data.password && !isEditMode.value) {
      useToast().add({ title: 'Şifre gereklidir', color: 'error' })
      return
    }
    
    const payload: any = {
      name: event.data.name,
      roleId: event.data.selectedRole?.id
    }
    
    if (event.data.password) {
      payload.password = event.data.password
    }
    
    if (isEditMode.value) {
      await $fetch(`/api/admin/users/${state.id}`, {
          method: 'PUT',
          body: payload
      })
      useToast().add({ title: 'Kullanıcı güncellendi', color: 'success' })
    } else {
       payload.email = event.data.email
       await $fetch('/api/admin/users', {
          method: 'POST',
          body: payload
      })
      useToast().add({ title: 'Kullanıcı oluşturuldu', color: 'success' })
    }
    isDrawerOpen.value = false
    await refreshUsers()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.statusMessage || error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

// Basit tablo için HTML kullanılıyor

const items = computed<User[]>(() => ((users.value ?? []) as unknown as User[]))

// Error handling
if (usersError.value) {
  console.error('Kullanıcılar yüklenirken hata:', usersError.value)
  useToast().add({ 
    title: 'Kullanıcılar yüklenemedi', 
    description: usersError.value.message,
    color: 'error' 
  })
}

if (rolesError.value) {
  console.error('Roller yüklenirken hata:', rolesError.value)
  useToast().add({ 
    title: 'Roller yüklenemedi', 
    description: rolesError.value.message,
    color: 'error' 
  })
}
</script>

<template>
  <UDashboardPanel grow>
    <template #header>
      <AdminNavbar>
        <template #leading>
            <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Kullanıcı Yönetimi</h1>
        </template>
        <template #trailing>
            <UButton icon="i-lucide-user-plus" label="Yeni Kullanıcı" color="primary" class="font-bold rounded-xl" @click="openCreateDrawer" />
        </template>
      </AdminNavbar>
    </template>

    <template #body>
      <UCard class="shadow-sm border-none bg-white dark:bg-gray-900" :ui="{ body: 'p-0', header: 'border-b-0 px-6 py-4' }">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Kullanıcı</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Rol</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Kayıt Tarihi</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in items" :key="user.id" class="border-b border-gray-100 dark:border-gray-800">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <UAvatar :alt="user.name" size="sm" class="bg-primary/10 text-primary font-bold" />
                    <div>
                      <div class="font-semibold text-gray-900 dark:text-white">{{ user.name }}</div>
                      <div class="text-xs text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <UBadge :color="user.role?.name === 'admin' ? 'primary' : 'neutral'" variant="subtle" class="rounded-full px-3 py-1 font-bold text-[10px] uppercase">
                    {{ user.role?.name || 'User' }}
                  </UBadge>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm">{{ new Date(user.createdAt).toLocaleDateString('tr-TR') }}</span>
                </td>
                <td class="px-6 py-4">
                  <UButton icon="i-lucide-edit-2" color="neutral" variant="ghost" size="xs" @click.stop.prevent="openEditDrawer(user)" />
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
    <USlideover v-model:open="isDrawerOpen" title="Kullanıcı Yönetimi">
      <template #content>
        <div class="p-6">
          <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit" id="user-form">
              <UFormField label="Ad Soyad" name="name">
                  <UInput v-model="state.name" placeholder="John Doe" class="w-full" />
              </UFormField>
              
              <UFormField label="E-posta" name="email">
                  <UInput v-model="state.email" placeholder="ornek@email.com" :disabled="isEditMode" class="w-full" />
              </UFormField>

              <UFormField v-if="!isEditMode" label="Şifre" name="password" help="Değiştirmek istemiyorsanız boş bırakın">
                  <UInput v-model="state.password" type="password" placeholder="********" class="w-full" />
              </UFormField>

              <UFormField label="Rol" name="selectedRole">
                  <USelectMenu 
                      v-model="state.selectedRole" 
                      :items="roleOptions" 
                      label-key="name" 
                      placeholder="Rol Seçin" 
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
