<script setup lang="ts">
import ComponentDefinitionForm from '~~/modules/components/app/components/admin/ComponentDefinitionForm.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const isSubmitting = ref(false)
const id = route.params.id as string

const { data: definition, error } = await useFetch(`/api/admin/component-definitions/${id}`)

if (error.value) {
  toast.add({ title: 'Bileşen bulunamadı', color: 'error' })
  router.push('/admin/components/builder')
}

async function onSave(data: any) {
  isSubmitting.value = true
  try {
    await $fetch(`/api/admin/component-definitions/${id}`, {
      method: 'PUT',
      body: data
    })
    toast.add({ title: 'Bileşen tanımı güncellendi', color: 'success' })
    router.push('/admin/components/builder')
  } catch (error: any) {
    toast.add({ title: 'Hata', color: 'error', description: error.message })
  } finally {
    isSubmitting.value = false
  }
}

function onCancel() {
  router.push('/admin/components/builder')
}
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar :title="definition?.name ? `${definition.name} Düzenle` : 'Bileşen Düzenle'">
      <template #leading>
        <UButton icon="i-lucide-arrow-left" variant="ghost" @click="onCancel" />
      </template>
    </AdminNavbar>

    <div class="flex-1 overflow-y-auto p-4">
      <ComponentDefinitionForm 
        v-if="definition" 
        :initial-data="definition" 
        is-editing 
        @save="onSave" 
        @cancel="onCancel" 
        :loading="isSubmitting" 
      />
    </div>
  </UDashboardPanel>
</template>
