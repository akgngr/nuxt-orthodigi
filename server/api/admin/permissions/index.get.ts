import { RoleService } from '../../../services/role.service'

export default defineEventHandler(async (event) => {
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
