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
    icon: 'i-lucide-blocks',
    permission: 'components:read',
    children: [
      {
        label: 'Kayıtlı Bileşenler',
        to: '/admin/components',
        icon: 'i-lucide-box'
      },
      {
        label: 'Bileşen Oluşturucu',
        to: '/admin/components/builder',
        icon: 'i-lucide-hammer'
      }
    ]
  }
})
