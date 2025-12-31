g<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, TableColumn, EditorToolbarItem } from '#ui/types'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// --- Slugify Helper ---
function slugify(text: string) {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  }
  return text
    .toString()
    .toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m] ?? m)
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

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

const { data: listData, refresh, pending: isLoading } = await useFetch('/api/admin/doctorprofile')

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
  slug: z.string().min(1, 'Slug gereklidir')
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
  slug: ''
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
    slug: ''
  })
  isDrawerOpen.value = true
}

function openEditDrawer(item: DoctorProfile) {
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
    slug: item.slug ?? ''
  })
  isDrawerOpen.value = true
}

// Watch isim_unvan to auto-generate slug
watch(() => state.isim_unvan, (newVal) => {
  if (!isEditMode.value && newVal) {
    state.slug = slugify(newVal)
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const url = isEditMode.value ? `/api/admin/doctorprofile/${state.id}` : '/api/admin/doctorprofile'
    const method = isEditMode.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: event.data
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

const items = computed<DoctorProfile[]>(() => ((listData.value ?? []) as unknown as DoctorProfile[]))

const columns: TableColumn<DoctorProfile>[] = [
  { accessorKey: 'isim_unvan', header: 'İsim ve Unvan' },
  { accessorKey: 'uzmanlik_alani', header: 'Uzmanlık Alanı' },
  { accessorKey: 'slug', header: 'Slug' },
  { id: 'actions', header: 'İşlemler' }
]
</script>

<template>
  <UDashboardPanel grow>
    <template #header>
      <AdminNavbar>
        <template #leading>
          <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Doktor Profilleri Yönetimi</h1>
        </template>
        <template #trailing>
          <UButton 
            icon="i-lucide-plus" 
            label="Yeni Ekle" 
            color="primary" 
            class="font-bold rounded-xl" 
            @click="openCreateDrawer" 
          />
        </template>
      </AdminNavbar>
    </template>

    <template #body>
      <UCard class="shadow-sm border-none bg-white dark:bg-gray-900" :ui="{ body: 'p-0', header: 'border-b-0 px-6 py-4' }">
        <UTable
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
                @click="openEditDrawer(row.original)"
              />
              <UButton
                icon="i-lucide-trash"
                size="xs"
                color="error"
                variant="ghost"
                @click="deleteItem(row.original.id)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </template>
  </UDashboardPanel>

  <ClientOnly>
    <USlideover 
      v-model:open="isDrawerOpen" 
      :title="isEditMode ? 'Doktor Profili Düzenle' : 'Yeni Doktor Profili'"
      :ui="{ content: 'max-w-[33vw] min-w-[33vw] w-full' }"
    >
      <template #content>
        <div class="p-0 overflow-y-auto max-h-screen bg-white dark:bg-gray-950">
          <UForm :schema="schema" :state="state" @submit="onSubmit" class="flex flex-col min-h-full">
            <div class="p-6 space-y-6 flex-1">
              <UFormField label="İsim ve Unvan" name="isim_unvan">
                <UInput v-model="state.isim_unvan" class="w-full shadow-sm" size="md" />
              </UFormField>

              <UFormField label="Slug" name="slug" help="Bu alan İsim ve Unvan alanından otomatik üretilir.">
                <UInput v-model="state.slug" placeholder="Otomatik oluşturulur..." class="w-full shadow-sm" size="md" />
              </UFormField>

              <UFormField label="Uzmanlık Alanı" name="uzmanlik_alani">
                <UInput v-model="state.uzmanlik_alani" class="w-full shadow-sm" size="md" />
              </UFormField>

              <UFormField label="Unvan Detayı" name="unvan_detay">
                <UEditor v-model="state.unvan_detay" :toolbar="toolbarItems" class="min-h-[200px]" />
              </UFormField>

              <UFormField label="Pratisyen Özellikleri" name="pratisen_ozellikleri">
                <UEditor v-model="state.pratisen_ozellikleri" :toolbar="toolbarItems" class="min-h-[200px]" />
              </UFormField>
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
