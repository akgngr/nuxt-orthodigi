import { requireUser } from '../../utils/protect'
import { getUserPermissions } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  console.log('[API] /api/auth/permissions called')
  try {
    const user = await requireUser(event)
    console.log('[API] User found:', user.email)

    const permissions = await getUserPermissions(user.id)
    console.log('[API] Permissions found:', permissions)

    return { permissions }
  } catch (error) {
    console.error('[API] Error fetching permissions:', error)
    throw error
  }
})
