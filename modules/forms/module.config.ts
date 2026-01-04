import { defineModule } from '../../shared/types/module'

export default defineModule({
  name: 'forms',
  permissions: {
    READ: 'forms:read',
    WRITE: 'forms:write',
    DELETE: 'forms:delete'
  },
  navigation: {
    label: 'forms Yazıları',
    to: '/admin/forms',
    icon: 'i-lucide-form-input',
    permission: 'forms:read'
  } 
})
