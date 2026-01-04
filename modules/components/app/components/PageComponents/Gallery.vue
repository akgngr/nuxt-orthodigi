<script setup lang="ts">
const props = defineProps<{
  items: Array<{ url: string; alt?: string }>
}>()
</script>

<template>
  <section class="py-12 bg-white dark:bg-gray-900">
    <div class="container px-4 mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="(item, index) in items" :key="index" class="relative aspect-square overflow-hidden rounded-lg group">
          <img 
            :src="item.url" 
            :alt="item.alt || 'Gallery image'" 
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>
