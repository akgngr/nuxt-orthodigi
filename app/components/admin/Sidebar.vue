<script setup lang="ts">
const items = [
  [
    {
      label: 'Ana Sayfa',
      icon: 'i-lucide-home',
      to: '/admin'
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
      children: [
        {
          label: 'Kullanıcılar',
          to: '/admin/users/users',
          icon: 'i-lucide-user'
        },
        {
          label: 'Roller',
          to: '/admin/users/roles',
          icon: 'i-lucide-shield'
        },
        {
          label: 'İzinler',
          to: '/admin/users/permissions',
          icon: 'i-lucide-key'
        }
      ]
    },
    {
      label: 'İçerik Yönetimi',
      icon: 'i-lucide-file-text',
      defaultOpen: true,
      children: [
        {
          label: 'Sayfalar',
          to: '/admin/pages',
          icon: 'i-lucide-files'
        },
        {
          label: 'Blog Yazıları',
          to: '/admin/blog',
          icon: 'i-lucide-pen-tool'
        },
        {
          label: 'Ürünler',
          to: '/admin/urunler',
          icon: 'i-lucide-shopping-cart'
        }
      ]
    },
    {
      label: 'Randevular',
      icon: 'i-lucide-calendar',
      to: '/admin/appointments'
    },
    {
      label: 'Mesajlar',
      icon: 'i-lucide-mail',
      to: '/admin/messages',
      badge: '12'
    }
  ],
  [
    {
      label: 'Sistem',
      type: 'label'
    },
    {
      label: 'Ayarlar',
      icon: 'i-lucide-settings',
      to: '/admin/settings'
    },
    {
      label: 'Raporlar',
      icon: 'i-lucide-bar-chart',
      to: '/admin/reports'
    }
  ]
]
</script>

<template>
  <UDashboardSidebar
    resizable
    collapsible
    class="bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col"
  >
    <template #header>
      <div class="flex items-center gap-3 px-2 py-1">
        <div class="w-9 h-9 rounded-xl bg-linear-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <UIcon name="i-lucide-stethoscope" class="w-6 h-6" />
        </div>
        <div class="flex flex-col">
          <span class="font-black text-lg leading-none tracking-tight text-gray-900 dark:text-white uppercase italic">OrthoDigi</span>
          <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin Panel</span>
        </div>
      </div>
    </template>

    <template #default>
      <div class="flex-1 overflow-y-auto py-4">
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="px-2"
          accordion
          :ui="{
            root: 'space-y-1',
            link: 'group flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-xl transition-all duration-300 relative overflow-hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 aria-[current=page]:bg-primary-50 aria-[current=page]:text-primary-600 aria-[current=page]:dark:bg-primary-950/50 aria-[current=page]:dark:text-primary-400 aria-[current=page]:font-bold aria-[current=page]:shadow-sm',
            linkLeadingIcon: 'w-5 h-5 shrink-0 transition-transform group-hover:scale-110 text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200 aria-[current=page]:text-primary-600 aria-[current=page]:dark:text-primary-400'
          }"
        />
      </div>
    </template>

    <template #footer>
      <div class="p-4 border-t border-gray-100 dark:border-gray-800">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-log-out"
          block
          class="rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-all font-bold"
          label="Çıkış Yap"
          to="/admin/login"
        />
      </div>
    </template>
  </UDashboardSidebar>
</template>
