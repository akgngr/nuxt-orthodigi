import { FormService } from '../../../services/form.service'
import type { FormDefinition } from '../../../../../../shared/types/form'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { slug, title, description, fields, settings } = body

    if (!slug || !title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug and title are required'
      })
    }

    const formService = new FormService()
    const form = await formService.createForm({
      slug,
      title,
      description,
      fields: fields || [],
      settings: settings || {}
    })

    return {
      success: true,
      data: form
    }
  } catch (error) {
    // @ts-ignore
    if (error.statusCode === 400) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create form'
    })
  }
})
