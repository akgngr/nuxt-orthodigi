import { BlogService } from '../../../../../services/blog.service'
import { protect } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await protect(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Blog ID is required'
    })
  }

  const body = await readBody(event)

  try {
    return await BlogService.addComponent(id, body)
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
