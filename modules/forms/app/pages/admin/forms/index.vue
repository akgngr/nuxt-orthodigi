<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <div class="flex-1 overflow-y-auto p-4">
      <div class="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Form Oluşturucu
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Formları oluşturun, alanları düzenleyin ve gönderimleri takip edin.
          </p>
        </div>
        <UButton
          color="primary"
          icon="i-lucide-plus"
          label="Yeni Form Oluştur"
          @click="openCreateForm"
        />
      </div>

      <AdminFormList
        :forms="forms"
        :loading="loading"
        @edit="editForm"
        @preview="previewForm"
        @delete="deleteForm"
        @submissions="goToSubmissions"
      />
    </div>
  </UDashboardPanel>

  <!-- Create/Edit Form Drawer -->
  <AdminFormDrawer
    v-model:open="showFormModal"
    :form-data="formData"
    :is-editing="!!editingForm"
    :saving="saving"
    @save="saveForm"
    @close="closeFormModal"
  />
</template>

<script setup lang="ts">
import type { FormDefinition, FormField } from '../../../../../../shared/types/form'
import AdminFormDrawer from '../../../components/admin/FormDrawer.vue'
import AdminFormList from '../../../components/admin/FormList.vue'

definePageMeta({
  layout: 'admin',
  middleware: []
})

// State
const router = useRouter()
const forms = ref<FormDefinition[]>([])
const loading = ref(true)
const saving = ref(false)
const showFormModal = ref(false)
const editingForm = ref<FormDefinition | null>(null)

// Form data
const formData = ref({
  title: '',
  slug: '',
  description: '',
  fields: [] as FormField[],
  settings: {
    successMessage: 'Mesajınız başarıyla iletildi.',
    redirectUrl: '',
    spamProtection: {
      honeypot: true
    }
  }
})



// Load forms
const loadForms = async () => {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, data: FormDefinition[] }>('/api/admin/forms')
    forms.value = response.data
  } catch (error) {
    console.error('Formlar yüklenirken hata:', error)
  } finally {
    loading.value = false
  }
}

// Form actions
const editForm = (form: FormDefinition) => {
  editingForm.value = form
  formData.value = {
    title: form.title,
    slug: form.slug,
    description: form.description || '',
    fields: [...form.fields],
    settings: { ...form.settings }
  }
  showFormModal.value = true
}

const openCreateForm = () => {
  editingForm.value = null
  resetFormData()
  showFormModal.value = true
}

const previewForm = (form: FormDefinition) => {
  const previewUrl = `/forms/preview/${form.slug}`
  window.open(previewUrl, '_blank')
}

const goToSubmissions = (form: FormDefinition) => {
  router.push(`/admin/forms/${form.id}/submissions`)
}

const deleteForm = async (form: FormDefinition) => {
  if (!confirm(`"${form.title}" formunu silmek istediğinizden emin misiniz?`)) return

  try {
    await $fetch(`/api/admin/forms/${form.id}`, {
      method: 'DELETE'
    })
    await loadForms()
  } catch (error) {
    console.error('Form silinirken hata:', error)
  }
}

// Form modal methods
const closeFormModal = () => {
  showFormModal.value = false
}

const resetFormData = () => {
  formData.value = {
    title: '',
    slug: '',
    description: '',
    fields: [],
    settings: {
      successMessage: 'Mesajınız başarıyla iletildi.',
      redirectUrl: '',
      spamProtection: {
        honeypot: true
      }
    }
  }
}

const saveForm = async (updatedData: any) => {
  if (!updatedData.title || !updatedData.slug) {
    alert('Lütfen zorunlu alanları doldurun.')
    return
  }

  try {
    saving.value = true
    const url = editingForm.value ? `/api/admin/forms/${editingForm.value.id}` : '/api/admin/forms'
    const method = editingForm.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: updatedData
    })

    await loadForms()
    closeFormModal()
  } catch (error) {
    console.error('Form kaydedilirken hata:', error)
    alert('Form kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    saving.value = false
  }
}



watch(showFormModal, (value) => {
  if (!value) {
    editingForm.value = null
    resetFormData()
  }
})

// Initialize
onMounted(() => {
  loadForms()
})
</script>
