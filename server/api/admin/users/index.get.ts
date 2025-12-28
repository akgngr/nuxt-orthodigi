import { UserService } from '../../../services/user.service'

export default defineEventHandler(async (event) => {
    // TODO: Verify Admin Session (e.g., using a middleware or auth check here)

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
