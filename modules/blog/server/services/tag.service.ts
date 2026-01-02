import { prisma as db } from '~~/server/utils/prisma'

export class TagService {
  static async getAll() {
    return await db.tag.findMany({
      orderBy: { name: 'asc' }
    })
  }

  static async getById(id: string) {
    return await db.tag.findUnique({
      where: { id }
    })
  }

  static async create(data: { name: string, slug: string }) {
    return await db.tag.create({
      data
    })
  }

  static async update(id: string, data: { name?: string, slug?: string }) {
    return await db.tag.update({
      where: { id },
      data
    })
  }

  static async delete(id: string) {
    return await db.tag.delete({
      where: { id }
    })
  }
}
