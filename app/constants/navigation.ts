import { allNavigation } from '~~/shared/registry'
import type { NavigationItem } from '~~/shared/types/navigation'

export { type NavigationItem }

export const navigationItems: NavigationItem[][] = [
  [
    {
      label: 'Ana Sayfa',
      icon: 'i-lucide-home',
      to: '/admin',
      permission: 'dashboard:read'
    }
  ],
  [
    {
      label: 'Yönetim',
      type: 'label'
    },
    {
      label: 'Kullanıcı Yönetimi',
      icon: 'i-lucide-users',
      defaultOpen: true,
      permission: 'users:read',
      children: [
        {
          label: 'Kullanıcılar',
          to: '/admin/users/users',
          icon: 'i-lucide-user',
          permission: 'users:read'
        },
        {
          label: 'Roller',
          to: '/admin/users/roles',
          icon: 'i-lucide-shield',
          permission: 'roles:read'
        },
        {
          label: 'İzinler',
          to: '/admin/users/permissions',
          icon: 'i-lucide-key',
          permission: 'roles:read'
        }
      ]
    },
    {
      label: 'İçerik Yönetimi',
      icon: 'i-lucide-file-text',
      defaultOpen: true,
      children: [
        ...allNavigation,
        
      ]
    },
    /**
     {
      label: 'Randevular',
      icon: 'i-lucide-calendar',
      to: '/admin/appointments',
      permission: 'appointments:read'
    },
    {
      label: 'Mesajlar',
      icon: 'i-lucide-mail',
      to: '/admin/messages',
      badge: '12',
      permission: 'messages:read'
    }
     */
  ],
  /**
   [
    {
      label: 'Sistem',
      type: 'label'
    },
    {
      label: 'Ayarlar',
      icon: 'i-lucide-settings',
      to: '/admin/settings',
      permission: 'settings:read'
    },
    {
      label: 'Raporlar',
      icon: 'i-lucide-bar-chart',
      to: '/admin/reports',
      permission: 'reports:read'
    }
  ]
   */
]