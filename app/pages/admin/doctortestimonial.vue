<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, TableColumn, EditorToolbarItem, EditorSuggestionMenuItem } from '#ui/types'

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

const suggestionItems: EditorSuggestionMenuItem[][] = [
  [{
    type: 'label',
    label: 'Metin Stilleri'
  }, {
    kind: 'paragraph',
    label: 'Paragraf',
    icon: 'i-lucide-type'
  }, {
    kind: 'heading',
    level: 1,
    label: 'Başlık 1',
    icon: 'i-lucide-heading-1'
  }, {
    kind: 'heading',
    level: 2,
    label: 'Başlık 2',
    icon: 'i-lucide-heading-2'
  }],
  [{
    type: 'label',
    label: 'Listeler'
  }, {
    kind: 'bulletList',
    label: 'Madde İşaretli Liste',
    icon: 'i-lucide-list'
  }, {
    kind: 'orderedList',
    label: 'Numaralı Liste',
    icon: 'i-lucide-list-ordered'
  }],
  [{
    type: 'label',
    label: 'Bloklar'
  }, {
    kind: 'blockquote',
    label: 'Alıntı',
    icon: 'i-lucide-quote'
  }, {
    kind: 'codeBlock',
    label: 'Kod Bloğu',
    icon: 'i-lucide-code'
  }, {
    kind: 'horizontalRule',
    label: 'Ayırıcı Çizgi',
    icon: 'i-lucide-separator-horizontal'
  }]
]

// --- AI Completion Stub ---
const isAiLoading = ref(false)
async function handleAiComplete(editor: any) {
  try {
    isAiLoading.value = true
    const { state } = editor
    const { selection } = state
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    editor.chain().focus().insertContent('... (AI tarafından tamamlanan içerik)').run()
  } finally {
    isAiLoading.value = false
  }
}

// --- Fullscreen Mode Logic ---
const isFullscreen = ref(false)
let isToggling = false
function toggleFullscreen() {
  if (isToggling) return
  isToggling = true
  isFullscreen.value = !isFullscreen.value
  document.body.style.overflow = isFullscreen.value ? 'hidden' : ''
  setTimeout(() => { isToggling = false }, 100)
}


interface DoctorTestimonial {
  id: string
  name: string
  slug: string
  unvan: string
  image: string
  social_link: any
  testimonial: string | null
  createdAt: string
  updatedAt: string
}

const { data: blogs, refresh, status } = await useFetch<DoctorTestimonial[]>('/api/admin/doctortestimonial')

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isLoading = computed(() => status.value === 'pending')

const state = reactive({
  id: '',
  name: '',
  slug: '',
  unvan: '',
  image: '',
  social_link: '' as any,
  testimonial: '' as any
})



const schema = z.object({
  name: z.string().min(1, 'Bu alan gereklidir'),
  slug: z.string().min(1, 'Bu alan gereklidir'),
  unvan: z.string().min(1, 'Bu alan gereklidir'),
  image: z.string().min(1, 'Bu alan gereklidir'),
  social_link: z.any(),
  testimonial: z.string().optional().or(z.literal(''))
})

type Schema = z.infer<typeof schema>

function openCreateDrawer() {
  isEditMode.value = false
  Object.assign(state, {
    id: '',
    name: '',
    slug: '',
    unvan: '',
    image: '',
    social_link: '',
    testimonial: ''
  })
  isDrawerOpen.value = true
}

function openEditDrawer(item: DoctorTestimonial) {
  isEditMode.value = true
  Object.assign(state, {
    id: item.id,
    name: item.name ?? '',
    slug: item.slug ?? '',
    unvan: item.unvan ?? '',
    image: item.image ?? '',
    social_link: item.social_link ?? '',
    testimonial: item.testimonial ?? ''
  })
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const url = isEditMode.value ? `/api/admin/doctortestimonial/${state.id}` : '/api/admin/doctortestimonial'
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
    await $fetch(`/api/admin/doctortestimonial/${id}`, { method: 'DELETE' })
    useToast().add({ title: 'Silindi', color: 'success' })
    refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata', color: 'error', description: error.data?.message })
  }
}

