<script setup lang="ts">
const items = [
  [
    {
      label: 'Ana Sayfa',
      icon: 'i-lucide-home',
      to: '/admin'
    },
    {
      label: 'Görünüm',
      icon: 'i-lucide-layout-dashboard',
      to: '/admin'
    }
  ],
  [
    {
      label: 'Yönetim',
      type: 'label'
    },
    {
      label: 'Kullanıcılar',
      icon: 'i-lucide-users',
      to: '/admin/users'
    },
    {
      label: 'Roller',
      icon: 'i-lucide-shield',
      to: '/admin/roles'
    },
    {
      label: 'Roller',
      icon: 'i-lucide-shield',
      to: '/admin/roles'
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
    :ui="{ root: 'flex flex-col' }"
    class="bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800"
  >
    <template #header>
      <div class="flex items-center gap-3 px-2 py-1">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
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
        >
          <template #item="{ item, active }">
            <template v-if="item.type === 'label'">
              <div class="px-3 py-2 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {{ item.label }}
              </div>
            </template>
            <ULink
              v-else
              :to="item.to"
              :class="[active ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50']"
              class="group flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-xl transition-all duration-300 relative overflow-hidden"
            >
              <div v-if="active" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full" />
              <UIcon :name="item.icon" class="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
              <span class="truncate flex-1">{{ item.label }}</span>
              <UBadge v-if="item.badge" size="sm" variant="subtle" color="primary" class="rounded-full px-1.5 py-0">
                {{ item.badge }}
              </UBadge>
            </ULink>
          </template>
        </UNavigationMenu>
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
