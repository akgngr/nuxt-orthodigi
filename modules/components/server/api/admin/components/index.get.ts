import { prisma as db } from '~~/server/utils/prisma'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'components:read')
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const search = query.search as string
  
  const skip = (page - 1) * limit

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { type: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [items, total] = await Promise.all([
    db.component.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.component.count({ where })
  ])

  return {
    items,
    total,
    pages: Math.ceil(total / limit)
  }
})
