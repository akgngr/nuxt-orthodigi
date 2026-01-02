import { prisma } from '~~/server/utils/prisma'
import type { Prisma } from '~~/server/generated/prisma'

export class DoctorTestimonialService {
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
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { unvan: { contains: search, mode: 'insensitive' } },
        { testimonial: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [items, total] = await Promise.all([
      (prisma as any).doctorTestimonial.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit
      }),
      (prisma as any).doctorTestimonial.count({ where })
    ])

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    }
  }

  static async getById(id: string) {
    return await (prisma as any).doctorTestimonial.findUnique({
      where: { id }
    })
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, ...rest } = data
    return await (prisma as any).doctorTestimonial.create({
      data: rest
    })
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, ...rest } = data
    return await (prisma as any).doctorTestimonial.update({
      where: { id },
      data: rest
    })
  }

  static async delete(id: string) {
    return await (prisma as any).doctorTestimonial.delete({
      where: { id }
    })
  }
}
