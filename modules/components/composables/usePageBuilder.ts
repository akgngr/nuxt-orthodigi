import { ref } from 'vue'

export interface BuilderComponentDef {
  type: string
  label: string
  icon: string
  description?: string
  defaultContent: Record<string, any>
  category?: 'content' | 'layout' | 'media' | 'interactive'
}

export const componentDefinitions: BuilderComponentDef[] = [
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
    }
  },
  {
    type: 'text',
    label: 'Metin Bloğu',
    icon: 'i-lucide-align-left',
    description: 'Zengin metin içeriği.',
    category: 'content',
    defaultContent: {
      body: '<p>Metin içeriği buraya gelecek...</p>'
    }
  },
  {
    type: 'gallery',
    label: 'Galeri',
    icon: 'i-lucide-image',
    description: 'Görsel galerisi.',
    category: 'media',
    defaultContent: {
      items: []
    }
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
    }
  },
  {
    type: 'features',
    label: 'Özellikler',
    icon: 'i-lucide-list-checks',
    description: 'Özellik listesi veya hizmetler.',
    category: 'content',
    defaultContent: {
      items: []
    }
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
    }
  }
]

export function usePageBuilder() {
  const getComponentDef = (type: string) => {
    return componentDefinitions.find(c => c.type === type)
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
    getComponentIcon
  }
}
