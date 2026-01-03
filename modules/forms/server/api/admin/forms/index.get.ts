import { FormService } from '../../../services/form.service'

export default defineEventHandler(async (event) => {
  try {
    const formService = new FormService()
    const forms = await formService.getAllForms()
    
    return {
      success: true,
      data: forms
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch forms'
    })
  }
})
