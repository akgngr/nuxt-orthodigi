<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent, EditorToolbarItem, EditorSuggestionMenuItem } from '@nuxt/ui'
import { slugify } from '../../../../../utils/slugify'

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
    // const text = state.doc.textBetween(Math.max(0, selection.from - 100), selection.from, '\n')

    await new Promise(resolve => setTimeout(resolve, 1000))

    editor.chain().focus().insertContent('... (AI tarafından tamamlanan ürün açıklaması)').run()
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

  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }

  setTimeout(() => {
    isToggling = false
  }, 100)
}



definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface Product {
  id: string
  title: string | null
  summery: string
  slug: string
  body: string | null
  media: any
  createdAt: string
  updatedAt: string
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

const { data: listResponse, refresh, status } = await useFetch<any>('/api/admin/urunler', { query })

const items = computed(() => listResponse.value?.items || [])
const total = computed(() => listResponse.value?.total || 0)
const isLoading = computed(() => status.value === 'pending')

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)

const state = reactive({
  id: '',
  title: '',
  summery: '',
  slug: '',
  body: '',
  media: '',
  titleTag: '',
  metaDescription: '',
  canonicalUrl: '',
  jsonLd: ''
})

const columns = [
  { accessorKey: 'title', header: 'Ürün Adı' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'summery', header: 'Özet' },
  { id: 'actions', header: 'İşlemler' }
]

// Watch Title to auto-generate slug and title tag
watch(() => state.title, (newVal) => {
  if (newVal && !isEditMode.value) {
    state.slug = slugify(newVal)
    state.titleTag = `${newVal} | OrthoDigi`
  }
})

const schema = z.object({
  title: z.string().min(1, 'Ürün adı gereklidir'),
  summery: z.string().min(1, 'Özet alanı gereklidir'),
  slug: z.string().min(1, 'Slug gereklidir'),
  body: z.string().optional().or(z.literal('')),
  media: z.string().optional().or(z.literal('')),
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
    title: '',
    summery: '',
    slug: '',
    body: '',
    media: '',
    titleTag: '',
    metaDescription: '',
    canonicalUrl: '',
    jsonLd: ''
  })
  isDrawerOpen.value = true
}

