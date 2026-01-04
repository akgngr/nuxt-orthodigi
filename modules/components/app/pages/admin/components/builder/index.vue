<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const columns = [
  { accessorKey: 'name', header: 'İsim' },
  { accessorKey: 'slug', header: 'Kod (Slug)' },
  { accessorKey: 'description', header: 'Açıklama' },
  { id: 'actions', header: 'İşlemler' }
]

const { data: definitions, refresh, status } = await useFetch('/api/admin/component-definitions')
const isLoading = computed(() => status.value === 'pending')

const toast = useToast()
const router = useRouter()

async function deleteDefinition(id: string) {
  if (!confirm('Bu bileşen tanımını silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/component-definitions/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Silindi', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Hata', color: 'error', description: error.message })
  }
}
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="Bileşen Oluşturucu">
      <template #right>
        <UButton
          label="Yeni Bileşen Tanımla"
          icon="i-lucide-plus"
          color="primary"
          to="/admin/components/builder/create"
        />
      </template>
    </UDashboardNavbar>

    <div class="flex-1 overflow-y-auto p-4">
      <UCard :ui="{ body: 'p-0' }">
        <UTable
          :data="definitions || []"
          :columns="columns"
          :loading="isLoading"
        >
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-pencil"
                size="xs"
                color="neutral"
                variant="ghost"
                :to="`/admin/components/builder/${row.original.id}`"
              />
              <UButton
                icon="i-lucide-trash"
                size="xs"
                color="red"
                variant="ghost"
                @click="deleteDefinition(row.original.id)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </div>
  </UDashboardPanel>
</template>
