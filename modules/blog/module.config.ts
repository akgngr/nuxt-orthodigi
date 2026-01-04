import { defineModule } from '../../shared/types/module'

export default defineModule({
  name: 'blog',
  permissions: {
    READ: 'blog:read',
    WRITE: 'blog:write',
    DELETE: 'blog:delete'
  },
  navigation: {
    label: 'Blog Yönetimi',
    icon: 'i-lucide-pen-tool',
    permission: 'blog:read',
    defaultOpen: true,
    children: [
      {
        label: 'Blog Yazıları',
        to: '/admin/blog',
        icon: 'i-lucide-file-text',
        permission: 'blog:read'
      },
      {
        label: 'Kategoriler',
        to: '/admin/categories',
        icon: 'i-lucide-list',
        permission: 'blog:read'
      },
      {
        label: 'Etiketler',
        to: '/admin/tags',
        icon: 'i-lucide-tag',
        permission: 'blog:read'
      }
    ]
  }
})
