import { FormService } from '../../services/form.service'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form slug is required'
      })
    }

    const formService = new FormService()
    const form = await formService.getFormBySlug(slug)

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Form not found'
      })
    }

    return {
      success: true,
      data: form
    }
  } catch (error) {
    // @ts-ignore
    if (error.statusCode === 400 || error.statusCode === 404) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch form'
    })
  }
})
