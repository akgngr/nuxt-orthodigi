import { prisma } from '../../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const existing = await prisma.componentDefinition.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Component definition not found'
    })
  }

  await prisma.componentDefinition.delete({
    where: { id }
  })

  return { success: true }
})
