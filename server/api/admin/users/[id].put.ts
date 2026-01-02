import { z } from 'zod'
import { UserService } from '../../../services/user.service'

const updateUserSchema = z.object({
  name: z.string().optional(),
  roleId: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user ID' })
  }

  const body = await readBody(event)
  const result = updateUserSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input'
    })
  }

  try {
    return await UserService.updateUser(id, result.data)
  } catch (e: any) {
    console.error('Update user failed:', e)
    throw createError({
      statusCode: 500,
      statusMessage: e.message || 'Failed to update user'
    })
  }
})
