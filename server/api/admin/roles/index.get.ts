import { RoleService } from '../../../services/role.service'
import { requirePermission } from '../../../utils/protect'
import { PERMISSIONS } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
    // await requirePermission(event, PERMISSIONS.ROLES.READ)

    try {
        return await RoleService.getAllRoles()
    } catch (error) {
        console.error('Fetch roles error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch roles'
        })
    }
})
