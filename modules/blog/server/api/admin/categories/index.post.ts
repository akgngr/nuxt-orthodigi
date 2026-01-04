import { CategoryService } from '../../../services/category.service'
import { requirePermission } from '~~/server/utils/protect'
import { PERMISSIONS } from '~~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.BLOG.WRITE)
  const body = await readBody(event)
  return await CategoryService.create(body)
})
