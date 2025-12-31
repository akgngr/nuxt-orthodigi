import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requirePermission } from '../../../utils/protect'
import { PERMISSIONS } from '../../../utils/permissions'

const createPermissionSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional()
})

export default defineEventHandler(async (event) => {
    await requirePermission(event, PERMISSIONS.ROLES.WRITE)

    const body = await readBody(event)
    const result = createPermissionSchema.safeParse(body)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid input',
            data: result.error.errors
        })
    }

    try {
        return await prisma.permission.create({
            data: result.data
        })
    } catch (error) {
        console.error('Create permission error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create permission'
        })
    }
})