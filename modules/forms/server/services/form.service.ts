import type { FormDefinition, FormField, FormSettings } from '../../../../shared/types/form'
import { prisma } from '../../../../server/utils/prisma'

export class FormService {
  private prisma = prisma

  async getAllForms(): Promise<FormDefinition[]> {
    const forms = await this.prisma.form.findMany({
      orderBy: { createdAt: 'desc' }
    })
    // @ts-ignore
    return forms.map(form => ({
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description || undefined,
      fields: form.fields as unknown as FormField[],
      settings: form.settings as unknown as FormSettings,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }))
  }

  async getFormBySlug(slug: string): Promise<FormDefinition | null> {
    const form = await this.prisma.form.findUnique({
      where: { slug }
    })

    if (!form) return null

    return {
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description || undefined,
      fields: form.fields as unknown as FormField[],
      settings: form.settings as unknown as FormSettings,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }
  }

  async getFormById(id: string): Promise<FormDefinition | null> {
    const form = await this.prisma.form.findUnique({
      where: { id }
    })

    if (!form) return null

    return {
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description || undefined,
      fields: form.fields as unknown as FormField[],
      settings: form.settings as unknown as FormSettings,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }
  }

  async createForm(data: {
    slug: string
    title: string
    description?: string
    fields: FormField[]
    settings: FormSettings
  }): Promise<FormDefinition> {
    const form = await this.prisma.form.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        fields: data.fields as any,
        settings: data.settings as any
      }
    })

    return {
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description || undefined,
      fields: form.fields as unknown as FormField[],
      settings: form.settings as unknown as FormSettings,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }
  }

  async updateForm(id: string, data: {
    slug?: string
    title?: string
    description?: string
    fields?: FormField[]
    settings?: FormSettings
  }): Promise<FormDefinition | null> {
    const form = await this.prisma.form.update({
      where: { id },
      data: {
        ...data,
        fields: data.fields as any,
        settings: data.settings as any
      }
    })

    return {
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description || undefined,
      fields: form.fields as unknown as FormField[],
      settings: form.settings as unknown as FormSettings,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }
  }

  async deleteForm(id: string): Promise<void> {
    await this.prisma.form.delete({
      where: { id }
    })
  }

  async submitForm(formId: string, data: Record<string, any>, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.prisma.formSubmission.create({
      data: {
        formId,
        data,
        ipAddress,
        userAgent
      }
    })
  }

  async getFormSubmissions(formId: string) {
    return await this.prisma.formSubmission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' }
    })
  }
}
