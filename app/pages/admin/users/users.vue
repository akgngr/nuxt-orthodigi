<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

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
const page = ref(1)
const limit = ref(10)
const search = ref('')

const { data, refresh: refreshUsers, status: usersStatus, error: usersError } = await useFetch<any>('/api/admin/users', {
  query: {
    page,
    limit,
    search
  },
  watch: [page, limit, search]
})
const { data: rolesData, status: rolesStatus, error: rolesError } = await useFetch<any>('/api/admin/roles')

const users = computed(() => data.value?.items || [])
const roleOptions = computed(() => rolesData.value?.items || [])
const total = computed(() => data.value?.total || 0)

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isLoading = computed(() => usersStatus.value === 'pending' || rolesStatus.value === 'pending')

const columns = [
  { accessorKey: 'name', header: 'Kullanıcı' },
  { accessorKey: 'role', header: 'Rol' },
  { accessorKey: 'createdAt', header: 'Kayıt Tarihi' },
  { id: 'actions', header: 'İşlemler' }
]

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
  console.log('Drawer açılıyor:', user)
  isEditMode.value = true
  state.id = user.id
  state.name = user.name || ''
  state.email = user.email || ''
  state.password = '' // Don't show password

  // Find the role object from options to ensure reference equality for USelectMenu
  if (user.role && user.role.id) {
    state.selectedRole = roleOptions.value.find((r: Role) => r.id === user.role!.id)
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
    <AdminNavbar />

    <UDashboardNavbar title="Kullanıcı Yönetimi">
      <template #right>
        <UButton
          label="Yeni Kullanıcı"
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
          placeholder="Kullanıcı ara..."
          class="w-64"
          @update:model-value="page = 1"
        />
      </template>
    </UDashboardToolbar>

    <div class="flex-1 overflow-y-auto p-4">
      <UCard
        :ui="{ body: 'p-0' }"
        class="flex-1"
      >
        <UTable
          :data="users"
          :columns="columns"
          :loading="isLoading"
          class="w-full"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar
                :alt="(row.original as any).name"
                size="sm"
                class="bg-primary/10 text-primary font-bold"
              />
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">
                  {{ (row.original as any).name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ (row.original as any).email }}
                </div>
              </div>
            </div>
          </template>

          <template #role-cell="{ row }">
            <UBadge
              :color="(row.original as any).role?.name === 'admin' ? 'primary' : 'neutral'"
              variant="subtle"
              class="rounded-full px-3 py-1 font-bold text-[10px] uppercase"
            >
              {{ (row.original as any).role?.name || 'User' }}
            </UBadge>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ new Date((row.original as any).createdAt).toLocaleDateString('tr-TR') }}</span>
          </template>

          <template #actions-cell="{ row }">
            <UButton
              icon="i-lucide-edit-2"
              color="neutral"
              variant="ghost"
              size="xs"
              @click.stop.prevent="openEditDrawer(row.original as any)"
            />
          </template>
        </UTable>

        <template #footer>
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Toplam {{ total }} kullanıcı
            </div>
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
      title="Kullanıcı Yönetimi"
    >
      <template #content>
        <div class="p-6">
          <UForm
            id="user-form"
            :schema="schema"
            :state="state"
            class="space-y-6"
            @submit="onSubmit"
          >
            <UFormField
              label="Ad Soyad"
              name="name"
            >
              <UInput
                v-model="state.name"
                placeholder="John Doe"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="E-posta"
              name="email"
            >
              <UInput
                v-model="state.email"
                placeholder="ornek@email.com"
                :disabled="isEditMode"
                class="w-full"
              />
            </UFormField>

            <UFormField
              v-if="!isEditMode"
              label="Şifre"
              name="password"
              help="Değiştirmek istemiyorsanız boş bırakın"
            >
              <UInput
                v-model="state.password"
                type="password"
                placeholder="********"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Rol"
              name="selectedRole"
            >
              <USelectMenu
                v-model="state.selectedRole"
                :items="roleOptions"
                label-key="name"
                placeholder="Rol Seçin"
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
