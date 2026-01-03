export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'hidden' | 'submit' | 'file'
  label: string
  description?: string
  hint?: string
  help?: string
  placeholder?: string
  required?: boolean
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  defaultValue?: string | number | boolean
  options?: Array<{
    label: string
    value: string
  }>
  className?: string
  order: number
}

export interface FormSettings {
  successMessage?: string
  redirectUrl?: string
  submissionBehavior?: 'message' | 'redirect' | 'webhook'
  webhookUrl?: string
  emailNotifications?: string[]
  spamProtection?: {
    enabled: boolean
    honeypot?: boolean
    recaptcha?: boolean
  }
}

export interface FormDefinition {
  id: string
  slug: string
  title: string
  description?: string
  fields: FormField[]
  settings: FormSettings
  createdAt: Date
  updatedAt: Date
}

export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface FormComponentData {
  formSlug: string
  layout?: 'vertical' | 'horizontal'
  spacing?: 'compact' | 'normal' | 'relaxed'
  theme?: 'default' | 'primary' | 'secondary'
}