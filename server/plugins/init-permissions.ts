import { prisma } from '../utils/prisma'
import { ALL_PERMISSIONS } from '../utils/permissions'

export default defineNitroPlugin(async (_nitroApp) => {
  try {
    // 1. Sync all permissions
    for (const permissionName of ALL_PERMISSIONS) {
      const [resource, action] = permissionName.split(':')
      if (!resource || !action) continue

      await prisma.permission.upsert({
        where: {
          action_resource: {
            action,
            resource
          }
        },
        update: {},
        create: {
          action,
          resource,
          description: `Permission to ${action} ${resource}`
        }
      })
    }

    // 2. Ensure Admin role exists
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'System Administrator with full access'
      }
    })

    // 3. Assign all permissions to Admin
    const allPermissions = await prisma.permission.findMany()
    await prisma.role.update({
      where: { id: adminRole.id },
      data: {
        permissions: {
          set: allPermissions.map(p => ({ id: p.id }))
        }
      }
    })

    // 4. Migrate 'Admin' (capitalized) users to 'admin' (lowercase) if exists
    // This fixes issues where some services used 'Admin' and others 'admin'
    const oldAdminRole = await prisma.role.findUnique({ where: { name: 'Admin' } })
    if (oldAdminRole && oldAdminRole.id !== adminRole.id) {
      const userRoles = await prisma.userRole.findMany({ where: { roleId: oldAdminRole.id } })
      for (const ur of userRoles) {
        // Check if user already has 'admin' role
        const exists = await prisma.userRole.findUnique({
          where: { userId_roleId: { userId: ur.userId, roleId: adminRole.id } }
        })
        if (!exists) {
          console.log(`[Permissions] Migrating user ${ur.userId} from Admin to admin role`)
          await prisma.userRole.create({
            data: { userId: ur.userId, roleId: adminRole.id }
          })
        }
      }
    }
  } catch (error) {
    console.error('[Permissions] Error during initialization:', error)
  }
})
