<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto py-8 px-4">
      <h1 class="text-3xl font-bold text-center mb-8">Form Builder Demo</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Form Builder Admin -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Admin Panel</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Go to <NuxtLink to="/admin/forms" class="text-blue-600 hover:underline">Admin → Forms</NuxtLink> 
            to create and manage forms using the drag-and-drop form builder.
          </p>
          <UButton to="/admin/forms" color="primary">
            Open Form Builder
          </UButton>
        </div>

        <!-- Form Examples -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Example Forms</h2>
          <div class="space-y-3">
            <UButton @click="loadExampleForm('contact')" variant="outline" class="w-full">
              Contact Form
            </UButton>
            <UButton @click="loadExampleForm('newsletter')" variant="outline" class="w-full">
              Newsletter Signup
            </UButton>
            <UButton @click="loadExampleForm('appointment')" variant="outline" class="w-full">
              Appointment Request
            </UButton>
          </div>
        </div>
      </div>

      <!-- Dynamic Form Display -->
      <div v-if="selectedForm" class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4">{{ selectedForm.title }}</h2>
        <p v-if="selectedForm.description" class="text-gray-600 dark:text-gray-400 mb-6">
          {{ selectedForm.description }}
        </p>
        <DynamicForm :form-definition="selectedForm" />
      </div>

      <!-- Page Builder Integration Demo -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Page Builder Integration</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Forms can be added to any page through the page builder. Create a form in the admin panel,
          then add it to any page as a component.
        </p>
        <UButton to="/admin/pages" color="secondary">
          Open Page Builder
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormDefinition } from '~~/shared/types/form'

// Example form definitions
const exampleForms: Record<string, FormDefinition> = {
  contact: {
    id: 'contact-form',
    slug: 'contact-form',
    title: 'Contact Us',
    description: 'Get in touch with us for any questions or inquiries.',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        order: 0
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your@email.com',
        required: true,
        order: 1
      },
      {
        id: 'phone',
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: false,
        order: 2
      },
      {
        id: 'subject',
        type: 'select',
        label: 'Subject',
        placeholder: 'Select a subject',
        required: true,
        options: [
          { label: 'General Inquiry', value: 'general' },
          { label: 'Support', value: 'support' },
          { label: 'Partnership', value: 'partnership' },
          { label: 'Other', value: 'other' }
        ],
        order: 3
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Tell us how we can help you...',
        required: true,
        order: 4
      },
      {
        id: 'submit',
        type: 'submit',
        label: 'Send Message',
        order: 5
      }
    ],
    settings: {
      successMessage: 'Thank you for your message! We\'ll get back to you soon.',
      redirectUrl: '',
      submissionBehavior: 'message'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  newsletter: {
    id: 'newsletter-form',
    slug: 'newsletter-signup',
    title: 'Newsletter Signup',
    description: 'Stay updated with our latest news and offers.',
    fields: [
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your@email.com',
        required: true,
        order: 0
      },
      {
        id: 'consent',
        type: 'checkbox',
        label: 'I agree to receive newsletter emails',
        required: true,
        order: 1
      },
      {
        id: 'submit',
        type: 'submit',
        label: 'Subscribe',
        order: 2
      }
    ],
    settings: {
      successMessage: 'Thank you for subscribing to our newsletter!',
      redirectUrl: '',
      submissionBehavior: 'message'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  appointment: {
    id: 'appointment-form',
    slug: 'appointment-request',
    title: 'Request an Appointment',
    description: 'Schedule your appointment with our team.',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        order: 0
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your@email.com',
        required: true,
        order: 1
      },
      {
        id: 'phone',
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true,
        order: 2
      },
      {
        id: 'date',
        type: 'date',
        label: 'Preferred Date',
        required: true,
        order: 3
      },
      {
        id: 'service',
        type: 'select',
        label: 'Service Type',
        placeholder: 'Select a service',
        required: true,
        options: [
          { label: 'General Checkup', value: 'checkup' },
          { label: 'Consultation', value: 'consultation' },
          { label: 'Treatment', value: 'treatment' },
          { label: 'Follow-up', value: 'followup' }
        ],
        order: 4
      },
      {
        id: 'notes',
        type: 'textarea',
        label: 'Additional Notes',
        placeholder: 'Any specific requirements or questions...',
        required: false,
        order: 5
      },
      {
        id: 'submit',
        type: 'submit',
        label: 'Request Appointment',
        order: 6
      }
    ],
    settings: {
      successMessage: 'Thank you for your appointment request! We\'ll contact you soon to confirm.',
      redirectUrl: '',
      submissionBehavior: 'message'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const selectedForm = ref<FormDefinition | null>(null)

const loadExampleForm = (type: string) => {
  selectedForm.value = exampleForms[type] || null
}

// SEO
useSeoMeta({
  title: 'Form Builder Demo - OrthoDigi',
  description: 'Experience our drag-and-drop form builder system with live examples.'
})
</script>