import { ref, readonly } from 'vue'
import type { FormDefinition, FormComponentData } from '~~/shared/types/form'

export const useFormBuilder = () => {
  const forms = ref<FormDefinition[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchForms = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await $fetch<any>('/api/admin/forms')
      forms.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch forms'
      console.error('Failed to fetch forms:', err)
    } finally {
      loading.value = false
    }
  }

  const getForm = async (slug: string): Promise<FormDefinition | null> => {
    try {
      error.value = null
      const response = await $fetch<any>(`/api/admin/forms/${slug}`)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch form'
      console.error('Failed to fetch form:', err)
      return null
    }
  }

  const createForm = async (formData: Partial<FormDefinition>) => {
    try {
      error.value = null
      const response = await $fetch<any>('/api/admin/forms', {
        method: 'POST',
        body: formData
      })
      await fetchForms()
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to create form'
      throw err
    }
  }

  const updateForm = async (id: string, formData: Partial<FormDefinition>) => {
    try {
      error.value = null
      const response = await $fetch<any>(`/api/admin/forms/${id}`, {
        method: 'PUT',
        body: formData
      })
      await fetchForms()
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update form'
      throw err
    }
  }

  const deleteForm = async (id: string) => {
    try {
      error.value = null
      await $fetch(`/api/admin/forms/${id}`, {
        method: 'DELETE'
      })
      await fetchForms()
    } catch (err: any) {
      error.value = err.message || 'Failed to delete form'
      throw err
    }
  }

  const submitForm = async (formSlug: string, data: Record<string, any>) => {
    try {
      error.value = null
      const response = await $fetch('/api/forms/submit', {
        method: 'POST',
        body: { formSlug, data }
      })
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to submit form'
      throw err
    }
  }

  return {
    forms: readonly(forms),
    loading: readonly(loading),
    error: readonly(error),
    fetchForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
    submitForm
  }
}