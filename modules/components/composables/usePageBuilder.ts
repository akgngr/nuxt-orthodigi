import { ref, computed } from 'vue'
import { useState, useFetch } from '#imports'

export interface BuilderField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'richtext' | 'number' | 'boolean' | 'select' | 'color' | 'url' | 'form-selector' | 'repeater'
  options?: any[] // For select
  placeholder?: string
  fields?: BuilderField[] // For repeater
}

export interface BuilderComponentDef {
  type: string
  label: string
  icon: string
  description?: string
  defaultContent: Record<string, any>
  category?: 'content' | 'layout' | 'media' | 'interactive' | 'other'
  schema: BuilderField[]
}

export const defaultComponentDefinitions: BuilderComponentDef[] = [
  {
    type: 'hero',
    label: 'Hero',
    icon: 'i-lucide-layout-template',
    description: 'Büyük başlık, açıklama ve eylem çağrısı içeren giriş bölümü.',
    category: 'layout',
    defaultContent: {
      title: 'Yeni Hero',
      subtitle: '',
      image: '',
      ctaLabel: '',
      ctaUrl: ''
    },
    schema: [
      { name: 'title', label: 'Başlık', type: 'text', placeholder: 'Ana başlığı giriniz' },
      { name: 'subtitle', label: 'Alt Başlık', type: 'textarea', placeholder: 'Kısa açıklama giriniz' },
      { name: 'image', label: 'Arkaplan Görseli', type: 'image' },
      { name: 'ctaLabel', label: 'Buton Yazısı', type: 'text', placeholder: 'Örn: İletişime Geç' },
      { name: 'ctaUrl', label: 'Buton Bağlantısı', type: 'url', placeholder: 'https://...' }
    ]
  },
  {
    type: 'text',
    label: 'Metin Bloğu',
    icon: 'i-lucide-align-left',
    description: 'Zengin metin içeriği.',
    category: 'content',
    defaultContent: {
      body: '<p>Metin içeriği buraya gelecek...</p>'
    },
    schema: [
      { name: 'body', label: 'İçerik', type: 'richtext' }
    ]
  },
  {
    type: 'gallery',
    label: 'Galeri',
    icon: 'i-lucide-image',
    description: 'Görsel galerisi.',
    category: 'media',
    defaultContent: {
      items: []
    },
    schema: [
      { 
        name: 'items', 
        label: 'Görseller', 
        type: 'repeater',
        fields: [
          { name: 'url', label: 'Görsel', type: 'image' },
          { name: 'alt', label: 'Alt Metin', type: 'text' }
        ]
      }
    ]
  },
  {
    type: 'cta',
    label: 'Eylem Çağrısı (CTA)',
    icon: 'i-lucide-mouse-pointer-click',
    description: 'Kullanıcıyı harekete geçiren buton ve metin.',
    category: 'interactive',
    defaultContent: {
      title: 'Harekete Geçin',
      description: '',
      buttonLabel: 'Tıklayın',
      buttonUrl: '#'
    },
    schema: [
      { name: 'title', label: 'Başlık', type: 'text' },
      { name: 'description', label: 'Açıklama', type: 'textarea' },
      { name: 'buttonLabel', label: 'Buton Yazısı', type: 'text' },
      { name: 'buttonUrl', label: 'Buton Bağlantısı', type: 'url' }
    ]
  },
  {
    type: 'features',
    label: 'Özellikler',
    icon: 'i-lucide-list-checks',
    description: 'Özellik listesi veya hizmetler.',
    category: 'content',
    defaultContent: {
      items: []
    },
    schema: [
      {
        name: 'items',
        label: 'Özellikler',
        type: 'repeater',
        fields: [
          { name: 'title', label: 'Başlık', type: 'text' },
          { name: 'description', label: 'Açıklama', type: 'textarea' },
          { name: 'icon', label: 'İkon', type: 'text', placeholder: 'i-lucide-check' },
          { name: 'image', label: 'Görsel', type: 'image' }
        ]
      }
    ]
  },
  {
    type: 'cards',
    label: 'Kartlar (Grid)',
    icon: 'i-lucide-grid',
    description: 'Resim, başlık, kısa yazı ve uzun yazı içeren kart ızgarası.',
    category: 'content',
    defaultContent: {
      title: '',
      description: '',
      items: []
    },
    schema: [
      { name: 'title', label: 'Bölüm Başlığı', type: 'text' },
      { name: 'description', label: 'Bölüm Açıklaması', type: 'textarea' },
      {
        name: 'items',
        label: 'Kartlar',
        type: 'repeater',
        fields: [
          { name: 'image', label: 'Görsel URL', type: 'image' },
          { name: 'title', label: 'Kart Başlığı', type: 'text' },
          { name: 'subtitle', label: 'Alt Başlık (Kısa)', type: 'text' },
          { name: 'description', label: 'Açıklama (Uzun)', type: 'textarea' },
          { name: 'url', label: 'Bağlantı', type: 'url' },
          { name: 'buttonText', label: 'Buton Metni', type: 'text' }
        ]
      }
    ]
  },
  {
    type: 'form',
    label: 'İletişim Formu',
    icon: 'i-lucide-clipboard-list',
    description: 'Kullanıcılardan bilgi toplamak için form.',
    category: 'interactive',
    defaultContent: {
      formSlug: '',
      title: '',
      description: ''
    },
    schema: [
      { name: 'title', label: 'Form Başlığı', type: 'text' },
      { name: 'description', label: 'Açıklama', type: 'textarea' },
      { name: 'formSlug', label: 'Form Seçimi', type: 'form-selector' }
    ]
  }
]

export function usePageBuilder() {
  const customDefinitions = useState<BuilderComponentDef[]>('customComponentDefinitions', () => [])
  
  const generateDefaultContent = (schema: BuilderField[]): Record<string, any> => {
    const content: Record<string, any> = {}
    schema.forEach(field => {
      if (field.type === 'repeater') {
        content[field.name] = []
      } else if (field.type === 'boolean') {
        content[field.name] = false
      } else if (field.type === 'number') {
        content[field.name] = 0
      } else {
        content[field.name] = ''
      }
    })
    return content
  }

  const fetchDefinitions = async () => {
    try {
      const { data } = await useFetch('/api/admin/component-definitions')
      if (data.value) {
        customDefinitions.value = (data.value as any[]).map((d: any) => ({
          type: d.slug,
          label: d.name,
          icon: d.icon || 'i-lucide-box',
          description: d.description,
          category: (d.category as any) || 'other',
          defaultContent: generateDefaultContent(d.schema as BuilderField[]),
          schema: d.schema as BuilderField[]
        }))
      }
    } catch (e) {
      console.error('Failed to fetch component definitions', e)
    }
  }

  const componentDefinitions = computed(() => {
    return [...defaultComponentDefinitions, ...customDefinitions.value]
  })

  const getComponentDef = (type: string) => {
    return componentDefinitions.value.find(c => c.type === type)
  }

  const getComponentLabel = (type: string) => {
    return getComponentDef(type)?.label || type
  }

  const getComponentIcon = (type: string) => {
    return getComponentDef(type)?.icon || 'i-lucide-box'
  }

  return {
    componentDefinitions,
    getComponentDef,
    getComponentLabel,
    getComponentIcon,
    fetchDefinitions
  }
}
