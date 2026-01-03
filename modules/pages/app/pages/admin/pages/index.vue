<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent, EditorToolbarItem, EditorSuggestionMenuItem } from '@nuxt/ui'
import { slugify } from '../../../../../../utils/slugify'

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

// --- AI Completion Stub (Dökümana uygun) ---
const isAiLoading = ref(false)
async function handleAiComplete(editor: any) {
  try {
    isAiLoading.value = true
    // Burada gerçek bir API çağrısı yapılabilir
    // Şimdilik basit bir tamamlama simülasyonu
    const { state } = editor
    const { selection } = state
    // const text = state.doc.textBetween(Math.max(0, selection.from - 100), selection.from, '\n')

    // Basit bir gecikme
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
  // console.log('Fullscreen toggled:', isFullscreen.value)

  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }

  // Çift tetiklemeyi önlemek için kısa bir bekleme süresi
  setTimeout(() => {
    isToggling = false
  }, 100)
}



import type { Page, PageComponent } from '../../../../../../shared/types/page'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const page = ref(1)
const limit = ref(10)
const search = ref('')
const sort = ref('createdAt')
const order = ref<'asc' | 'desc'>('desc')

const { data: listData, refresh: refreshPages, status: pagesStatus, error: pagesError } = await useFetch<{ items: Page[], total: number, pages: number }>('/api/admin/pages', {
  query: computed(() => ({
    page: page.value,
    limit: limit.value,
    search: search.value,
    sort: sort.value,
    order: order.value
  }))
})

const isDrawerOpen = ref(false)
const isComponentDrawerOpen = ref(false)
const isComponentEditorOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isLoading = computed(() => pagesStatus.value === 'pending')

const selectedPage = ref<Page | null>(null)
const selectedComponent = ref<PageComponent | null>(null)

const componentEditorState = reactive<any>({})

const state = reactive({
  id: '',
  slug: '',
  titleTag: '',
  metaDescription: '',
  canonicalUrl: '',
  h1Title: '',
  bodyText: '',
  jsonLd: '',
  featuredImage: '',
  featuredImageAlt: ''
})

// Watch H1 Title to auto-generate slug and title tag
watch(() => state.h1Title, (newVal) => {
  if (newVal && !isEditMode.value) {
    state.slug = slugify(newVal)
    state.titleTag = `${newVal} | OrthoDigi`
  }
})

const schema = z.object({
  slug: z.string().min(1, 'Slug gereklidir'),
  titleTag: z.string().min(1, 'Title Tag gereklidir'),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  h1Title: z.string().min(1, 'H1 Başlığı gereklidir'),
  bodyText: z.string().optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
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
    slug: '',
    titleTag: '',
    metaDescription: '',
    canonicalUrl: '',
    h1Title: '',
    bodyText: '',
    jsonLd: '',
    featuredImage: '',
    featuredImageAlt: ''
  })
  isDrawerOpen.value = true
}

function openEditDrawer(page: Page) {
  isEditMode.value = true
  Object.assign(state, {
    id: page.id,
    slug: page.slug,
    titleTag: page.titleTag,
    metaDescription: page.metaDescription || '',
    canonicalUrl: page.canonicalUrl || '',
    h1Title: page.h1Title,
    bodyText: page.bodyText || '',
    jsonLd: page.jsonLd ? JSON.stringify(page.jsonLd, null, 2) : '',
    featuredImage: page.featuredImage || '',
    featuredImageAlt: page.featuredImageAlt || ''
  })
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const payload = {
      ...event.data,
      jsonLd: event.data.jsonLd ? JSON.parse(event.data.jsonLd) : null
    }

    if (isEditMode.value) {
      await $fetch(`/api/admin/pages/${state.id}`, {
        method: 'PUT',
        body: payload
      })
      useToast().add({ title: 'Sayfa güncellendi', color: 'success' })
    } else {
      await $fetch('/api/admin/pages', {
        method: 'POST',
        body: payload
      })
      useToast().add({ title: 'Sayfa oluşturuldu', color: 'success' })
    }

    isDrawerOpen.value = false
    await refreshPages()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

async function deletePage(id: string) {
  if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
    useToast().add({ title: 'Sayfa silindi', color: 'success' })
    await refreshPages()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.message, color: 'error' })
  }
}

function openComponentDrawer(page: Page) {
  selectedPage.value = page
  isComponentDrawerOpen.value = true
}

