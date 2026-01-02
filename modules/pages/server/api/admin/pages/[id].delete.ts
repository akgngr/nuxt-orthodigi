import { PageService } from '../../../services/page.service'
import { requirePermission } from '~~/server/utils/protect'
import { PERMISSIONS } from '~~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.PAGES.DELETE)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID missing'
    })
  }

  try {
    return await PageService.deletePage(id)
  } catch (error) {
    // console.error('Failed to delete page:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete page'
    })
  }
})
