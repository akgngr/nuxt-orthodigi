import { defineModule } from '../../shared/types/module'

export default defineModule({
  name: 'blog',
  permissions: {
    READ: 'blog:read',
    WRITE: 'blog:write',
    DELETE: 'blog:delete'
  },
  navigation: {
    label: 'Blog Yazıları',
    to: '/admin/blog',
    icon: 'i-lucide-pen-tool',
    permission: 'blog:read'
  }
})
