import { defineModule } from '../../shared/types/module'

export default defineModule({
  name: 'doctortestimonial',
  permissions: {
    READ: 'doctortestimonial:read',
    WRITE: 'doctortestimonial:write',
    DELETE: 'doctortestimonial:delete'
  },
  navigation: {
    label: 'Doktor Yorumları',
    to: '/admin/doctortestimonial',
    icon: 'i-lucide-message-square',
    permission: 'doctortestimonial:read'
  }
})
