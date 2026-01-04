<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PageComponent } from '~/shared/types/page'

const props = defineProps<{
  component: PageComponent | null
  loading?: boolean
  hideActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', content: any): void
  (e: 'cancel'): void
  (e: 'update:content', content: any): void
}>()

const localContent = ref<any>({})

watch(() => props.component, (newVal) => {
  if (newVal) {
    localContent.value = JSON.parse(JSON.stringify(newVal.content))
  } else {
    localContent.value = {}
  }
}, { immediate: true })

watch(localContent, (newVal) => {
  if (props.hideActions) {
    emit('update:content', newVal)
  }
}, { deep: true })

const { data: formsList } = await useFetch<any>('/api/admin/forms')

const onSave = () => {
  emit('save', localContent.value)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="component" class="space-y-6">
        <!-- Hero Editor -->
        <div v-if="component.type === 'hero'" class="space-y-4">
          <UFormField label="Başlık">
            <UInput v-model="localContent.title" />
          </UFormField>
          <UFormField label="Alt Başlık">
            <UTextarea v-model="localContent.subtitle" />
          </UFormField>
          <UFormField label="Görsel URL">
            <UInput v-model="localContent.image" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Buton Yazısı">
              <UInput v-model="localContent.ctaLabel" />
            </UFormField>
            <UFormField label="Buton URL">
              <UInput v-model="localContent.ctaUrl" />
            </UFormField>
          </div>
        </div>

        <!-- Text Editor -->
        <div v-else-if="component.type === 'text'" class="space-y-4">
          <UFormField label="İçerik (HTML)">
            <UTextarea v-model="localContent.body" :rows="15" />
          </UFormField>
        </div>

        <!-- CTA Editor -->
        <div v-else-if="component.type === 'cta'" class="space-y-4">
          <UFormField label="Başlık">
            <UInput v-model="localContent.title" />
          </UFormField>
          <UFormField label="Açıklama">
            <UTextarea v-model="localContent.description" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Buton Yazısı">
              <UInput v-model="localContent.buttonLabel" />
            </UFormField>
            <UFormField label="Buton URL">
              <UInput v-model="localContent.buttonUrl" />
            </UFormField>
          </div>
        </div>

        <!-- Form Editor -->
        <div v-else-if="component.type === 'form'" class="space-y-4">
          <UFormField label="Form Seçin" name="formSlug">
            <USelectMenu
              v-model="localContent.formSlug"
              :items="formsList?.data || []"
              option-attribute="title"
              value-attribute="slug"
              placeholder="Form seçiniz..."
              searchable
              searchable-placeholder="Form ara..."
            >
              <template #option="{ option }">
                <div class="flex flex-col">
                  <span class="font-medium">{{ option.title }}</span>
                  <span class="text-xs text-gray-500">{{ option.description }}</span>
                </div>
              </template>
            </USelectMenu>
          </UFormField>
          <UFormField label="Özel Başlık (Opsiyonel)" name="customTitle" help="Varsayılan form başlığını ezmek için kullanın">
            <UInput v-model="localContent.title" placeholder="İletişim Formu" />
          </UFormField>
          <UFormField label="Özel Açıklama (Opsiyonel)" name="customDescription" help="Varsayılan form açıklamasını ezmek için kullanın">
            <UInput v-model="localContent.description" placeholder="Sorularınız için bizimle iletişime geçin." />
          </UFormField>
        </div>

        <!-- Fallback -->
        <div v-else class="space-y-4">
          <p class="text-sm text-gray-500 mb-2">
            Bu bileşen türü için özel düzenleyici henüz eklenmedi. Ham JSON verisini düzenleyebilirsiniz:
          </p>
          <UTextarea
            :model-value="JSON.stringify(localContent, null, 2)"
            :rows="15"
            font-mono
            @update:model-value="val => {
              try { Object.assign(localContent, JSON.parse(val)) }
              catch (e) {}
            }"
          />
        </div>
      </div>
    </div>

    <div v-if="!hideActions" class="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
      <UButton
        label="İptal"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
      />
      <UButton
        label="Kaydet"
        color="primary"
        :loading="loading"
        @click="onSave"
      />
    </div>
  </div>
</template>
