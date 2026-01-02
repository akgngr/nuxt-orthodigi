import { PageService } from '../../../services/page.service'
import { requirePermission } from '~~/server/utils/protect'
import { PERMISSIONS } from '~~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.PAGES.READ)
  const query = getQuery(event)

  try {
    return await PageService.getAllPages({
      page: query.page ? parseInt(query.page as string) : undefined,
      limit: query.limit ? parseInt(query.limit as string) : undefined,
      search: query.search as string,
      sort: query.sort as string,
      order: query.order as 'asc' | 'desc'
    })
  } catch (error) {
    // console.error('Failed to fetch pages:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch pages'
    })
  }
})
