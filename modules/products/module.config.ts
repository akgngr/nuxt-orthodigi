import { defineModule } from '../../shared/types/module'

export default defineModule({
  name: 'products',
  permissions: {
    READ: 'products:read',
    WRITE: 'products:write',
    DELETE: 'products:delete'
  },
  navigation: {
    label: 'Ürünler',
    to: '/admin/urunler',
    icon: 'i-lucide-shopping-cart',
    permission: 'products:read'
  }
})
