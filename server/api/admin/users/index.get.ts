import { UserService } from '../../../services/user.service'
import { requirePermission } from '../../../utils/protect'
import { PERMISSIONS } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
    // await requirePermission(event, PERMISSIONS.USERS.READ)

    try {
        return await UserService.getAllUsers()
    } catch (error) {
        console.error('Failed to fetch users:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch users'
        })
    }
})
