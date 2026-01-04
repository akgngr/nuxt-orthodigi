<script setup lang="ts">
import ComponentDefinitionForm from '~~/modules/components/app/components/admin/ComponentDefinitionForm.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const router = useRouter()
const toast = useToast()
const isSubmitting = ref(false)

async function onSave(data: any) {
  isSubmitting.value = true
  try {
    await $fetch('/api/admin/component-definitions', {
      method: 'POST',
      body: data
    })
    toast.add({ title: 'Bileşen tanımı oluşturuldu', color: 'success' })
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
    <AdminNavbar title="Yeni Bileşen Tanımı">
      <template #leading>
        <UButton icon="i-lucide-arrow-left" variant="ghost" @click="onCancel" />
      </template>
    </AdminNavbar>

    <div class="flex-1 overflow-y-auto p-4">
      <ComponentDefinitionForm @save="onSave" @cancel="onCancel" :loading="isSubmitting" />
    </div>
  </UDashboardPanel>
</template>
