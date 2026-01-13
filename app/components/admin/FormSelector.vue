<script setup lang="ts">
const { data: forms, pending } = await useFetch<any>('/api/admin/forms')

const model = defineModel()
</script>

<template>
  <USelectMenu
    v-model="model"
    :options="forms?.items || []"
    value-attribute="slug"
    option-attribute="name"
    :loading="pending"
    placeholder="Bir form seçin"
  />
</template>
