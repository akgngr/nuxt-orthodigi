<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent, EditorToolbarItem, EditorSuggestionMenuItem } from '@nuxt/ui'
import { slugify } from '../../../../../utils/slugify'

import PageBuilderEditor from '../../../../components/app/components/admin/PageBuilder/Editor.vue'

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
    const text = state.doc.textBetween(Math.max(0, selection.from - 100), selection.from, '\n')

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

  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }

  setTimeout(() => {
    isToggling = false
  }, 100)
}



interface Blog {
  id: string
  slug: string
  titleTag: string
  metaDescription?: string
  canonicalUrl?: string
  h1Title: string
  bodyText?: string
  jsonLd?: any
  featuredImage?: string
  featuredImageAlt?: string
  components: BlogComponent[]
  createdAt: string
  updatedAt: string
}

interface BlogComponent {
  id: string
  type: string
  content: any
  order: number
}

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

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

const { data: blogsResponse, refresh: refreshBlogs, status: blogsStatus, error: blogsError } = useFetch<any>('/api/admin/blog', { query })
const { data: categoriesResponse, refresh: refreshCategories, error: categoriesError, status: categoriesStatus } = useFetch<any>('/api/admin/categories')
const { data: tagsResponse, refresh: refreshTags, error: tagsError, status: tagsStatus } = useFetch<any>('/api/admin/tags')
const { data: usersResponse, refresh: refreshUsers, error: usersError, status: usersStatus } = useFetch<any>('/api/admin/users')
const { data: formsList } = useFetch<any>('/api/admin/forms')

const authors = computed(() => usersResponse.value?.items || [])
const categoryOptions = computed(() => {
  const items = categoriesResponse.value as any[]
  if (!Array.isArray(items)) return []
  return items.map((c: any) => ({ label: c.name, value: c.id }))
})

const tagOptions = computed(() => {
  const items = tagsResponse.value as any[]
  if (!Array.isArray(items)) return []
  return items.map((t: any) => ({ label: t.name, value: t.id }))
})

const authorOptions = computed(() => {
  const items = authors.value as any[]
  if (!Array.isArray(items)) return []
  return items.map((u: any) => ({ label: u.name || u.email, value: u.id }))
})

watch([categoriesError, tagsError, usersError], ([catErr, tagErr, userErr]) => {
  if (catErr) useToast().add({ title: 'Kategoriler yüklenemedi', description: catErr.message, color: 'error' })
  if (tagErr) useToast().add({ title: 'Etiketler yüklenemedi', description: tagErr.message, color: 'error' })
  if (userErr) useToast().add({ title: 'Kullanıcılar yüklenemedi', description: userErr.message, color: 'error' })
})

const blogs = computed(() => blogsResponse.value?.items || [])
const total = computed(() => blogsResponse.value?.total || 0)

const columns = [
  { accessorKey: 'h1Title', header: 'Yazı Başlığı' },
  { accessorKey: 'categoryId', header: 'Kategori' },
  { accessorKey: 'published', header: 'Durum' },
  { accessorKey: 'components', header: 'Bileşenler' },
  { accessorKey: 'createdAt', header: 'Oluşturulma' },
  { id: 'actions', header: 'İşlemler' }
]

watch(blogsError, (err) => {
  if (err) {
    useToast().add({
      title: 'Veri yükleme hatası',
      description: err.message || 'Blog yazıları yüklenirken bir hata oluştu.',
      color: 'error'
    })
  }
}, { immediate: true })

const isDrawerOpen = ref(false)
const isComponentDrawerOpen = ref(false)
const isComponentEditorOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isLoading = computed(() => blogsStatus.value === 'pending')

const selectedBlog = ref<Blog | null>(null)
const selectedComponent = ref<BlogComponent | null>(null)

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
  featuredImageAlt: '',
  selectedCategory: undefined as { label: string, value: string } | undefined,
  selectedTags: [] as { label: string, value: string }[],
  selectedAuthor: undefined as { label: string, value: string } | undefined,
  published: false
})

