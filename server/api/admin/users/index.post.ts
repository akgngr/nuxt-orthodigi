import { z } from 'zod'
import { UserService } from '../../../services/user.service'
import { requirePermission } from '../../../utils/protect'
import { PERMISSIONS } from '../../../utils/permissions'

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    roleId: z.string().optional()
})

export default defineEventHandler(async (event) => {
    // await requirePermission(event, PERMISSIONS.USERS.WRITE)

    const body = await readBody(event)
    const result = createUserSchema.safeParse(body)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid input',
            data: result.error.errors
        })
    }

    try {
        return await UserService.createUser(result.data)
    } catch (e: any) {
        console.error('Create user failed:', e)
        throw createError({
            statusCode: 400,
            statusMessage: e.message || 'Failed to create user'
        })
    }
})
