<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent, TableColumn, EditorToolbarItem } from '@nuxt/ui'
import { slugify } from '../../../../../utils/slugify'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})



// --- Editor Configuration ---
const toolbarItems: EditorToolbarItem[][] = [
  [{
    icon: 'i-lucide-heading',
    tooltip: { text: 'Başlıklar' },
    content: { align: 'start' },
    items: [
      { kind: 'heading', level: 1, icon: 'i-lucide-heading-1', label: 'Başlık 1' },
      { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Başlık 2' },
      { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Başlık 3' }
    ]
  }],
  [{
    kind: 'mark',
    mark: 'bold',
    icon: 'i-lucide-bold',
    tooltip: { text: 'Kalın' }
  }, {
    kind: 'mark',
    mark: 'italic',
    icon: 'i-lucide-italic',
    tooltip: { text: 'İtalik' }
  }, {
    kind: 'mark',
    mark: 'underline',
    icon: 'i-lucide-underline',
    tooltip: { text: 'Altı Çizili' }
  }],
  [{
    kind: 'bulletList',
    icon: 'i-lucide-list',
    tooltip: { text: 'Madde İşaretli Liste' }
  }, {
    kind: 'orderedList',
    icon: 'i-lucide-list-ordered',
    tooltip: { text: 'Numaralı Liste' }
  }],
  [{
    kind: 'blockquote',
    icon: 'i-lucide-quote',
    tooltip: { text: 'Alıntı' }
  }, {
    kind: 'codeBlock',
    icon: 'i-lucide-code',
    tooltip: { text: 'Kod Bloğu' }
  }]
]

const page = ref(1)
const limit = ref(10)
const search = ref('')
const sort = ref('createdAt')
const order = ref<'asc' | 'desc'>('desc')

const query = computed(() => ({
  page: page.value,
  limit: limit.value,
  search: search.value,
  sort: sort.value,
  order: order.value
}))

const { data: listResponse, refresh, status } = await useFetch<any>('/api/admin/doctorprofile', { query })

const items = computed(() => listResponse.value?.items || [])
const total = computed(() => listResponse.value?.total || 0)
const isLoading = computed(() => status.value === 'pending')

const columns = [
  { accessorKey: 'isim_unvan', header: 'İsim ve Unvan' },
  { accessorKey: 'uzmanlik_alani', header: 'Uzmanlık Alanı' },
  { accessorKey: 'slug', header: 'Slug' },
  { id: 'actions', header: 'İşlemler' }
]

interface DoctorProfile {
  id: string
  isim_unvan: string
  uzmanlik_alani?: string
  unvan_detay?: string
  adres?: any
  iletisim?: any
  pratisen_ozellikleri?: string
  konum_bilgisi?: any
  slug?: string
  createdAt: string
  updatedAt: string
}

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)

const schema = z.object({
  id: z.string().optional(),
  isim_unvan: z.string().min(1, 'İsim ve Unvan gereklidir'),
  uzmanlik_alani: z.string().optional().or(z.literal('')),
  unvan_detay: z.string().optional().or(z.literal('')),
  adres: z.any().optional(),
  iletisim: z.any().optional(),
  pratisen_ozellikleri: z.string().optional().or(z.literal('')),
  konum_bilgisi: z.any().optional(),
  slug: z.string().min(1, 'Slug gereklidir'),
  titleTag: z.string().optional().or(z.literal('')),
  metaDescription: z.string().optional().or(z.literal('')),
  canonicalUrl: z.string().optional().or(z.literal('')),
  jsonLd: z.string().refine((val) => {
    if (!val) return true
    try {
      JSON.parse(val)
      return true
    } catch {
      return false
    }
  }, 'Geçerli bir JSON giriniz').optional()
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  id: undefined,
  isim_unvan: '',
  uzmanlik_alani: '',
  unvan_detay: '',
  adres: [],
  iletisim: [],
  pratisen_ozellikleri: '',
  konum_bilgisi: [],
  slug: '',
  titleTag: '',
  metaDescription: '',
  canonicalUrl: '',
  jsonLd: ''
})

function openCreateDrawer() {
  isEditMode.value = false
  Object.assign(state, {
    id: undefined,
    isim_unvan: '',
    uzmanlik_alani: '',
    unvan_detay: '',
    adres: [],
    iletisim: [],
    pratisen_ozellikleri: '',
    konum_bilgisi: [],
    slug: '',
    titleTag: '',
    metaDescription: '',
    canonicalUrl: '',
    jsonLd: ''
  })
  isDrawerOpen.value = true
}

function openEditDrawer(item: any) {
  isEditMode.value = true
  Object.assign(state, {
    id: item.id,
    isim_unvan: item.isim_unvan ?? '',
    uzmanlik_alani: item.uzmanlik_alani ?? '',
    unvan_detay: item.unvan_detay ?? '',
    adres: item.adres ?? [],
    iletisim: item.iletisim ?? [],
    pratisen_ozellikleri: item.pratisen_ozellikleri ?? '',
    konum_bilgisi: item.konum_bilgisi ?? [],
    slug: item.slug ?? '',
    titleTag: item.titleTag ?? '',
    metaDescription: item.metaDescription ?? '',
    canonicalUrl: item.canonicalUrl ?? '',
    jsonLd: item.jsonLd ? JSON.stringify(item.jsonLd, null, 2) : ''
  })
  isDrawerOpen.value = true
}

// Watch isim_unvan to auto-generate slug and title tag
watch(() => state.isim_unvan, (newVal) => {
  if (newVal && !isEditMode.value) {
    state.slug = slugify(newVal)
    state.titleTag = `${newVal} | OrthoDigi`
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const url = isEditMode.value ? `/api/admin/doctorprofile/${state.id}` : '/api/admin/doctorprofile'
    const method = isEditMode.value ? 'PUT' : 'POST'

    const payload = {
      ...event.data,
      jsonLd: event.data.jsonLd ? JSON.parse(event.data.jsonLd) : null
    }

    await $fetch(url, {
      method,
      body: payload
    })

    useToast().add({
      title: isEditMode.value ? 'Güncellendi' : 'Oluşturuldu',
      color: 'success'
    })

    isDrawerOpen.value = false
    refresh()
  } catch (error: any) {
    useToast().add({
      title: 'Hata',
      description: error.data?.message || 'Bir hata oluştu',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

async function deleteItem(id: string) {
  if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/doctorprofile/${id}`, { method: 'DELETE' })
    useToast().add({ title: 'Silindi', color: 'success' })
    refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata', color: 'error', description: error.data?.message })
  }
}
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="Doktor Profilleri Yönetimi">
      <template #right>
        <UButton
          label="Yeni Ekle"
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
          placeholder="Doktor ara..."
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
          v-model:sort="sort"
          v-model:sort-direction="order"
          :data="items"
          :columns="columns"
          :loading="isLoading"
          class="w-full"
        >
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-pencil"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="openEditDrawer(row.original as any)"
              />
              <UButton
                icon="i-lucide-trash"
                size="xs"
                color="error"
                variant="ghost"
                @click="deleteItem((row.original as any).id)"
              />
            </div>
          </template>
        </UTable>

        <template
          v-if="total > limit"
          #footer
        >
          <div class="flex justify-center">
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

  <ClientOnly>
    <USlideover
      v-model:open="isDrawerOpen"
      :title="isEditMode ? 'Doktor Profili Düzenle' : 'Yeni Doktor Profili'"
      :ui="{ content: 'max-w-[33vw] min-w-[33vw] w-full' }"
    >
      <template #content>
        <div class="p-0 overflow-y-auto max-h-screen bg-white dark:bg-gray-950">
          <UForm
            :schema="schema"
            :state="state"
            class="flex flex-col min-h-full"
            @submit="onSubmit"
          >
            <div class="p-6 space-y-6 flex-1">
              <UFormField
                label="İsim ve Unvan"
                name="isim_unvan"
              >
                <UInput
                  v-model="state.isim_unvan"
                  class="w-full shadow-sm"
                  size="md"
                />
              </UFormField>

              <UFormField
                label="Slug"
                name="slug"
                help="Bu alan İsim ve Unvan alanından otomatik üretilir."
              >
                <UInput
                  v-model="state.slug"
                  placeholder="Otomatik oluşturulur..."
                  class="w-full shadow-sm"
                  size="md"
                />
              </UFormField>

              <UFormField
                label="Uzmanlık Alanı"
                name="uzmanlik_alani"
              >
                <UInput
                  v-model="state.uzmanlik_alani"
                  class="w-full shadow-sm"
                  size="md"
                />
              </UFormField>

              <UFormField
                label="Unvan Detayı"
                name="unvan_detay"
              >
                <UEditor
                  v-model="state.unvan_detay"
                  :toolbar="toolbarItems"
                  class="min-h-[200px]"
                />
              </UFormField>

              <UFormField
                label="Pratisyen Özellikleri"
                name="pratisen_ozellikleri"
              >
                <UEditor
                  v-model="state.pratisen_ozellikleri"
                  :toolbar="toolbarItems"
                  class="min-h-[200px]"
                />
              </UFormField>

              <div class="border-t border-gray-100 dark:border-gray-800 pt-6">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">SEO Ayarları</h3>
                <div class="space-y-4">
                  <UFormField
                    label="Title Tag"
                    name="titleTag"
                  >
                    <UInput
                      v-model="state.titleTag"
                      class="w-full shadow-sm"
                    />
                  </UFormField>

                  <UFormField
                    label="Meta Açıklama"
                    name="metaDescription"
                  >
                    <UTextarea
                      v-model="state.metaDescription"
                      class="w-full shadow-sm"
                      :rows="3"
                    />
                  </UFormField>

                  <UFormField
                    label="Canonical URL"
                    name="canonicalUrl"
                  >
                    <UInput
                      v-model="state.canonicalUrl"
                      class="w-full shadow-sm"
                    />
                  </UFormField>

                  <UFormField
                    label="JSON-LD Şeması"
                    name="jsonLd"
                  >
                    <UTextarea
                      v-model="state.jsonLd"
                      class="w-full font-mono text-xs bg-gray-50 dark:bg-gray-900 shadow-inner"
                      :rows="6"
                      placeholder='{ "@context": "https://schema.org", ... }'
                    />
                  </UFormField>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 z-10">
              <UButton
                label="İptal"
                color="neutral"
                variant="ghost"
                class="rounded-lg px-6"
                @click="isDrawerOpen = false"
              />
              <UButton
                type="submit"
                label="Kaydet"
                color="primary"
                class="font-bold rounded-lg px-8 shadow-md"
                :loading="isSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
