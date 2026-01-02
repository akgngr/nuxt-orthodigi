import { BlogService } from '../../../services/blog.service'
import { requirePermission } from '~~/server/utils/protect'
import { PERMISSIONS } from '~~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.BLOG.READ)
  const query = getQuery(event)
  return await BlogService.getAll({
    page: query.page ? parseInt(query.page as string) : undefined,
    limit: query.limit ? parseInt(query.limit as string) : undefined,
    search: query.search as string,
    sort: query.sort as string,
    order: query.order as 'asc' | 'desc'
  })
})
