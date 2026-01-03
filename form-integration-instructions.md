<!-- Form Component Integration -->
<!-- Add this to the componentTypes array around line 384 -->
{ label: 'Form', value: 'form', icon: 'i-lucide-form-input' }

<!-- Add this to the defaultContent object around line 396 -->
form: { formSlug: '', layout: 'vertical', spacing: 'normal', theme: 'default' }

<!-- Add this before the fallback section around line 1066 -->
<!-- Form Editor -->
<div
  v-else-if="selectedComponent.type === 'form'"
  class="space-y-4"
>
  <PageBuilderFormComponent :component="selectedComponent" />
</div>