import { prisma } from '../utils/prisma'
import { auth } from '../utils/auth'

/**
 * UserService handles all user-related database and auth operations.
 * Updated to use Better Auth.
 */
export class UserService {
  /**
     * Get all users with their roles with pagination.
     */
  static async getAllUsers(params: {
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
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    const items = users.map((user: any) => {
      const roleAssignment = user.roles[0]
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: roleAssignment?.role || null,
        roleId: roleAssignment?.roleId || null
      }
    })

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    }
  }

  /**
     * Create a new user in Better Auth and optionally assign a role.
     */
  static async createUser(data: { email: string, password: string, name: string, roleId?: string }) {
    try {
      const userResponse = await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: data.name
        }
      })

      const newUser = userResponse.user
      if (!newUser) {
        throw new Error('User creation failed or no data returned')
      }

      if (data.roleId) {
        await prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: data.roleId
          }
        })
      }

      return newUser
    } catch (e: any) {
      throw new Error(e.message || 'Failed to create user in Auth provider')
    }
  }

  /**
     * Update an existing user's profile and role.
     */
  static async updateUser(id: string, data: { name?: string, roleId?: string | null }) {
    if (data.name) {
      await prisma.user.update({
        where: { id },
        data: { name: data.name }
      })
    }

    if (data.roleId !== undefined) {
      // Remove existing roles
      await prisma.userRole.deleteMany({
        where: { userId: id }
      })

      if (data.roleId !== null) {
        await prisma.userRole.create({
          data: {
            userId: id,
            roleId: data.roleId
          }
        })
      }
    }

    return { success: true }
  }
}
