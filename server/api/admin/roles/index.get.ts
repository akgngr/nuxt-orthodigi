import { RoleService } from '../../../services/role.service'

export default defineEventHandler(async (event) => {
  // await requirePermission(event, PERMISSIONS.ROLES.READ)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string

    return await RoleService.getAllRoles({
      page,
      limit,
      search
    })
  } catch (error) {
    console.error('Fetch roles error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch roles'
    })
  }
})
