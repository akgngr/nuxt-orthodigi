import { prisma as db } from '~~/server/utils/prisma'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'components:write')
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID required'
    })
  }

  const component = await db.component.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      category: body.category,
      description: body.description
    }
  })

  return component
})
