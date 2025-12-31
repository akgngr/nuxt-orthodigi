import { prisma } from '../utils/prisma';
import type { Prisma } from '@prisma/client';

export class DoctorTestimonialService {
  static async getAll() {
    return await (prisma as any).doctortestimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: string) {
    return await (prisma as any).doctortestimonial.findUnique({
      where: { id }
    });
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, ...rest } = data;
    return await (prisma as any).doctortestimonial.create({
      data: rest
    });
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, ...rest } = data;
    return await (prisma as any).doctortestimonial.update({
      where: { id },
      data: rest
    });
  }

  static async delete(id: string) {
    return await (prisma as any).doctortestimonial.delete({
      where: { id }
    });
  }
}
