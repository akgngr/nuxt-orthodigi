import { RoleService } from '../../../services/role.service'
import { requirePermission } from '../../../utils/protect'
import { PERMISSIONS } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
    // await requirePermission(event, PERMISSIONS.ROLES.READ)

    try {
        return await RoleService.getAllPermissions()
    } catch (error) {
        console.error('Fetch permissions error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch permissions'
        })
    }
})