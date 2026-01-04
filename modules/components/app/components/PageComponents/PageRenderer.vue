<script setup lang="ts">
import Hero from './Hero.vue'
import Text from './Text.vue'
import Cta from './Cta.vue'
import Gallery from './Gallery.vue'
import Features from './Features.vue'
import FormComponent from './FormComponent.vue'

const props = defineProps<{
  content: Array<{ type: string; content: any; id?: string }> | null
}>()

const components: Record<string, any> = {
  hero: Hero,
  text: Text,
  cta: Cta,
  gallery: Gallery,
  features: Features,
  form: FormComponent
}
</script>

<template>
  <div>
    <template v-if="content && content.length > 0">
      <div v-for="(block, index) in content" :key="block.id || index">
        <component 
          :is="components[block.type]" 
          v-if="components[block.type]" 
          v-bind="block.content" 
        />
        <div v-else class="py-4 text-center text-gray-500 bg-gray-50">
          Bilinmeyen bileşen tipi: {{ block.type }}
        </div>
      </div>
    </template>
  </div>
</template>
