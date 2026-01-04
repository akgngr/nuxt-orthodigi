import { prisma as db } from '~~/server/utils/prisma'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'components:delete')
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID required'
    })
  }

  await db.component.delete({
    where: { id }
  })

  return { success: true }
})
