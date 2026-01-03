import { FormService } from '../../../services/form.service'

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
    await formService.deleteForm(id)

    return {
      success: true,
      message: 'Form deleted successfully'
    }
  } catch (error) {
    const err = error as { statusCode?: number }
    if (err.statusCode === 400) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete form'
    })
  }
})
