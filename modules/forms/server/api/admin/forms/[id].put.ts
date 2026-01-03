import { FormService } from '../../../services/form.service'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form ID is required'
      })
    }

    const formService = new FormService()
    const form = await formService.updateForm(id, body)

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
    const err = error as { statusCode?: number }
    if (err.statusCode === 400 || err.statusCode === 404) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update form'
    })
  }
})
