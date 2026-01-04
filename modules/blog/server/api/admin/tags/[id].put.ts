import { TagService } from '../../../services/tag.service'
import { requirePermission } from '~~/server/utils/protect'
import { PERMISSIONS } from '~~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.BLOG.WRITE)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' })
  const body = await readBody(event)
  return await TagService.update(id, body)
})
