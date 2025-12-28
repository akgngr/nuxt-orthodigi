import { RoleService } from '../../../services/role.service'

export default defineEventHandler(async (event) => {
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
