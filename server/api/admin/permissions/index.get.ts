import { prisma } from '../../../utils/prisma'
import { RoleService } from '../../../services/role.service'

export default defineEventHandler(async () => {
  // await requirePermission(null, null)
  return await RoleService.getAllPermissions()
})