function openComponentEditor(component: PageComponent) {
  selectedComponent.value = component
  Object.assign(componentEditorState, JSON.parse(JSON.stringify(component.content)))
  isComponentEditorOpen.value = true
}

async function onComponentSubmit() {
  if (!selectedComponent.value) return

  try {
    isSubmitting.value = true
    const updatedComponent = await $fetch(`/api/admin/pages/components/${selectedComponent.value.id}`, {
      method: 'PATCH',
      body: {
        content: componentEditorState
      }
    })

    // Update local state
    if (selectedPage.value) {
      const index = selectedPage.value.components.findIndex(c => c.id === selectedComponent.value?.id)
      if (index !== -1) {
        selectedPage.value.components[index] = updatedComponent as PageComponent
      }
    }

    isComponentEditorOpen.value = false
    useToast().add({ title: 'Bileşen güncellendi', color: 'success' })
    await refreshPages()
  } catch (error: any) {
    useToast().add({ title: 'Bileşen güncellenemedi', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const componentTypes = [
  { label: 'Hero', value: 'hero', icon: 'i-lucide-layout-template' },
  { label: 'Metin Bloğu', value: 'text', icon: 'i-lucide-align-left' },
  { label: 'Galeri', value: 'gallery', icon: 'i-lucide-image' },
  { label: 'CTA (Eylem Çağrısı)', value: 'cta', icon: 'i-lucide-mouse-pointer-click' },
  { label: 'Özellikler', value: 'features', icon: 'i-lucide-list-checks' }
]

async function addComponent(type: string) {
  if (!selectedPage.value) return

  try {
    const defaultContent: Record<string, any> = {
      hero: { title: 'Yeni Hero', subtitle: '', image: '', ctaLabel: '', ctaUrl: '' },
      text: { body: '<p>Metin içeriği buraya gelecek...</p>' },
      gallery: { items: [] },
      cta: { title: 'Harekete Geçin', description: '', buttonLabel: 'Tıklayın', buttonUrl: '#' },
      features: { items: [] }
    }

    const newComponent = await $fetch(`/api/admin/pages/${selectedPage.value.id}/components`, {
      method: 'POST',
      body: {
        type,
        content: defaultContent[type] || {}
      }
    })

    // Update local state
    if (selectedPage.value.components) {
      selectedPage.value.components.push(newComponent as PageComponent)
    } else {
      selectedPage.value.components = [newComponent as PageComponent]
    }

    useToast().add({ title: 'Bileşen eklendi', color: 'success' })
    await refreshPages()
  } catch (error: any) {
    useToast().add({ title: 'Bileşen eklenemedi', description: error.message, color: 'error' })
  }
}

async function removeComponent(componentId: string) {
  if (!confirm('Bu bileşeni silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/pages/components/${componentId}`, { method: 'DELETE' })

    if (selectedPage.value) {
      selectedPage.value.components = selectedPage.value.components.filter(c => c.id !== componentId)
    }

    useToast().add({ title: 'Bileşen silindi', color: 'success' })
    await refreshPages()
  } catch (error: any) {
    useToast().add({ title: 'Bileşen silinemedi', description: error.message, color: 'error' })
  }
}

async function moveComponent(index: number, direction: 'up' | 'down') {
  if (!selectedPage.value) return

  const components = [...selectedPage.value.components]
  const newIndex = direction === 'up' ? index - 1 : index + 1

  if (newIndex < 0 || newIndex >= components.length) return

  // Swap
  const temp = components[index]
  const other = components[newIndex]

  if (temp && other) {
    components[index] = other
    components[newIndex] = temp
  }

  try {
    await $fetch(`/api/admin/pages/${selectedPage.value.id}/components/reorder`, {
      method: 'PATCH',
      body: {
        componentIds: components.map(c => c.id)
      }
    })

    selectedPage.value.components = components
    await refreshPages()
  } catch (error: any) {
    useToast().add({ title: 'Sıralama güncellenemedi', description: error.message, color: 'error' })
  }
}

const items = computed<Page[]>(() => ((listData.value?.items ?? []) as unknown as Page[]))
const total = computed(() => listData.value?.total ?? 0)

if (pagesError.value) {
  useToast().add({ title: 'Sayfalar yüklenemedi', description: pagesError.value.message, color: 'error' })
}
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="Sayfa Yönetimi">
      <template #right>
        <UButton
          label="Yeni Sayfa"
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
          placeholder="Sayfa ara..."
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
          :columns="[
            { accessorKey: 'h1Title', header: 'Sayfa Başlığı' },
            { accessorKey: 'slug', header: 'URL (Slug)' },
            { accessorKey: 'components', header: 'Bileşenler' },
            { accessorKey: 'createdAt', header: 'Oluşturulma' },
            { id: 'actions', header: 'İşlemler' }
          ]"
          :loading="isLoading"
          class="w-full"
        >
          <template #h1Title-cell="{ row }">
            <div>
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ (row.original as any).h1Title }}
              </div>
              <div class="text-xs text-gray-400">
                {{ (row.original as any).titleTag }}
              </div>
            </div>
          </template>

          <template #slug-cell="{ row }">
            <span class="text-sm text-gray-500">/{{ (row.original as any).slug }}</span>
          </template>

          <template #components-cell="{ row }">
            <UBadge
              color="neutral"
              variant="subtle"
              class="rounded-full px-2 py-0.5 text-[10px] font-bold"
            >
              {{ (row.original as any).components?.length || 0 }} Bileşen
            </UBadge>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-sm">{{ new Date((row.original as any).createdAt).toLocaleDateString('tr-TR') }}</span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton
                icon="i-lucide-layout-panel-top"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openComponentDrawer(row.original as any)"
              />
              <UButton
                icon="i-lucide-edit-2"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openEditDrawer(row.original as any)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                @click="deletePage((row.original as any).id)"
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
      :title="isEditMode ? 'Sayfayı Düzenle' : 'Yeni Sayfa'"
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
            <div class="p-6 space-y-8 flex-1">
              <!-- Temel Bilgiler Bölümü -->
              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-info"
                      class="w-5 h-5 text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Temel Bilgiler
                  </h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <UFormField
                    label="H1 Başlığı"
                    name="h1Title"
                    required
                    help="Sayfanın ana başlığı (SEO için kritik)"
                  >
                    <UInput
                      v-model="state.h1Title"
                      placeholder="Örn: Hakkımızda"
                      class="w-full shadow-sm"
                      size="md"
                    />
                  </UFormField>

                  <UFormField
                    label="Slug (URL)"
                    name="slug"
                    required
                    help="URL yolu (Örn: hakkimizda)"
                  >
                    <UInput
                      v-model="state.slug"
                      placeholder="hakkimizda"
                      class="w-full shadow-sm"
                      size="md"
                    />
                  </UFormField>
                </div>
              </section>

              <!-- Görsel ve Medya Bölümü -->
              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-image"
                      class="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Görsel ve Medya
                  </h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <UFormField
                    label="Öne Çıkan Görsel URL"
                    name="featuredImage"
                  >
                    <UInput
                      v-model="state.featuredImage"
                      placeholder="/images/pages/hero.jpg"
                      class="w-full shadow-sm"
                      size="md"
                    >
                      <template #trailing>
                        <UIcon
                          name="i-lucide-link"
                          class="w-4 h-4 text-gray-400"
                        />
                      </template>
                    </UInput>
                  </UFormField>

                  <UFormField
                    label="Görsel Alt Metni"
                    name="featuredImageAlt"
                  >
                    <UInput
                      v-model="state.featuredImageAlt"
                      placeholder="Görseli açıklayan kısa metin"
                      class="w-full shadow-sm"
                      size="md"
                    />
                  </UFormField>
                </div>
              </section>

              <!-- İçerik Bölümü -->
              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-file-text"
                      class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Sayfa İçeriği
                  </h3>
                </div>

                <UFormField
                  label="Özet (Summary)"
                  name="metaDescription"
                  help="Arama sonuçlarında görünen kısa açıklama"
                >
                  <UTextarea
                    v-model="state.metaDescription"
                    placeholder="Kısa bir özet giriniz..."
                    class="w-full shadow-sm"
                    :rows="3"
                    size="md"
                  />
                </UFormField>

                <UFormField
                  label="İçerik (Body)"
                  name="bodyText"
                >
                  <template #help>
                    <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <UIcon
                        name="i-lucide-sparkles"
                        class="w-3.5 h-3.5 text-primary-500"
                      />
                      <span>Gelişmiş editör aktif: / tuşu ile komutlara erişebilir, blokları sürükleyebilir ve AI desteği alabilirsiniz.</span>
                    </div>
                  </template>
                  <div
                    :class="[
                      'border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-inner transition-all duration-300',
                      isFullscreen ? 'fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8' : 'relative'
                    ]"
                  >
                    <UEditor
                      v-slot="{ editor }"
                      v-model="state.bodyText"
                      placeholder="Sayfa içeriğini buraya yazmaya başlayın..."
                      content-type="html"
                      :class="[
                        'w-full transition-all duration-300',
                        isFullscreen ? 'max-w-4xl h-[90vh] shadow-2xl rounded-2xl bg-white dark:bg-gray-950 overflow-hidden border border-gray-100 dark:border-gray-800' : 'min-h-[500px]'
                      ]"
                      :ui="{ base: isFullscreen ? 'p-12 sm:px-20 overflow-y-auto h-full' : 'p-8 sm:px-12' }"
                    >
                      <!-- Drag Handle & Drag & Drop -->
                      <UEditorDragHandle :editor="editor" />

                      <!-- Suggestion Menu (Slash Commands) -->
                      <UEditorSuggestionMenu
                        :editor="editor"
                        :items="suggestionItems"
                      />

                      <!-- Bubble Toolbar -->
                      <UEditorToolbar
                        :editor="editor"
                        :items="toolbarItems"
                        layout="bubble"
                      />

                      <!-- Fixed Toolbar with AI Completion & Fullscreen -->
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
              </section>

              <!-- SEO ve Gelişmiş Ayarlar -->
              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-settings"
                      class="w-5 h-5 text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Gelişmiş Ayarlar
                  </h3>
                </div>

                <UTabs
                  :items="[
                    { label: 'SEO', icon: 'i-lucide-search', slot: 'seo' },
                    { label: 'JSON-LD', icon: 'i-lucide-code', slot: 'jsonld' }
                  ]"
                  class="w-full"
                  variant="link"
                  :ui="{ list: 'border-b border-gray-100 dark:border-gray-800' }"
                >
                  <template #seo>
                    <div class="space-y-4 py-4">
                      <UFormField
                        label="Title Tag"
                        name="titleTag"
                        required
                      >
                        <UInput
                          v-model="state.titleTag"
                          placeholder="Örn: Hakkımızda | OrthoDigi"
                          class="w-full shadow-sm"
                        />
                      </UFormField>

                      <UFormField
                        label="Canonical URL"
                        name="canonicalUrl"
                      >
                        <UInput
                          v-model="state.canonicalUrl"
                          placeholder="https://example.com/hakkimizda"
                          class="w-full shadow-sm"
                        />
                      </UFormField>
                    </div>
                  </template>

                  <template #jsonld>
                    <div class="py-4">
                      <UFormField
                        label="JSON-LD Şeması"
                        name="jsonLd"
                      >
                        <UTextarea
                          v-model="state.jsonLd"
                          placeholder="{ &quot;@context&quot;: &quot;https://schema.org&quot;, ... }"
                          class="w-full font-mono text-xs bg-gray-50 dark:bg-gray-900 shadow-inner"
                          :rows="8"
                        />
                      </UFormField>
                    </div>
                  </template>
                </UTabs>
              </section>
            </div>

            <!-- Footer / Actions -->
            <div class="sticky bottom-0 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 z-10">
              <UButton
                label="Vazgeç"
                color="neutral"
                variant="ghost"
                class="rounded-lg px-6 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                @click="isDrawerOpen = false"
              />
              <UButton
                type="submit"
                :label="isEditMode ? 'Değişiklikleri Kaydet' : 'Sayfayı Yayınla'"
                color="primary"
                class="rounded-lg px-8 shadow-md hover:shadow-lg transition-all font-bold"
                :loading="isSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </USlideover>

    <USlideover
      v-model:open="isComponentDrawerOpen"
      title="Sayfa Bileşenlerini Yönet"
    >
      <template #content>
        <div class="p-6 flex flex-col h-full overflow-hidden">
          <div
            v-if="selectedPage"
            class="flex-1 flex flex-col gap-6 overflow-hidden"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-lg">
                  {{ selectedPage.h1Title }}
                </h3>
                <p class="text-sm text-gray-500 italic">
                  Bileşenleri ekleyin, düzenleyin ve sıralayın.
                </p>
              </div>
              <UDropdownMenu
                :items="[componentTypes.map(t => ({ label: t.label, icon: t.icon, click: () => addComponent(t.value) }))]"
                :ui="{ width: 'w-56' }"
              >
                <UButton
                  label="Bileşen Ekle"
                  icon="i-lucide-plus"
                  color="primary"
                />
              </UDropdownMenu>
            </div>

            <div class="flex-1 overflow-y-auto space-y-4 pr-2">
              <div
                v-if="!selectedPage.components || selectedPage.components.length === 0"
                class="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl"
              >
                <UIcon
                  name="i-lucide-layers"
                  class="w-12 h-12 text-gray-200 mb-4 mx-auto"
                />
                <p class="text-gray-400">
                  Henüz bileşen eklenmemiş.
                </p>
              </div>

              <div
                v-for="(comp, index) in selectedPage.components"
                :key="comp.id"
                class="group bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-500 transition-colors"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <UBadge
                      color="primary"
                      variant="subtle"
                      size="sm"
                      class="rounded-lg"
                    >
                      #{{ index + 1 }}
                    </UBadge>
                    <span class="font-bold text-sm uppercase tracking-tight">{{ comp.type }}</span>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UButton
                      icon="i-lucide-arrow-up"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="index === 0"
                      @click="moveComponent(index, 'up')"
                    />
                    <UButton
                      icon="i-lucide-arrow-down"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="index === selectedPage.components.length - 1"
                      @click="moveComponent(index, 'down')"
                    />
                    <UButton
                      icon="i-lucide-edit"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="openComponentEditor(comp)"
                    />
                    <UButton
                      icon="i-lucide-trash"
                      color="error"
                      variant="ghost"
                      size="xs"
                      @click="removeComponent(comp.id)"
                    />
                  </div>
                </div>
                <div class="text-xs text-gray-500 truncate">
                  {{ JSON.stringify(comp.content) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <USlideover
      v-model:open="isComponentEditorOpen"
      :title="selectedComponent ? `${selectedComponent.type.toUpperCase()} Düzenle` : 'Bileşen Düzenle'"
    >
      <template #content>
        <div class="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div
            v-if="selectedComponent"
            class="space-y-6"
          >
            <!-- Hero Editor -->
            <div
              v-if="selectedComponent.type === 'hero'"
              class="space-y-4"
            >
              <UFormField label="Başlık">
                <UInput v-model="componentEditorState.title" />
              </UFormField>
              <UFormField label="Alt Başlık">
                <UTextarea v-model="componentEditorState.subtitle" />
              </UFormField>
              <UFormField label="Görsel URL">
                <UInput v-model="componentEditorState.image" />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Buton Yazısı">
                  <UInput v-model="componentEditorState.ctaLabel" />
                </UFormField>
                <UFormField label="Buton URL">
                  <UInput v-model="componentEditorState.ctaUrl" />
                </UFormField>
              </div>
            </div>

            <!-- Text Editor -->
            <div
              v-else-if="selectedComponent.type === 'text'"
              class="space-y-4"
            >
              <UFormField label="İçerik (HTML)">
                <UTextarea
                  v-model="componentEditorState.body"
                  :rows="15"
                />
              </UFormField>
            </div>

            <!-- CTA Editor -->
            <div
              v-else-if="selectedComponent.type === 'cta'"
              class="space-y-4"
            >
              <UFormField label="Başlık">
                <UInput v-model="componentEditorState.title" />
              </UFormField>
              <UFormField label="Açıklama">
                <UTextarea v-model="componentEditorState.description" />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Buton Yazısı">
                  <UInput v-model="componentEditorState.buttonLabel" />
                </UFormField>
                <UFormField label="Buton URL">
                  <UInput v-model="componentEditorState.buttonUrl" />
                </UFormField>
              </div>
            </div>

            <!-- Fallback for other types -->
            <div
              v-else
              class="space-y-4"
            >
              <p class="text-sm text-gray-500 mb-2">
                Bu bileşen türü için özel düzenleyici henüz eklenmedi. Ham JSON verisini düzenleyebilirsiniz:
              </p>
              <UTextarea
                :model-value="JSON.stringify(componentEditorState, null, 2)"
                :rows="15"
                font-mono
                @update:model-value="val => {
                  try { Object.assign(componentEditorState, JSON.parse(val)) }
                  catch (e) {}
                }"
              />
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <UButton
                label="İptal"
                color="neutral"
                variant="ghost"
                @click="isComponentEditorOpen = false"
              />
              <UButton
                label="Kaydet"
                color="primary"
                :loading="isSubmitting"
                @click="onComponentSubmit"
              />
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
