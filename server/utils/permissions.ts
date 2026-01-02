import { prisma } from './prisma'
import { allPermissions } from '~~/shared/registry'

/**
 * Modular Permission System
 * Allows defining and grouping permissions by module.
 */

type PermissionMap = {
  [action: string]: string
}

type ModulePermissions = {
  [module: string]: PermissionMap
}

// Internal registry
const _permissions: ModulePermissions = {}

/**
 * Defines and registers permissions for a module
 */
export function definePermissions<T extends PermissionMap>(moduleName: string, actions: T): T {
  _permissions[moduleName] = actions
  return actions
}

// Core Modules
export const PERMISSIONS = {
  USERS: definePermissions('USERS', {
    READ: 'users:read',
    WRITE: 'users:write',
    DELETE: 'users:delete'
  }),
  ROLES: definePermissions('ROLES', {
    READ: 'roles:read',
    WRITE: 'roles:write',
    DELETE: 'roles:delete'
  }),
  DASHBOARD: definePermissions('DASHBOARD', {
    READ: 'dashboard:read'
  }),
  PAGES: definePermissions('PAGES', {
    READ: 'pages:read',
    WRITE: 'pages:write',
    DELETE: 'pages:delete'
  }),
  BLOG: definePermissions('BLOG', {
    READ: 'blog:read',
    WRITE: 'blog:write',
    DELETE: 'blog:delete'
  }),
  PRODUCTS: definePermissions('PRODUCTS', {
    READ: 'products:read',
    WRITE: 'products:write',
    DELETE: 'products:delete'
  }),
  DOCTORTESTIMONIAL: definePermissions('DOCTORTESTIMONIAL', {
    READ: 'doctortestimonial:read',
    WRITE: 'doctortestimonial:write',
    DELETE: 'doctortestimonial:delete'
  }),
  DOCTORPROFILE: definePermissions('DOCTORPROFILE', {
    READ: 'doctorprofile:read',
    WRITE: 'doctorprofile:write',
    DELETE: 'doctorprofile:delete'
  }),
  APPOINTMENTS: definePermissions('APPOINTMENTS', {
    READ: 'appointments:read',
    WRITE: 'appointments:write',
    DELETE: 'appointments:delete'
  }),
  MESSAGES: definePermissions('MESSAGES', {
    READ: 'messages:read',
    WRITE: 'messages:write',
    DELETE: 'messages:delete'
  }),
  SETTINGS: definePermissions('SETTINGS', {
    READ: 'settings:read',
    WRITE: 'settings:write'
  }),
  REPORTS: definePermissions('REPORTS', {
    READ: 'reports:read'
  })
} as const

/**
 * Returns all registered permissions as a flat array
 */
export const ALL_PERMISSIONS = Array.from(new Set([
  ...Object.values(_permissions).flatMap(module => Object.values(module)),
  ...Object.keys(allPermissions)
]))

export async function getUserPermissions(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  })

  const permissions = new Set<string>()
  userRoles.forEach((ur) => {
    ur.role.permissions.forEach((p) => {
      permissions.add(p.name)
    })
  })

  return Array.from(permissions)
}

export async function hasPermission(userId: string, permissionName: string) {
  const permissions = await getUserPermissions(userId)
  return permissions.includes(permissionName)
}
