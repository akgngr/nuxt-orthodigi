<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, TableColumn, EditorToolbarItem, EditorSuggestionMenuItem } from '@nuxt/ui'

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

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// --- Slugify Helper ---
function slugify(text: string) {
  const trMap: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u'
  }
  return text
    .toString()
    .toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, m => trMap[m] ?? m)
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

const { data: listResponse, refresh, status } = await useFetch<{ items: DoctorTestimonial[], total: number }>('/api/admin/doctortestimonial', { query })

const items = computed(() => listResponse.value?.items || [])
const total = computed(() => listResponse.value?.total || 0)
const isLoading = computed(() => status.value === 'pending')

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)

const state = reactive({
  id: '',
  name: '',
  slug: '',
  unvan: '',
  image: '',
  social_link: '' as any,
  testimonial: '' as any,
  titleTag: '',
  metaDescription: '',
  canonicalUrl: '',
  jsonLd: ''
})

// Watch name to auto-generate slug and title tag
watch(() => state.name, (newVal) => {
  if (newVal && !isEditMode.value) {
    state.slug = slugify(newVal)
    state.titleTag = `${newVal} | OrthoDigi`
  }
})

const schema = z.object({
  name: z.string().min(1, 'Bu alan gereklidir'),
  slug: z.string().min(1, 'Bu alan gereklidir'),
  unvan: z.string().min(1, 'Bu alan gereklidir'),
  image: z.string().min(1, 'Bu alan gereklidir'),
  social_link: z.any(),
  testimonial: z.string().optional().or(z.literal('')),
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

function openCreateDrawer() {
  isEditMode.value = false
  Object.assign(state, {
    id: '',
    name: '',
    slug: '',
    unvan: '',
    image: '',
    social_link: '',
    testimonial: '',
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
    name: item.name ?? '',
    slug: item.slug ?? '',
    unvan: item.unvan ?? '',
    image: item.image ?? '',
    social_link: item.social_link ?? '',
    testimonial: item.testimonial ?? '',
    titleTag: item.titleTag ?? '',
    metaDescription: item.metaDescription ?? '',
    canonicalUrl: item.canonicalUrl ?? '',
    jsonLd: item.jsonLd ? JSON.stringify(item.jsonLd, null, 2) : ''
  })
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const url = isEditMode.value ? `/api/admin/doctortestimonial/${state.id}` : '/api/admin/doctortestimonial'
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
    await $fetch(`/api/admin/doctortestimonial/${id}`, { method: 'DELETE' })
    useToast().add({ title: 'Silindi', color: 'success' })
    refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata', color: 'error', description: error.data?.message })
  }
}

const columns: TableColumn<DoctorTestimonial>[] = [
  { accessorKey: 'name', header: 'Doktor Adı' },
  { accessorKey: 'unvan', header: 'Unvan' },
  { accessorKey: 'image', header: 'Doktor Resmi' },
  { id: 'actions', header: 'İşlemler' }
]
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="Doktor Yorumları Yönetimi">
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
          placeholder="Yorum ara..."
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
      :title="isEditMode ? 'DoctorTestimonial Düzenle' : 'Yeni DoctorTestimonial'"
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
                label="Doktor Adı"
                name="name"
              >
                <UInput
                  v-model="state.name"
                  class="w-full shadow-sm"
                  size="md"
                />
              </UFormField>

              <UFormField
                label="Slug"
                name="slug"
              >
                <template #help>
                  <span class="text-xs text-gray-500">Doktor Adı alanından otomatik oluşturulur.</span>
                </template>
                <UInput
                  v-model="state.slug"
                  class="w-full shadow-sm"
                  size="md"
                  placeholder="Otomatik oluşturulur..."
                />
              </UFormField>

              <UFormField
                label="Unvan"
                name="unvan"
              >
                <UInput
                  v-model="state.unvan"
                  class="w-full shadow-sm"
                  size="md"
                />
              </UFormField>

              <UFormField
                label="Doktor Resmi"
                name="image"
              >
                <UInput
                  v-model="state.image"
                  class="w-full shadow-sm"
                  size="md"
                />
              </UFormField>

              <UFormField
                label="Sosyal Medya Linki"
                name="social_link"
              >
                <UInput
                  v-model="state.social_link"
                  class="w-full shadow-sm"
                  size="md"
                />
              </UFormField>

              <UFormField
                label="Doktor Yorumu"
                name="testimonial"
              >
                <template #help>
                  <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <UIcon
                      name="i-lucide-sparkles"
                      class="w-3.5 h-3.5 text-primary-500"
                    />
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
                    <UEditorSuggestionMenu
                      :editor="editor"
                      :items="suggestionItems"
                    />
                    <UEditorToolbar
                      :editor="editor"
                      :items="toolbarItems"
                      layout="bubble"
                    />
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
