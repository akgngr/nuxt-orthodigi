import { prisma } from '../../../../server/utils/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  schema: z.array(z.any()).optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
      data: result.error.format
    })
  }

  const existing = await prisma.componentDefinition.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Component definition not found'
    })
  }

  // If slug is changing, check for collision
  if (result.data.slug && result.data.slug !== existing.slug) {
    const collision = await prisma.componentDefinition.findUnique({
      where: { slug: result.data.slug }
    })
    if (collision) {
      throw createError({
        statusCode: 409,
        message: 'Slug already in use'
      })
    }
  }

  const updated = await prisma.componentDefinition.update({
    where: { id },
    data: result.data
  })

  return updated
})
