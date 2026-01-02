<script setup lang="ts">
const { logout } = useAuth()

const items = [
  [{
    label: 'Profil',
    icon: 'i-lucide-user',
    to: '/admin/profile'
  }, {
    label: 'Ayarlar',
    icon: 'i-lucide-settings',
    to: '/admin/settings'
  }],
  [{
    label: 'Çıkış',
    icon: 'i-lucide-log-out',
    color: 'error' as const,
    onSelect: () => logout()
  }]
]
</script>

<template>
  <UDashboardNavbar
    class="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm"
    :ui="{
      root: 'h-(--ui-header-height)'
    }"
  >
    <template #leading>
      <div class="flex items-center gap-3">
        <UDashboardSidebarToggle class="lg:hidden" />
        <slot name="leading" />
      </div>
    </template>

    <template #default>
      <slot />
    </template>

    <template #right>
      <div class="flex items-center gap-3">
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100/30 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500/50">
          <UIcon
            name="i-lucide-search"
            class="w-4 h-4 text-gray-400"
          />
          <UInput
            placeholder="Ara..."
            variant="none"
            size="sm"
            class="w-48 bg-transparent border-none p-0 focus:ring-0 text-sm"
          />
          <UKbd
            value="meta"
            variant="subtle"
            size="sm"
          />
          <UKbd
            value="k"
            variant="subtle"
            size="sm"
          />
        </div>

        <slot name="trailing" />

        <div class="flex items-end gap-1.5 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/20 dark:border-gray-700/20">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-bell"
            class="rounded-xl hover:bg-white dark:hover:bg-gray-900 shadow-none transition-all"
          />

          <ColorModeButton class="rounded-xl hover:bg-white dark:hover:bg-gray-900 shadow-none transition-all" />
        </div>

        <UDropdownMenu
          :items="items"
          :content="{ align: 'end' }"
          :ui="{ content: 'rounded-2xl p-2' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            class="flex items-center gap-2 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-900 hover:shadow-md transition-all duration-300"
          >
            <UAvatar
              src="https://github.com/benjamincanac.png"
              alt="Admin"
              size="sm"
              class="border border-white dark:border-gray-800 shadow-sm"
            />
            <UIcon
              name="i-lucide-chevron-down"
              class="w-4 h-4 text-gray-400"
            />
          </UButton>
        </UDropdownMenu>
      </div>
    </template>
  </UDashboardNavbar>
</template>
