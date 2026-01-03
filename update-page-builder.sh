#!/bin/bash

# Update componentTypes array to include form component
sed -i '' "s/  { label: 'Özellikler', value: 'features', icon: 'i-lucide-list-checks' }/  { label: 'Özellikler', value: 'features', icon: 'i-lucide-list-checks' },\n  { label: 'Form', value: 'form', icon: 'i-lucide-form-input' }/" /Users/akgngr/httpd/nuxt-orthodigi/modules/pages/app/pages/admin/pages/index.vue

# Update defaultContent object to include form default content
sed -i '' "s/      features: { items: [] }/      features: { items: [] },\n      form: { formSlug: '', layout: 'vertical', spacing: 'normal', theme: 'default' }/" /Users/akgngr/httpd/nuxt-orthodigi/modules/pages/app/pages/admin/pages/index.vue

# Add form component editor before the fallback section
sed -i '' '/<!-- Fallback for other types -->/i\
            <!-- Form Editor -->\
            <div\
              v-else-if="selectedComponent.type === 'form'"\
              class="space-y-4"\
            >\
              <PageBuilderFormComponent :component="selectedComponent" />\
            </div>\
' /Users/akgngr/httpd/nuxt-orthodigi/modules/pages/app/pages/admin/pages/index.vue