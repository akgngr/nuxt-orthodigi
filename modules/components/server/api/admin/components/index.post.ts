import { prisma as db } from '~~/server/utils/prisma'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'components:write')
  const body = await readBody(event)
  const { title, type, content, category, description } = body

  if (!title || !type || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  const component = await db.component.create({
    data: {
      title,
      type,
      content,
      category,
      description
    }
  })

  return component
})
