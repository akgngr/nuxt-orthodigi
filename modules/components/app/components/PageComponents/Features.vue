<script setup lang="ts">
const props = defineProps<{
  items: Array<{ title: string; description: string; icon?: string }>
}>()
</script>

<template>
  <section class="py-16 bg-gray-50 dark:bg-gray-800/50">
    <div class="container px-4 mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="(item, index) in items" :key="index" class="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div v-if="item.icon" class="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400">
            <UIcon :name="item.icon" class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{{ item.title }}</h3>
          <p class="text-gray-600 dark:text-gray-400">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
