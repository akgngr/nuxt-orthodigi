import { prisma } from '~~/server/utils/prisma'
import type { Prisma } from '~~/server/generated/prisma'

export class DoctorProfileService {
  static async getAll(params: {
    page?: number
    limit?: number
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
  } = {}) {
    const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { isim_unvan: { contains: search, mode: 'insensitive' } },
        { uzmanlik_alani: { contains: search, mode: 'insensitive' } },
        { unvan_detay: { contains: search, mode: 'insensitive' } },
        { pratisen_ozellikleri: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [items, total] = await Promise.all([
      (prisma as any).doctorProfile.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit
      }),
      (prisma as any).doctorProfile.count({ where })
    ])

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    }
  }

  static async getById(id: string) {
    return await (prisma as any).doctorProfile.findUnique({
      where: { id }
    })
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, ...rest } = data
    return await (prisma as any).doctorProfile.create({
      data: rest
    })
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, ...rest } = data
    return await (prisma as any).doctorProfile.update({
      where: { id },
      data: rest
    })
  }

  static async delete(id: string) {
    return await (prisma as any).doctorProfile.delete({
      where: { id }
    })
  }
}