// Watch H1 Title to auto-generate slug and title tag
watch(() => state.h1Title, (newVal) => {
  if (newVal && !isEditMode.value) {
    state.slug = slugify(newVal)
    state.titleTag = `${newVal} | OrthoDigi Blog`
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
  selectedCategory: z.object({ label: z.string(), value: z.string() }).optional().nullable(),
  selectedTags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  selectedAuthor: z.object({ label: z.string(), value: z.string() }).optional().nullable(),
  published: z.boolean().default(false),
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
  refreshCategories()
  refreshTags()
  refreshUsers()
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
    featuredImageAlt: '',
    selectedCategory: undefined,
    selectedTags: [],
    selectedAuthor: undefined,
    published: false
  })
  isDrawerOpen.value = true
}

function openEditDrawer(blog: any) {
  refreshCategories()
  refreshTags()
  refreshUsers()
  isEditMode.value = true
  
  const category = categoryOptions.value.find(c => c.value === blog.categoryId)
  const author = authorOptions.value.find(u => u.value === blog.authorId)
  // Tags might be objects in blog.tags or ids. Assuming objects with id based on previous code
  const blogTagIds = blog.tags?.map((t: any) => t.id) || []
  const tags = tagOptions.value.filter(t => blogTagIds.includes(t.value))

  Object.assign(state, {
    id: blog.id,
    slug: blog.slug,
    titleTag: blog.titleTag,
    metaDescription: blog.metaDescription || '',
    canonicalUrl: blog.canonicalUrl || '',
    h1Title: blog.h1Title,
    bodyText: blog.bodyText || '',
    jsonLd: blog.jsonLd ? JSON.stringify(blog.jsonLd, null, 2) : '',
    featuredImage: blog.featuredImage || '',
    featuredImageAlt: blog.featuredImageAlt || '',
    selectedCategory: category,
    selectedTags: tags,
    selectedAuthor: author,
    published: blog.published || false
  })
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const payload = {
      ...event.data,
      categoryId: state.selectedCategory?.value || null,
      authorId: state.selectedAuthor?.value || null,
      tags: state.selectedTags.map(t => t.value),
      jsonLd: event.data.jsonLd ? JSON.parse(event.data.jsonLd) : null
    }
    // Remove temporary selected fields from payload
    delete (payload as any).selectedCategory
    delete (payload as any).selectedTags
    delete (payload as any).selectedAuthor

    if (isEditMode.value) {
      await $fetch(`/api/admin/blog/${state.id}`, {
        method: 'PUT',
        body: payload
      })
      useToast().add({ title: 'Yazı güncellendi', color: 'success' })
    } else {
      await $fetch('/api/admin/blog', {
        method: 'POST',
        body: payload
      })
      useToast().add({ title: 'Yazı oluşturuldu', color: 'success' })
    }

    isDrawerOpen.value = false
    await refreshBlogs()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

async function deleteBlog(id: string) {
  if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    useToast().add({ title: 'Yazı silindi', color: 'success' })
    await refreshBlogs()
  } catch (error: any) {
    useToast().add({ title: 'Hata oluştu', description: error.message, color: 'error' })
  }
}

function openComponentDrawer(blog: Blog) {
  selectedBlog.value = blog
  isComponentDrawerOpen.value = true
}

function openComponentEditor(component: BlogComponent) {
  selectedComponent.value = component
  Object.assign(componentEditorState, JSON.parse(JSON.stringify(component.content)))
  isComponentEditorOpen.value = true
}

