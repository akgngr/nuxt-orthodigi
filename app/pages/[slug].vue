<script setup lang="ts">
const route = useRoute()
const { data: page, error } = await useFetch(`/api/pages/${route.params.slug}`)

if (error.value || !page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useHead({
  title: page.value.titleTag,
  meta: [
    { name: 'description', content: page.value.metaDescription },
    { rel: 'canonical', href: page.value.canonicalUrl }
  ]
})
</script>

<template>
  <div v-if="page" class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{{ page.h1Title }}</h1>
    
    <div v-if="page.bodyText" class="prose dark:prose-invert max-w-none mb-12" v-html="page.bodyText"></div>

    <div class="space-y-12">
      <template v-for="component in page.components" :key="component.id">
        <!-- Form Component -->
        <PageComponentsFormComponent 
          v-if="component.type === 'form'"
          :component="component"
        />
        
        <!-- Fallback for other components -->
        <div v-else class="hidden">
          <!-- Component {{ component.type }} not implemented -->
        </div>
      </template>
    </div>
  </div>
</template>
