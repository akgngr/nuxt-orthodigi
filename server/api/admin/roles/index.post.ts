import { z } from 'zod'
import { RoleService } from '../../../services/role.service'

const createRoleSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    permissionIds: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const result = createRoleSchema.safeParse(body)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid input'
        })
    }

    try {
        return await RoleService.createRole(result.data)
    } catch (error) {
        console.error('Create role error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create role'
        })
    }
})
