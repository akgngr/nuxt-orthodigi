import { defineModule } from '../../shared/types/module'

export default defineModule({
  name: 'pages',
  permissions: {
    READ: 'pages:read',
    WRITE: 'pages:write',
    DELETE: 'pages:delete'
  },
  navigation: {
    label: 'Sayfalar',
    to: '/admin/pages',
    icon: 'i-lucide-files',
    permission: 'pages:read'
  }
})
