import { prisma as db } from '~~/server/utils/prisma'

export class CategoryService {
  static async getAll() {
    return await db.category.findMany({
      orderBy: { name: 'asc' }
    })
  }

  static async getById(id: string) {
    return await db.category.findUnique({
      where: { id }
    })
  }

  static async create(data: { name: string, slug: string, description?: string }) {
    return await db.category.create({
      data
    })
  }

  static async update(id: string, data: { name?: string, slug?: string, description?: string }) {
    return await db.category.update({
      where: { id },
      data
    })
  }

  static async delete(id: string) {
    return await db.category.delete({
      where: { id }
    })
  }
}
