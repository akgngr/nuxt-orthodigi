import { auth } from './auth'
import { hasPermission } from './permissions'
import type { H3Event } from 'h3'

export async function requireUser(event: H3Event) {
  const session = await auth.api.getSession({
    headers: event.headers
  })

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return session.user
}

/**
 * Basic authentication check - Alias for requireUser
 */
export async function protect(event: H3Event) {
  return await requireUser(event)
}

export default protect

export async function requirePermission(event: H3Event, permission: string) {
  const user = await requireUser(event)
  const allowed = await hasPermission(user.id, permission)

  if (!allowed) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Missing permission ' + permission
    })
  }

  return user
}
