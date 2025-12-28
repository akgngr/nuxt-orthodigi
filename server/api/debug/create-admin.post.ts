export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, name } = body

  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    })
  }

  try {
    // 1. Create User via Better Auth
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      }
    })

    if (!user) {
         throw new Error('Failed to create user')
    }

    // 2. Create Admin Role if not exists
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator with full access'
      }
    })

    // 3. Assign Role to User
    await prisma.userRole.create({
      data: {
        userId: user.user.id,
        roleId: adminRole.id
      }
    })
    
    return {
      success: true,
      user: user.user,
      role: adminRole
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || error,
      stack: error.stack
    }
  }
})
