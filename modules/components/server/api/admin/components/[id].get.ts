import { prisma as db } from '~~/server/utils/prisma'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'components:read')
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID required'
    })
  }

  const component = await db.component.findUnique({
    where: { id }
  })

  if (!component) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Component not found'
    })
  }

  return component
})
