import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requirePermission } from '../../../utils/protect'
import { PERMISSIONS } from '../../../utils/permissions'

const updatePermissionSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ROLES.WRITE)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing permission ID' })

  const body = await readBody(event)
  const result = updatePermissionSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input'
    })
  }

  try {
    const data: any = { ...result.data }
    
    // Handle name split if present
    if (data.name) {
      const [resource, action] = data.name.split(':')
      if (resource && action) {
        data.resource = resource.toLowerCase()
        data.action = action.toLowerCase()
      }
      delete data.name
    }

    return await prisma.permission.update({
      where: { id },
      data
    })
  } catch (error) {
    console.error('Update permission error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update permission'
    })
  }
})