const items = computed<DoctorTestimonial[]>(() => ((blogs.value ?? []) as unknown as DoctorTestimonial[]))

const columns: TableColumn<DoctorTestimonial>[] = [
  { accessorKey: 'name', header: 'name' },
  { accessorKey: 'slug', header: 'slug' },
  { accessorKey: 'unvan', header: 'unvan' },
  { accessorKey: 'image', header: 'image' },
  { accessorKey: 'social_link', header: 'social_link' },
  { accessorKey: 'testimonial', header: 'testimonial' },
  { id: 'actions', header: 'İşlemler' }
]
</script>

<template>
  <UDashboardPanel grow>
    <template #header>
      <AdminNavbar>
        <template #leading>
          <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">DoctorTestimonial Yönetimi</h1>
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
      :title="isEditMode ? 'DoctorTestimonial Düzenle' : 'Yeni DoctorTestimonial'"
      :ui="{ content: 'max-w-[33vw] min-w-[33vw] w-full' }"
    >
      <template #content>
        <div class="p-0 overflow-y-auto max-h-screen bg-white dark:bg-gray-950">
          <UForm :schema="schema" :state="state" @submit="onSubmit" class="flex flex-col min-h-full">
            <div class="p-6 space-y-6 flex-1">
      <UFormField label="name" name="name">
        <UInput v-model="state.name" class="w-full shadow-sm" size="md" />
      </UFormField>

      <UFormField label="slug" name="slug">
        <UInput v-model="state.slug" class="w-full shadow-sm" size="md" />
      </UFormField>

      <UFormField label="unvan" name="unvan">
        <UInput v-model="state.unvan" class="w-full shadow-sm" size="md" />
      </UFormField>

      <UFormField label="image" name="image">
        <UInput v-model="state.image" class="w-full shadow-sm" size="md" />
      </UFormField>

      <UFormField label="social_link" name="social_link">
        <UInput v-model="state.social_link" class="w-full shadow-sm" size="md" />
      </UFormField>

      <UFormField label="testimonial" name="testimonial">
        <template #help>
          <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-primary-500" />
            <span>Zengin metin editörü aktif. / tuşu ile komutlara erişebilirsiniz.</span>
          </div>
        </template>
        <div 
          :class="[
            'border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-inner transition-all duration-300',
            isFullscreen ? 'fixed inset-0 z-[9999] bg-gray-900/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8' : 'relative'
          ]"
        >
          <UEditor
            v-slot="{ editor }"
            v-model="state.testimonial"
            placeholder="testimonial içeriğini buraya yazın..."
            content-type="html"
            :class="[
              'w-full transition-all duration-300',
              isFullscreen ? 'max-w-4xl h-[90vh] shadow-2xl rounded-2xl bg-white dark:bg-gray-950 overflow-hidden border border-gray-100 dark:border-gray-800' : 'min-h-[400px]'
            ]"
            :ui="{ base: isFullscreen ? 'p-12 sm:px-20 overflow-y-auto h-full' : 'p-6 sm:px-8' }"
          >
            <UEditorDragHandle :editor="editor" />
            <UEditorSuggestionMenu :editor="editor" :items="suggestionItems" />
            <UEditorToolbar :editor="editor" :items="toolbarItems" layout="bubble" />
            <UEditorToolbar 
               :editor="editor" 
               class="px-4 pt-4"
               :items="[...toolbarItems, [{
                icon: 'i-lucide-sparkles',
                label: 'AI Tamamla',
                color: 'primary',
                variant: 'subtle',
                tooltip: { text: 'Yapay zeka ile metni devam ettir' },
                onClick: () => handleAiComplete(editor),
                loading: isAiLoading
              }, {
                icon: isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize',
                label: isFullscreen ? 'Küçült' : 'Tam Ekran',
                color: 'neutral',
                variant: 'ghost',
                tooltip: { text: isFullscreen ? 'Tam ekrandan çık' : 'Tam ekrana geç' },
                onClick: toggleFullscreen
              }]]" 
            />
          </UEditor>
        </div>
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
