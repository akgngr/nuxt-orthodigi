import { UserService } from '../../../services/user.service'

export default defineEventHandler(async (event) => {
  // await requirePermission(event, PERMISSIONS.USERS.READ)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string

    return await UserService.getAllUsers({
      page,
      limit,
      search
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users'
    })
  }
})