function openEditDrawer(item: Product) {
  isEditMode.value = true
  Object.assign(state, {
    id: item.id,
    title: item.title || '',
    summery: item.summery,
    slug: item.slug,
    body: item.body || '',
    media: typeof item.media === 'string' ? item.media : JSON.stringify(item.media),
    titleTag: (item as any).titleTag || '',
    metaDescription: (item as any).metaDescription || '',
    canonicalUrl: (item as any).canonicalUrl || '',
    jsonLd: (item as any).jsonLd ? JSON.stringify((item as any).jsonLd, null, 2) : ''
  })
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const url = isEditMode.value ? `/api/admin/urunler/${state.id}` : '/api/admin/urunler'
    const method = isEditMode.value ? 'PUT' : 'POST'

    const payload = {
      ...event.data,
      media: event.data.media ? (event.data.media.startsWith('{') ? JSON.parse(event.data.media) : event.data.media) : {},
      jsonLd: event.data.jsonLd ? JSON.parse(event.data.jsonLd) : null
    }

    await $fetch(url, {
      method,
      body: payload
    })

    useToast().add({
      title: isEditMode.value ? 'Ürün güncellendi' : 'Ürün oluşturuldu',
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
  if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/urunler/${id}`, { method: 'DELETE' })
    useToast().add({ title: 'Ürün silindi', color: 'success' })
    refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata', color: 'error', description: error.data?.message })
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <UDashboardPanel grow>
      <AdminNavbar />

      <UDashboardNavbar title="Ürün Yönetimi">
        <template #right>
          <UButton
            label="Yeni Ürün Ekle"
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
            placeholder="Ürün ara..."
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
            <template #name-cell="{ row }">
              <span class="font-bold text-gray-900 dark:text-white">{{ (row.original as any).name }}</span>
            </template>

            <template #slug-cell="{ row }">
              <span class="text-sm text-gray-500">/urunler/{{ (row.original as any).slug }}</span>
            </template>

            <template #summery-cell="{ row }">
              <span class="text-sm text-gray-400 max-w-xs truncate block">{{ (row.original as any).summery }}</span>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex items-center gap-2">
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
      :title="isEditMode ? 'Ürünü Düzenle' : 'Yeni Ürün'"
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
              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-info"
                      class="w-5 h-5 text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Ürün Bilgileri
                  </h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <UFormField
                    label="Ürün Adı"
                    name="title"
                    required
                  >
                    <UInput
                      v-model="state.title"
                      placeholder="Örn: Diş Protezi"
                      class="w-full shadow-sm"
                      size="md"
                    />
                  </UFormField>

                  <UFormField
                    label="Slug (URL)"
                    name="slug"
                    required
                  >
                    <UInput
                      v-model="state.slug"
                      placeholder="dis-protezi"
                      class="w-full shadow-sm"
                      size="md"
                    />
                  </UFormField>

                  <UFormField
                    label="Kısa Özet"
                    name="summery"
                    required
                  >
                    <UTextarea
                      v-model="state.summery"
                      placeholder="Ürün hakkında kısa bilgi..."
                      class="w-full shadow-sm"
                      :rows="2"
                      size="md"
                    />
                  </UFormField>
                </div>
              </section>

              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-file-text"
                      class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Ürün Açıklaması
                  </h3>
                </div>

                <UFormField
                  label="Detaylı İçerik"
                  name="body"
                >
                  <template #help>
                    <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <UIcon
                        name="i-lucide-sparkles"
                        class="w-3.5 h-3.5 text-primary-500"
                      />
                      <span>Zengin metin editörü aktif.</span>
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
                      v-model="state.body"
                      placeholder="Ürün detaylarını buraya yazın..."
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
              </section>

              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-image"
                      class="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Medya (JSON)
                  </h3>
                </div>
                <UFormField
                  label="Medya Ayarları"
                  name="media"
                >
                  <UTextarea
                    v-model="state.media"
                    placeholder="{ &quot;image&quot;: &quot;/path/to/img.jpg&quot; }"
                    class="w-full font-mono text-xs bg-gray-50 dark:bg-gray-900"
                    :rows="4"
                  />
                </UFormField>
              </section>

              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-search"
                      class="w-5 h-5 text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    SEO Ayarları
                  </h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <UFormField
                    label="Title Tag"
                    name="titleTag"
                  >
                    <UInput
                      v-model="state.titleTag"
                      placeholder="Ürün sayfa başlığı"
                      class="w-full shadow-sm"
                      size="md"
                    />
                  </UFormField>

                  <UFormField
                    label="Meta Açıklama"
                    name="metaDescription"
                  >
                    <UTextarea
                      v-model="state.metaDescription"
                      placeholder="SEO meta açıklaması..."
                      class="w-full shadow-sm"
                      :rows="2"
                      size="md"
                    />
                  </UFormField>

                  <UFormField
                    label="Canonical URL"
                    name="canonicalUrl"
                  >
                    <UInput
                      v-model="state.canonicalUrl"
                      placeholder="https://example.com/urunler/..."
                      class="w-full shadow-sm"
                      size="md"
                    />
                  </UFormField>

                  <UFormField
                    label="JSON-LD (Structured Data)"
                    name="jsonLd"
                  >
                    <UTextarea
                      v-model="state.jsonLd"
                      placeholder='{ "@context": "https://schema.org", "@type": "Product", ... }'
                      class="w-full font-mono text-xs bg-gray-50 dark:bg-gray-900"
                      :rows="6"
                    />
                  </UFormField>
                </div>
              </section>
            </div>

            <div class="sticky bottom-0 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 z-10">
              <UButton
                label="Vazgeç"
                color="neutral"
                variant="ghost"
                @click="isDrawerOpen = false"
              />
              <UButton
                type="submit"
                label="Kaydet"
                color="primary"
                class="font-bold"
                :loading="isSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </USlideover>
    </ClientOnly>
  </div>
</template>
