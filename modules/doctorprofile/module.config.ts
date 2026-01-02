import { defineModule } from '../../shared/types/module'

export default defineModule({
  name: 'doctorprofile',
  permissions: {
    READ: 'doctorprofile:read',
    WRITE: 'doctorprofile:write',
    DELETE: 'doctorprofile:delete'
  },
  navigation: {
    label: 'Doktor Profilleri',
    to: '/admin/doctorprofile',
    icon: 'i-lucide-database',
    permission: 'doctorprofile:read'
  }
})
