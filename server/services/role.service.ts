import { prisma } from "../utils/prisma"

/**
 * RoleService handles all role and permission related database operations.
 */
export class RoleService {
    /**
     * Get all roles with permissions and user counts.
     */
    static async getAllRoles() {
        return await prisma.role.findMany({
            include: {
                permissions: true,
                _count: {
                    select: { users: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })
    }

    /**
     * Create a new role.
     */
    static async createRole(data: { name: string; description?: string; permissionIds?: string[] }) {
        return await prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
                permissions: data.permissionIds ? {
                    connect: data.permissionIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                permissions: true
            }
        })
    }

    /**
     * Update an existing role.
     */
    static async updateRole(id: string, data: { name?: string; description?: string; permissionIds?: string[] }) {
        return await prisma.role.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                permissions: data.permissionIds ? {
                    set: data.permissionIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                permissions: true
            }
        })
    }

    /**
     * Get all available permissions.
     */
    static async getAllPermissions() {
        return await prisma.permission.findMany({
            orderBy: {
                name: 'asc'
            }
        })
    }
}
