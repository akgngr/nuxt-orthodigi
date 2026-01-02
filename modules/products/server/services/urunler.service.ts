import { prisma } from '~~/server/utils/prisma'

export class UrunlerService {
  static async getAll(params: {
    page?: number
    limit?: number
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
  } = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = params

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { summery: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    }
  }

  static async getById(id: string) {
    return await prisma.product.findUnique({
      where: { id }
    })
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, ...rest } = data
    return await prisma.product.create({
      data: rest
    })
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, ...rest } = data
    return await prisma.product.update({
      where: { id },
      data: rest
    })
  }

  static async delete(id: string) {
    return await prisma.product.delete({
      where: { id }
    })
  }
}
