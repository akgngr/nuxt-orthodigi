import { prisma } from '../utils/prisma';

export class UrunlerService {
  static async getAll() {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: string) {
    return await prisma.product.findUnique({
      where: { id }
    });
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, ...rest } = data;
    return await prisma.product.create({
      data: rest
    });
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, ...rest } = data;
    return await prisma.product.update({
      where: { id },
      data: rest
    });
  }

  static async delete(id: string) {
    return await prisma.product.delete({
      where: { id }
    });
  }
}
