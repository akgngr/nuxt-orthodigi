<script setup lang="ts">
const route = useRoute()
const { data: post, error } = await useFetch(`/api/blog/${route.params.slug}`)

if (error.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Blog post not found' })
}

useHead({
  title: post.value.titleTag,
  meta: [
    { name: 'description', content: post.value.metaDescription }
  ],
  link: [
    { rel: 'canonical', href: post.value.canonicalUrl }
  ]
})
</script>

<template>
  <div v-if="post" class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <article>
      <header class="mb-8">
        <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{{ post.h1Title }}</h1>
        <div class="flex items-center text-gray-500 text-sm">
          <span v-if="post.author">{{ post.author.name }}</span>
          <span class="mx-2">•</span>
          <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
        </div>
      </header>
      
      <div v-if="post.featuredImage" class="mb-8 rounded-lg overflow-hidden">
        <img :src="post.featuredImage" :alt="post.featuredImageAlt || post.h1Title" class="w-full h-auto object-cover" />
      </div>

      <div v-if="post.bodyText" class="prose dark:prose-invert max-w-none mb-12" v-html="post.bodyText"></div>

      <div class="space-y-12">
        <template v-for="component in post.components" :key="component.id">
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
    </article>
  </div>
</template>
