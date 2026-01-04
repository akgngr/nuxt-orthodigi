import { prisma } from '../../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const definition = await prisma.componentDefinition.findUnique({
    where: { id }
  })

  if (!definition) {
    throw createError({
      statusCode: 404,
      message: 'Component definition not found'
    })
  }

  return definition
})
