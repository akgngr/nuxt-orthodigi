import { auth } from '../../utils/auth'
import { neon } from '@neondatabase/serverless'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const url = process.env.DATABASE_URL
  if (!url) return { success: false, message: 'ENV URL MISSING' }

  try {
    // Test 1: Direct Neon connection (No Prisma)
    const sql = neon(url)
    const neonTest = await sql`SELECT 1 as result`

    const query = getQuery(event)
    const email = query.email as string || 'admin@orthodigi.com'
    const password = query.password as string || '123qwe123'

    // 1. Create User via Better Auth
    const userResponse = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: 'Admin User'
      }
    })

    if (!userResponse || !userResponse.user) {
      return {
        success: false,
        message: 'User creation failed or user already exists',
        userResponse
      }
    }

    const user = userResponse.user

    // 2. Find Admin Role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    })

    if (!adminRole) {
      return {
        success: false,
        message: 'Admin role not found in database. Please run migrations or seed.',
        user
      }
    }

    // 3. Assign Admin Role to User
    const userRole = await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: adminRole.id
        }
      },
      create: {
        userId: user.id,
        roleId: adminRole.id
      },
      update: {}
    })

    return {
      success: true,
      neonTest,
      user,
      roleAssigned: userRole
    }
  } catch (e: any) {
    return {
      success: false,
      message: e.message,
      error: e
    }
  }
})
