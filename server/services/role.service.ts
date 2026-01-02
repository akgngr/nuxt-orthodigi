import { prisma } from '../utils/prisma'

/**
 * RoleService handles all role and permission related database operations.
 */
export class RoleService {
  /**
     * Get all roles with permissions and user counts with pagination.
     */
  static async getAllRoles(params: {
    page?: number
    limit?: number
    search?: string
  } = {}) {
    const { page = 1, limit = 10, search } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [items, total] = await Promise.all([
      prisma.role.findMany({
        where,
        include: {
          permissions: true,
          _count: {
            select: { users: true }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.role.count({ where })
    ])

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    }
  }

  /**
     * Create a new role.
     */
  static async createRole(data: { name: string, description?: string, permissionIds?: string[] }) {
    return await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds
          ? {
              connect: data.permissionIds.map(id => ({ id }))
            }
          : undefined
      },
      include: {
        permissions: true
      }
    })
  }

  /**
     * Update an existing role.
     */
  static async updateRole(id: string, data: { name?: string, description?: string, permissionIds?: string[] }) {
    return await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds
          ? {
              set: data.permissionIds.map(id => ({ id }))
            }
          : undefined
      },
      include: {
        permissions: true
      }
    })
  }

  /**
     * Get all available permissions with pagination.
     */
  static async getAllPermissions(params: {
    page?: number
    limit?: number
    search?: string
  } = {}) {
    const { page = 1, limit = 10, search } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [items, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.permission.count({ where })
    ])

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}
