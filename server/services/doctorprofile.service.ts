import { prisma } from '../utils/prisma';
import type { Prisma } from '@prisma/client';

export class DoctorProfileService {
  static async getAll() {
    return await (prisma as any).doctorProfile.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: string) {
    return await (prisma as any).doctorProfile.findUnique({
      where: { id }
    });
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, ...rest } = data;
    return await (prisma as any).doctorProfile.create({
      data: rest
    });
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, ...rest } = data;
    return await (prisma as any).doctorProfile.update({
      where: { id },
      data: rest
    });
  }

  static async delete(id: string) {
    return await (prisma as any).doctorProfile.delete({
      where: { id }
    });
  }
}
