import { prisma } from "../utils/prisma"
import { auth } from "../utils/auth"

/**
 * UserService handles all user-related database and auth operations.
 * Updated to use Better Auth.
 */
export class UserService {
    /**
     * Get all users with their roles.
     */
    static async getAllUsers() {
        const users = await prisma.user.findMany({
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return users.map((user: any) => {
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
    }

    /**
     * Create a new user in Better Auth and optionally assign a role.
     */
    static async createUser(data: { email: string; password: string; name: string; roleId?: string }) {
        try {
            const userResponse = await auth.api.signUpEmail({
                body: {
                    email: data.email,
                    password: data.password,
                    name: data.name,
                },
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
    static async updateUser(id: string, data: { name?: string; roleId?: string | null }) {
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
