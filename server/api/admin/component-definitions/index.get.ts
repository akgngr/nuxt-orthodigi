import { prisma } from '../../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const definitions = await prisma.componentDefinition.findMany({
    orderBy: {
      name: 'asc'
    }
  })
  return definitions
})
