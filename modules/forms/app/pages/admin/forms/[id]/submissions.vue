<template>
  <UDashboardPanel grow>
    <AdminNavbar title="Form Gönderimleri">
      <template #leading>
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          @click="router.back()"
        />
      </template>
    </AdminNavbar>

    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <!-- Loading overlay -->
        <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
          <UIcon 
            name="i-lucide-loader-circle" 
            class="animate-spin w-8 h-8 text-primary-500" 
          />
        </div>
      </div>

      <div v-else-if="submissions.length === 0" class="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <UIcon name="i-lucide-mail-open" class="w-12 h-12 text-gray-400 mb-4 mx-auto" />
        <p class="text-gray-500 mb-4 font-medium">Henüz gönderim bulunmuyor</p>
      </div>

      <div v-else class="space-y-4">
        <UCard
          v-for="submission in submissions"
          :key="submission.id"
          class="overflow-hidden"
          :ui="{ body: 'p-0' }"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-calendar" class="text-gray-400" />
                <span class="text-sm font-medium">{{ new Date(submission.createdAt).toLocaleString('tr-TR') }}</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span v-if="submission.ipAddress" class="flex items-center gap-1">
                  <UIcon name="i-lucide-globe" /> {{ submission.ipAddress }}
                </span>
              </div>
            </div>
          </template>

          <div class="p-4 bg-gray-50/50 dark:bg-gray-800/50">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(value, key) in submission.data" :key="key" class="space-y-1">
                <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">{{ key }}</p>
                <p class="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-800">
                  {{ value || '-' }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const formId = route.params.id as string

definePageMeta({
  layout: 'admin'
})

const submissions = ref<any[]>([])
const loading = ref(true)

const fetchSubmissions = async () => {
  try {
    loading.value = true
    const response = await $fetch<any>(`/api/admin/forms/${formId}/submissions`)
    if (response.success) {
      submissions.value = response.data
    }
  } catch (error) {
    console.error('Gönderimler yüklenirken hata:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSubmissions()
})
</script>
