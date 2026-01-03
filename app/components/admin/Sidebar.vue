<script setup lang="ts">
import { navigationItems as items, type NavigationItem } from '~/constants/navigation'
import { useAuth } from '~/composables/useAuth'

const { hasPermission } = useAuth()

/**
 * Filter navigation items based on user permissions.
 * If an item has no permission requirement, it's shown.
 * If it has children, it's shown if at least one child is visible.
 */
function filterItems(items: NavigationItem[]): NavigationItem[] {
  return items.reduce((acc: NavigationItem[], item) => {
    // If it's a label, keep it for now (we'll filter empty sections later)
    if (item.type === 'label') {
      acc.push(item)
      return acc
    }

    // Check children first
    const filteredChildren = item.children ? filterItems(item.children) : undefined

    // Check permission for the item itself
    const isVisible = !item.permission || hasPermission(item.permission)

    if (isVisible || (filteredChildren && filteredChildren.length > 0)) {
      acc.push({
        ...item,
        children: filteredChildren
      })
    }

    return acc
  }, [])
}

// Filter the nested array structure of navigationItems
const filteredNavigationItems = computed(() => {
  return items.map((group) => {
    const filteredGroup = filterItems(group)
    // Remove labels if they are the only thing left in the group
    if (filteredGroup.length === 1 && filteredGroup[0]?.type === 'label') {
      return []
    }
    return filteredGroup
  }).filter(group => group.length > 0)
})
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
          <UIcon
            name="i-lucide-stethoscope"
            class="w-6 h-6"
          />
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
          :items="filteredNavigationItems"
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
          to="/login"
        />
      </div>
    </template>
  </UDashboardSidebar>
</template>
