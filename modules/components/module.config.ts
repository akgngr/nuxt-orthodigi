import { defineModule } from '../../shared/types/module'

export default defineModule({
  name: 'components',
  permissions: {
    READ: 'components:read',
    WRITE: 'components:write',
    DELETE: 'components:delete'
  },
  navigation: {
    label: 'Bileşenler',
    to: '/admin/components',
    icon: 'i-lucide-blocks',
    permission: 'components:read'
  }
})
