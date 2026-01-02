import { z } from 'zod'
import { RoleService } from '../../../services/role.service'
import { requirePermission } from '../../../utils/protect'
import { PERMISSIONS } from '../../../utils/permissions'

const updateRoleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ROLES.WRITE)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing ID' })

  const body = await readBody(event)
  const result = updateRoleSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input'
    })
  }

  try {
    return await RoleService.updateRole(id, result.data)
  } catch (error) {
    console.error('Update role error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update role'
    })
  }
})
