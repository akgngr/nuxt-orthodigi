import { BlogService } from '../../../services/blog.service'
import { protect } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await protect(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' })
  return await BlogService.getById(id)
})
