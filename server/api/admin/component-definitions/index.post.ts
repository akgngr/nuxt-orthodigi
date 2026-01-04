import { prisma } from '../../../../server/utils/prisma'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  icon: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  schema: z.array(z.any())
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = createSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
      data: result.error.errors
    })
  }

  const { name, slug, icon, description, category, schema } = result.data

  // Check if slug exists
  const existing = await prisma.componentDefinition.findUnique({
    where: { slug }
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      message: 'Component with this slug already exists'
    })
  }

  const definition = await prisma.componentDefinition.create({
    data: {
      name,
      slug,
      icon,
      description,
      category,
      schema
    }
  })

  return definition
})
