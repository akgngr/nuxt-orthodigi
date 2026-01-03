import { FormService } from '../../services/form.service'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { formSlug, data } = body

    if (!formSlug || !data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form slug and data are required'
      })
    }

    const formService = new FormService()
    const form = await formService.getFormBySlug(formSlug)

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Form not found'
      })
    }

    // Get client info
    const ipAddress = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // Submit the form
    await formService.submitForm(form.id, data, ipAddress, userAgent)

    return {
      success: true,
      message: form.settings.successMessage || 'Form submitted successfully',
      redirectUrl: form.settings.redirectUrl
    }
  } catch (error) {
    // @ts-ignore
    if (error.statusCode === 400 || error.statusCode === 404) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to submit form'
    })
  }
})
