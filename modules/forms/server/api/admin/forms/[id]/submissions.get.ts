import { FormService } from '../../../../services/form.service'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form ID is required'
      })
    }

    const formService = new FormService()
    const submissions = await formService.getFormSubmissions(id)

    return {
      success: true,
      data: submissions
    }
  } catch (error: any) {
    if (error.statusCode === 400) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch submissions'
    })
  }
})
