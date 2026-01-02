import { PageService } from '../../../../../services/page.service'

export default defineEventHandler(async (event) => {
  // Check authentication (middleware should handle this, but for safety)
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Page ID is required'
    })
  }

  const body = await readBody(event)

  try {
    return await PageService.addComponent(id, body)
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