async function onComponentSubmit() {
  if (!selectedComponent.value) return

  try {
    isSubmitting.value = true
    const updatedComponent = await $fetch(`/api/admin/blog/components/${selectedComponent.value.id}`, {
      method: 'PATCH',
      body: {
        content: componentEditorState
      }
    })

    if (selectedBlog.value) {
      const index = selectedBlog.value.components.findIndex(c => c.id === selectedComponent.value?.id)
      if (index !== -1) {
        selectedBlog.value.components[index] = updatedComponent as BlogComponent
      }
    }

    isComponentEditorOpen.value = false
    useToast().add({ title: 'Bileşen güncellendi', color: 'success' })
    await refreshBlogs()
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
  { label: 'Özellikler', value: 'features', icon: 'i-lucide-list-checks' },
  { label: 'İletişim Formu', value: 'form', icon: 'i-lucide-clipboard-list' }
]

function getComponentDef(type: string) {
  return componentTypes.find(t => t.value === type) || { label: type, icon: 'i-lucide-box' }
}

function getComponentSummary(comp: BlogComponent) {
  const content = comp.content
  if (!content) return ''

  switch (comp.type) {
    case 'hero':
      return content.title || 'Başlık yok'
    case 'text':
      // Strip HTML tags for summary
      return content.body?.replace(/<[^>]*>/g, '').substring(0, 100) || 'Metin içeriği...'
    case 'gallery':
      return `${content.items?.length || 0} görsel`
    case 'cta':
      return content.title || 'CTA Başlığı yok'
    case 'features':
      return `${content.items?.length || 0} özellik`
    case 'form':
      return `Form: ${content.slug || 'Seçilmedi'}`
    default:
      return 'İçerik önizlemesi yok'
  }
}

async function addComponent(type: string) {
  if (!selectedBlog.value) return

  try {
    const defaultContent: Record<string, any> = {
      hero: { title: 'Yeni Hero', subtitle: '', image: '', ctaLabel: '', ctaUrl: '' },
      text: { body: '<p>Metin içeriği buraya gelecek...</p>' },
      gallery: { items: [] },
      cta: { title: 'Harekete Geçin', description: '', buttonLabel: 'Tıklayın', buttonUrl: '#' },
      features: { items: [] },
      form: { slug: '', title: '', description: '' }
    }

    const newComponent = await $fetch(`/api/admin/blog/${selectedBlog.value.id}/components`, {
      method: 'POST',
      body: {
        type,
        content: defaultContent[type] || {}
      }
    })

    if (selectedBlog.value.components) {
      selectedBlog.value.components.push(newComponent as BlogComponent)
    } else {
      selectedBlog.value.components = [newComponent as BlogComponent]
    }

    useToast().add({ title: 'Bileşen eklendi', color: 'success' })
    await refreshBlogs()
  } catch (error: any) {
    useToast().add({ title: 'Bileşen eklenemedi', description: error.message, color: 'error' })
  }
}

async function moveComponent(index: number, direction: number | 'down') {
  if (!selectedBlog.value || !selectedBlog.value.components) return

  const components = [...selectedBlog.value.components]
  const dir = direction === 'down' ? 1 : (direction as number)

  if (index + dir < 0 || index + dir >= components.length) return

  const temp = components[index]
  components[index] = components[index + dir]
  components[index + dir] = temp

  components.forEach((c, i) => (c.order = i))
  selectedBlog.value.components = components

  try {
    // Update order in database using dedicated reorder endpoint
    await $fetch(`/api/admin/blog/${selectedBlog.value.id}/components/reorder`, {
      method: 'PATCH',
      body: {
        componentIds: components.map(c => c.id)
      }
    })
    useToast().add({ title: 'Sıralama güncellendi', color: 'success' })
  } catch (error: any) {
    useToast().add({ title: 'Sıralama güncellenemedi', description: error.message, color: 'error' })
    await refreshBlogs()
  }
}

async function onComponentSave(content: any) {
  if (selectedComponent.value) {
    Object.assign(componentEditorState, content)
    await onComponentSubmit()
  }
}

async function removeComponent(componentId: string) {
  if (!confirm('Bu bileşeni silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/admin/blog/components/${componentId}`, { method: 'DELETE' })

    if (selectedBlog.value) {
      selectedBlog.value.components = selectedBlog.value.components.filter(c => c.id !== componentId)
    }

    useToast().add({ title: 'Bileşen silindi', color: 'success' })
    await refreshBlogs()
  } catch (error: any) {
    useToast().add({ title: 'Bileşen silinemedi', description: error.message, color: 'error' })
  }
}

if (blogsError.value) {
  useToast().add({ title: 'Yazılar yüklenemedi', description: blogsError.value.message, color: 'error' })
}
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="Blog Yönetimi">
      <template #right>
        <UButton
          label="Yeni Yazı"
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
          placeholder="Yazı ara..."
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
          :data="blogs"
          :columns="columns"
          :loading="isLoading"
          class="w-full"
        >
          <template #h1Title-cell="{ row }">
            <div class="font-semibold text-gray-900 dark:text-white">
              {{ (row.original as any).h1Title }}
            </div>
            <div class="text-xs text-gray-400">
              /blog/{{ (row.original as any).slug }}
            </div>
          </template>

          <template #categoryId-cell="{ row }">
            <UBadge
              v-if="(row.original as any).category"
              color="primary"
              variant="subtle"
              class="rounded-full"
            >
              {{ (row.original as any).category.name }}
            </UBadge>
            <span
              v-else
              class="text-gray-400 text-xs"
            >Kategorisiz</span>
          </template>

          <template #published-cell="{ row }">
            <UBadge
              :color="(row.original as any).published ? 'success' : 'neutral'"
              variant="subtle"
              class="rounded-full"
            >
              {{ (row.original as any).published ? 'Yayında' : 'Taslak' }}
            </UBadge>
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
                @click="deleteBlog((row.original as any).id)"
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
      :title="isEditMode ? 'Yazıyı Düzenle' : 'Yeni Yazı'"
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
                    Temel Bilgiler
                  </h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <UFormField
                    label="H1 Başlığı"
                    name="h1Title"
                    required
                    help="Yazının ana başlığı (SEO için kritik)"
                  >
                    <UInput
                      v-model="state.h1Title"
                      placeholder="Örn: Yeni Blog Yazısı"
                      class="w-full shadow-sm"
                      size="md"
                    />
                  </UFormField>

                  <div class="grid grid-cols-2 gap-4">
                    <UFormField
                      label="Slug (URL)"
                      name="slug"
                      required
                      help="URL yolu (Örn: yeni-blog-yazisi)"
                    >
                      <UInput
                        v-model="state.slug"
                        placeholder="yeni-blog-yazisi"
                        class="w-full shadow-sm"
                        size="md"
                      />
                    </UFormField>

                    <UFormField
                      label="Yayın Durumu"
                      name="published"
                    >
                      <div class="flex items-center h-full pt-2">
                        <USwitch
                          v-model="state.published"
                          class="mr-2"
                        />
                        <span class="text-sm text-gray-500">
                          {{ state.published ? 'Yayında' : 'Taslak' }}
                        </span>
                      </div>
                    </UFormField>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <UFormField
                      label="Kategori"
                      name="selectedCategory"
                    >
                      <USelectMenu
                        v-model="state.selectedCategory"
                        :items="categoryOptions"
                        :loading="categoriesStatus === 'pending'"
                        option-attribute="label"
                        placeholder="Kategori Seçin"
                        class="w-full"
                      />
                    </UFormField>

                    <UFormField
                      label="Yazar"
                      name="selectedAuthor"
                    >
                      <USelectMenu
                        v-model="state.selectedAuthor"
                        :items="authorOptions"
                        :loading="usersStatus === 'pending'"
                        option-attribute="label"
                        placeholder="Yazar Seçin"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <UFormField
                    label="Etiketler"
                    name="selectedTags"
                  >
                    <USelectMenu
                      v-model="state.selectedTags"
                      multiple
                      :items="tagOptions"
                      :loading="tagsStatus === 'pending'"
                      option-attribute="label"
                      placeholder="Etiket Seçin"
                      class="w-full"
                    />
                  </UFormField>
                </div>
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
                      placeholder="/images/blog/hero.jpg"
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

              <section class="space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <UIcon
                      name="i-lucide-file-text"
                      class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Yazı İçeriği
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
                      placeholder="Blog içeriğini buraya yazmaya başlayın..."
                      content-type="html"
                      :class="[
                        'w-full transition-all duration-300',
                        isFullscreen ? 'max-w-4xl h-[90vh] shadow-2xl rounded-2xl bg-white dark:bg-gray-950 overflow-hidden border border-gray-100 dark:border-gray-800' : 'min-h-[40rem]'
                      ]"
                      :ui="{ base: isFullscreen ? 'p-12 sm:px-20 overflow-y-auto h-full' : 'p-8 sm:px-12' }"
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
                          placeholder="Örn: Blog Başlığı | OrthoDigi"
                          class="w-full shadow-sm"
                        />
                      </UFormField>

                      <UFormField
                        label="Canonical URL"
                        name="canonicalUrl"
                      >
                        <UInput
                          v-model="state.canonicalUrl"
                          placeholder="https://orthodigi.com/blog/yazi-url"
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
                :label="isEditMode ? 'Değişiklikleri Kaydet' : 'Yazıyı Yayınla'"
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
      title="Yazı Bileşenlerini Yönet"
    >
      <template #content>
        <div class="p-6 flex flex-col h-full overflow-hidden">
          <div
            v-if="selectedBlog"
            class="flex-1 flex flex-col gap-6 overflow-hidden"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-lg">
                  {{ selectedBlog.h1Title }}
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
                v-if="!selectedBlog.components || selectedBlog.components.length === 0"
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
                v-for="(comp, index) in selectedBlog.components"
                :key="comp.id"
              >
                <UCard :ui="{ body: 'p-3 sm:p-4' }">
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <UBadge
                        color="neutral"
                        variant="soft"
                        size="sm"
                        class="rounded-lg font-mono"
                      >
                        {{ index + 1 }}
                      </UBadge>
                      
                      <div class="flex items-center gap-2">
                        <UIcon 
                          :name="getComponentDef(comp.type).icon" 
                          class="w-5 h-5 text-gray-500" 
                        />
                        <div>
                          <div class="font-semibold text-sm">
                            {{ getComponentDef(comp.type).label }}
                          </div>
                          <div class="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                            {{ getComponentSummary(comp) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-1">
                      <UTooltip text="Yukarı Taşı">
                        <UButton
                          icon="i-lucide-arrow-up"
                          color="neutral"
                          variant="ghost"
                          size="xs"
                          :disabled="index === 0"
                          @click="moveComponent(index, -1)"
                        />
                      </UTooltip>
                      
                      <UTooltip text="Aşağı Taşı">
                        <UButton
                          icon="i-lucide-arrow-down"
                          color="neutral"
                          variant="ghost"
                          size="xs"
                          :disabled="index === selectedBlog.components.length - 1"
                          @click="moveComponent(index, 'down')"
                        />
                      </UTooltip>

                      <UDivider vertical class="h-4 mx-1" />

                      <UTooltip text="Düzenle">
                        <UButton
                          icon="i-lucide-edit-2"
                          color="primary"
                          variant="ghost"
                          size="xs"
                          @click="openComponentEditor(comp)"
                        />
                      </UTooltip>
                      
                      <UTooltip text="Sil">
                        <UButton
                          icon="i-lucide-trash-2"
                          color="error"
                          variant="ghost"
                          size="xs"
                          @click="removeComponent(comp.id)"
                        />
                      </UTooltip>
                    </div>
                  </div>
                </UCard>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <USlideover
      v-model:open="isComponentEditorOpen"
      :title="selectedComponent ? `${getComponentDef(selectedComponent.type).label} Düzenle` : 'Bileşen Düzenle'"
      :ui="{ width: 'w-[500px]' }"
    >
      <template #content>
        <PageBuilderEditor
          v-if="selectedComponent"
          :component="selectedComponent"
          :loading="isSubmitting"
          @save="onComponentSave"
          @cancel="isComponentEditorOpen = false"
        />
      </template>
    </USlideover>
  </ClientOnly>
</template>
